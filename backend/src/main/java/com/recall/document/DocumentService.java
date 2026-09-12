package com.recall.document;

import com.recall.common.exception.ApiException;
import com.recall.document.ingestion.DocumentIngestionPipeline;
import com.recall.knowledgespace.KnowledgeSpace;
import com.recall.knowledgespace.KnowledgeSpaceService;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {
    private static final long MAX_SIZE = 20L * 1024 * 1024;
    private static final Set<String> EXTENSIONS = Set.of("pdf", "docx", "txt");
    private static final Set<String> CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/octet-stream");

    private final DocumentRepository documents;
    private final KnowledgeSpaceService spaces;
    private final DocumentIngestionPipeline ingestion;
    private final VectorStore vectorStore;

    public DocumentService(DocumentRepository documents, KnowledgeSpaceService spaces,
                           DocumentIngestionPipeline ingestion, VectorStore vectorStore) {
        this.documents = documents;
        this.spaces = spaces;
        this.ingestion = ingestion;
        this.vectorStore = vectorStore;
    }

    @Transactional
    public DocumentResponse upload(UUID spaceId, MultipartFile file) throws IOException {
        KnowledgeSpace space = spaces.requireOwned(spaceId);
        validate(file);
        String filename = file.getOriginalFilename();
        Document document = new Document();
        document.setKnowledgeSpace(space);
        document.setFilename(filename);
        document.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        document.setSizeBytes(file.getSize());
        documents.save(document);
        byte[] bytes = file.getBytes();
        ingestion.ingest(document.getId(), spaceId, filename, bytes);
        return response(document);
    }

    public List<DocumentResponse> list(UUID spaceId) {
        spaces.requireOwned(spaceId);
        return documents.findAllByKnowledgeSpaceIdOrderByUploadedAtDesc(spaceId).stream().map(this::response).toList();
    }

    public StatusResponse status(UUID spaceId, UUID documentId) {
        spaces.requireOwned(spaceId);
        Document document = requireInSpace(documentId, spaceId);
        return new StatusResponse(document.getStatus(), document.getErrorMessage());
    }

    @Transactional
    public void delete(UUID spaceId, UUID documentId) {
        spaces.requireOwned(spaceId);
        Document document = requireInSpace(documentId, spaceId);
        vectorStore.delete("document_id == '" + documentId + "'");
        documents.delete(document);
    }

    private Document requireInSpace(UUID documentId, UUID spaceId) {
        return documents.findByIdAndKnowledgeSpaceId(documentId, spaceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found"));
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A non-empty file is required");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File size exceeds 20MB limit");
        }
        String filename = file.getOriginalFilename();
        int dot = filename.lastIndexOf('.');
        String extension = dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
        String contentType = file.getContentType();
        if (!EXTENSIONS.contains(extension) || (contentType != null && !CONTENT_TYPES.contains(contentType))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF, DOCX, and TXT files are supported");
        }
    }

    private DocumentResponse response(Document document) {
        return new DocumentResponse(document.getId(), document.getFilename(), document.getContentType(),
                document.getSizeBytes(), document.getStatus(), document.getErrorMessage(), document.getUploadedAt());
    }

    public record DocumentResponse(UUID id, String filename, String contentType, long sizeBytes,
                                   Document.Status status, String errorMessage, Instant uploadedAt) {
    }

    public record StatusResponse(Document.Status status, String errorMessage) {
    }
}