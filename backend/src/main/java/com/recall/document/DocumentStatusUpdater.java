package com.recall.document;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentStatusUpdater {
    private final DocumentRepository documents;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void update(UUID documentId, Document.Status status, String errorMessage) {
        documents.findById(documentId).ifPresent(document -> {
            document.setStatus(status);
            document.setErrorMessage(errorMessage);
        });
    }
}