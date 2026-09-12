package com.recall.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatMessageWriter {
    private final ChatMessageRepository messages;

    @Transactional
    public void saveAssistant(ChatSession session, String content, String citationsJson) {
        ChatMessage assistant = new ChatMessage();
        assistant.setChatSession(session);
        assistant.setRole(ChatMessage.Role.ASSISTANT);
        assistant.setContent(content);
        assistant.setCitationsJson(citationsJson);
        messages.save(assistant);
    }
}