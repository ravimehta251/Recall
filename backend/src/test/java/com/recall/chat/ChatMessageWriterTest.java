package com.recall.chat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ChatMessageWriterTest {
    @Mock private ChatMessageRepository messages;

    @Test
    void savesCompletedAssistantResponseAndCitations() {
        ChatSession session = new ChatSession();
        ChatMessageWriter writer = new ChatMessageWriter(messages);

        writer.saveAssistant(session, "Grounded answer", "[{\"filename\":\"guide.pdf\"}]");

        ArgumentCaptor<ChatMessage> saved = ArgumentCaptor.forClass(ChatMessage.class);
        verify(messages).save(saved.capture());
        assertThat(saved.getValue().getChatSession()).isSameAs(session);
        assertThat(saved.getValue().getRole()).isEqualTo(ChatMessage.Role.ASSISTANT);
        assertThat(saved.getValue().getContent()).isEqualTo("Grounded answer");
        assertThat(saved.getValue().getCitationsJson()).contains("guide.pdf");
    }
}