package com.recall.document;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/spaces/{spaceId}/documents")
public class DocumentController {
    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    public DocumentService.DocumentResponse upload(@PathVariable UUID spaceId,
                                                   @RequestPart("file") MultipartFile file) throws IOException {
        return service.upload(spaceId, file);
    }

    @GetMapping
    public List<DocumentService.DocumentResponse> list(@PathVariable UUID spaceId) {
        return service.list(spaceId);
    }

    @GetMapping("/{documentId}/status")
    public DocumentService.StatusResponse status(@PathVariable UUID spaceId, @PathVariable UUID documentId) {
        return service.status(spaceId, documentId);
    }

    @DeleteMapping("/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID spaceId, @PathVariable UUID documentId) {
        service.delete(spaceId, documentId);
    }
}