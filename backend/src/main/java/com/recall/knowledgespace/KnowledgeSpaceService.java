package com.recall.knowledgespace;

import com.recall.auth.CurrentUserService;
import com.recall.common.exception.ApiException;
import com.recall.document.DocumentRepository;
import com.recall.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeSpaceService {
    private final KnowledgeSpaceRepository spaces;
    private final DocumentRepository documents;
    private final CurrentUserService currentUser;
    private final VectorStore vectorStore;

    @Transactional(readOnly = true)
    public List<KnowledgeSpaceController.SpaceResponse> list() {
        User user = currentUser.get();
        return spaces.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::response).toList();
    }

    @Transactional
    public KnowledgeSpaceController.SpaceResponse create(KnowledgeSpaceController.SpaceRequest request) {
        KnowledgeSpace space = new KnowledgeSpace();
        space.setUser(currentUser.get());
        space.setName(request.name().trim());
        space.setDescription(request.description() == null ? "" : request.description().trim());
        return response(spaces.save(space));
    }

    @Transactional
    public void delete(UUID id) {
        KnowledgeSpace space = requireOwned(id);
        vectorStore.delete("knowledge_space_id == '" + id + "'");
        spaces.delete(space);
    }

    @Transactional(readOnly = true)
    public KnowledgeSpace requireOwned(UUID id) {
        return spaces.findByIdAndUserId(id, currentUser.get().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Knowledge space not found"));
    }

    private KnowledgeSpaceController.SpaceResponse response(KnowledgeSpace space) {
        return new KnowledgeSpaceController.SpaceResponse(space.getId(), space.getName(), space.getDescription(),
                documents.countByKnowledgeSpaceId(space.getId()), space.getCreatedAt());
    }
}