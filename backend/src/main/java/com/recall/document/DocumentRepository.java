package com.recall.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findAllByKnowledgeSpaceIdOrderByUploadedAtDesc(UUID spaceId);
    Optional<Document> findByIdAndKnowledgeSpaceId(UUID id, UUID spaceId);
    long countByKnowledgeSpaceId(UUID spaceId);
}