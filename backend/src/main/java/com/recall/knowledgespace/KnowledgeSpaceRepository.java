package com.recall.knowledgespace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KnowledgeSpaceRepository extends JpaRepository<KnowledgeSpace, UUID> {
    List<KnowledgeSpace> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<KnowledgeSpace> findByIdAndUserId(UUID id, UUID userId);
}