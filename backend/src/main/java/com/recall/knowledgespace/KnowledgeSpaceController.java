package com.recall.knowledgespace;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/spaces")
@RequiredArgsConstructor
public class KnowledgeSpaceController {
    private final KnowledgeSpaceService service;

    @GetMapping
    List<SpaceResponse> list() {
        return service.list();
    }

    @PostMapping
    ResponseEntity<SpaceResponse> create(@Valid @RequestBody SpaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @DeleteMapping("/{spaceId}")
    ResponseEntity<Void> delete(@PathVariable UUID spaceId) {
        service.delete(spaceId);
        return ResponseEntity.noContent().build();
    }

    public record SpaceRequest(@NotBlank @Size(max = 120) String name, @Size(max = 1000) String description) {}
    public record SpaceResponse(UUID id, String name, String description, long documentCount, Instant createdAt) {}
}