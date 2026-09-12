package com.recall.document.ingestion;

import com.recall.document.DocumentRepository;
import com.recall.document.DocumentStatusUpdater;
import java.util.List;
import java.util.UUID;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentIngestionPipeline {
    private final DocumentStatusUpdater statusUpdater;
    private final VectorStore vectorStore;
    private final TokenTextSplitter splitter = TokenTextSplitter.builder()
            .withChunkSize(500).withMinChunkSizeChars(100).withMinChunkLengthToEmbed(20).build();

    public DocumentIngestionPipeline(DocumentStatusUpdater statusUpdater, VectorStore vectorStore) {
        this.statusUpdater = statusUpdater;
        this.vectorStore = vectorStore;
    }

    @Async("ingestionExecutor")
    public void ingest(UUID documentId, UUID spaceId, String filename, byte[] bytes) {
        statusUpdater.update(documentId, com.recall.document.Document.Status.PROCESSING, null);
        try {
            ByteArrayResource resource = new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
            List<Document> chunks = splitter.apply(new TikaDocumentReader(resource).get());
            if (chunks.isEmpty()) {
                throw new IllegalArgumentException("No readable text was found in this document");
            }
            for (int index = 0; index < chunks.size(); index++) {
                Document chunk = chunks.get(index);
                chunk.getMetadata().put("document_id", documentId.toString());
                chunk.getMetadata().put("knowledge_space_id", spaceId.toString());
                chunk.getMetadata().put("filename", filename);
                chunk.getMetadata().put("chunk_index", index);
            }
            vectorStore.add(chunks);
            statusUpdater.update(documentId, com.recall.document.Document.Status.READY, null);
        } catch (Exception exception) {
            statusUpdater.update(documentId, com.recall.document.Document.Status.FAILED,
                    exception.getMessage() == null ? "Document processing failed" : exception.getMessage());
        }
    }
}