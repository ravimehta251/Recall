package com.recall.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService service;

    @GetMapping("/spaces/{spaceId}/sessions")
    List<ChatService.SessionResponse> listSessions(@PathVariable UUID spaceId) {
        return service.listSessions(spaceId);
    }

    @PostMapping("/spaces/{spaceId}/sessions")
    ResponseEntity<ChatService.SessionResponse> createSession(@PathVariable UUID spaceId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSession(spaceId));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    List<ChatService.MessageResponse> history(@PathVariable UUID sessionId) {
        return service.history(sessionId);
    }

    @PostMapping(value = "/sessions/{sessionId}/messages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    Flux<ServerSentEvent<String>> send(@PathVariable UUID sessionId, @Valid @RequestBody MessageRequest request) {
        return service.stream(service.prepareStream(sessionId, request.content()));
    }

    public record MessageRequest(@NotBlank @Size(max = 8000) String content) {}
}