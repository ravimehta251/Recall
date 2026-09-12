package com.recall.chat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recall.auth.CurrentUserService;
import com.recall.common.exception.ApiException;
import com.recall.knowledgespace.KnowledgeSpace;
import com.recall.knowledgespace.KnowledgeSpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
    private static final String SYSTEM_PROMPT = """
            You are Recall, a document-grounded assistant. Answer only from the supplied context.
            If the context does not contain enough information, say that clearly. Be concise and accurate.
            Do not invent facts, sources, or citations.
            """;

    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;
    private final ChatMessageWriter messageWriter;
    private final KnowledgeSpaceService spaces;
    private final CurrentUserService currentUser;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<SessionResponse> listSessions(UUID spaceId) {
        KnowledgeSpace space = spaces.requireOwned(spaceId);
        return sessions.findAllByKnowledgeSpaceIdAndUserIdOrderByCreatedAtDesc(
                        space.getId(), currentUser.get().getId()).stream()
                .map(this::sessionResponse)
                .toList();
    }

    @Transactional
    public SessionResponse createSession(UUID spaceId) {
        KnowledgeSpace space = spaces.requireOwned(spaceId);
        ChatSession session = new ChatSession();
        session.setKnowledgeSpace(space);
        session.setUser(currentUser.get());
        return sessionResponse(sessions.save(session));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> history(UUID sessionId) {
        ChatSession session = requireOwnedSession(sessionId);
        return messages.findAllByChatSessionIdOrderByCreatedAtAsc(session.getId()).stream()
                .map(this::messageResponse)
                .toList();
    }

    @Transactional
    public StreamContext prepareStream(UUID sessionId, String content) {
        ChatSession session = requireOwnedSession(sessionId);
        List<ChatMessage> history = messages.findAllByChatSessionIdOrderByCreatedAtAsc(sessionId);

        ChatMessage userMessage = new ChatMessage();
        userMessage.setChatSession(session);
        userMessage.setRole(ChatMessage.Role.USER);
        userMessage.setContent(content.trim());
        messages.save(userMessage);

        if (history.isEmpty()) {
            session.setTitle(titleFrom(content));
        }

        List<Document> relevant = vectorStore.similaritySearch(SearchRequest.builder()
                .query(content)
                .topK(5)
                .similarityThreshold(0.65)
                .filterExpression("knowledge_space_id == '" + session.getKnowledgeSpace().getId() + "'")
                .build());

        return new StreamContext(session, buildPrompt(content, history, relevant), citations(relevant));
    }

    public Flux<ServerSentEvent<String>> stream(StreamContext context) {
        StringBuilder response = new StringBuilder();
        Flux<ServerSentEvent<String>> tokens = chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(context.prompt())
                .stream()
                .content()
                .doOnNext(response::append)
                .map(token -> event("token", Map.of("text", token)))
                .doOnComplete(() -> messageWriter.saveAssistant(
                    context.session(), response.toString(), json(context.citations())));

        return tokens.concatWithValues(
                event("citations", context.citations()),
                event("done", Map.of()));
    }

    private ChatSession requireOwnedSession(UUID sessionId) {
        return sessions.findByIdAndUserId(sessionId, currentUser.get().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chat session not found"));
    }

    private String buildPrompt(String question, List<ChatMessage> history, List<Document> relevant) {
        StringBuilder prompt = new StringBuilder("DOCUMENT CONTEXT:\n");
        if (relevant.isEmpty()) {
            prompt.append("No relevant document context was found.\n");
        } else {
            for (int index = 0; index < relevant.size(); index++) {
                Document document = relevant.get(index);
                prompt.append("[Source ").append(index + 1).append(": ")
                        .append(document.getMetadata().getOrDefault("filename", "Document"))
                        .append("]\n").append(document.getText()).append("\n\n");
            }
        }

        prompt.append("RECENT CONVERSATION:\n");
        history.stream().skip(Math.max(0, history.size() - 8L)).forEach(message ->
                prompt.append(message.getRole()).append(": ").append(message.getContent()).append('\n'));
        prompt.append("\nUSER QUESTION:\n").append(question);
        return prompt.toString();
    }

    private List<Citation> citations(List<Document> relevant) {
        Map<String, Citation> unique = new LinkedHashMap<>();
        for (Document document : relevant) {
            Object documentId = document.getMetadata().get("document_id");
            Object filename = document.getMetadata().get("filename");
            if (documentId != null && filename != null) {
                String text = document.getText() == null ? "" : document.getText().strip();
                String snippet = text.length() > 320 ? text.substring(0, 320) + "..." : text;
                unique.putIfAbsent(documentId.toString(),
                        new Citation(UUID.fromString(documentId.toString()), filename.toString(), snippet));
            }
        }
        return new ArrayList<>(unique.values());
    }

    private MessageResponse messageResponse(ChatMessage message) {
        List<Citation> citations = List.of();
        if (message.getCitationsJson() != null && !message.getCitationsJson().isBlank()) {
            try {
                citations = objectMapper.readValue(message.getCitationsJson(), new TypeReference<>() {});
            } catch (JsonProcessingException exception) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored citations could not be read");
            }
        }
        return new MessageResponse(message.getRole(), message.getContent(), citations, message.getCreatedAt());
    }

    private SessionResponse sessionResponse(ChatSession session) {
        return new SessionResponse(session.getId(), session.getTitle(), session.getCreatedAt());
    }

    private String titleFrom(String content) {
        String title = content.trim().replaceAll("\\s+", " ");
        return title.length() > 60 ? title.substring(0, 57) + "..." : title;
    }

    private ServerSentEvent<String> event(String name, Object data) {
        return ServerSentEvent.<String>builder().event(name).data(json(data)).build();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize response", exception);
        }
    }

    public record SessionResponse(UUID id, String title, Instant createdAt) {}
    public record MessageResponse(ChatMessage.Role role, String content, List<Citation> citations, Instant createdAt) {}
    public record Citation(UUID documentId, String filename, String snippet) {}
    public record StreamContext(ChatSession session, String prompt, List<Citation> citations) {}
}