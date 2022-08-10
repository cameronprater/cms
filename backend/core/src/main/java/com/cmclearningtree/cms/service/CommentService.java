package com.cmclearningtree.cms.service;

import java.util.Collections;
import java.util.Set;

import javax.enterprise.context.RequestScoped;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.data.CommentDao;

import io.quarkus.security.ForbiddenException;
import io.smallrye.mutiny.Uni;

@RequestScoped
public class CommentService {
    private final Jdbi jdbi;
    private final Set<Role> roles;
    private final String uuid;
    private final CaseService caseService;

    public CommentService(Jdbi jdbi, JsonWebTokenHelper jwtHelper, CaseService caseService) {
        this.jdbi = jdbi;
        this.roles = jwtHelper.getRoles();
        this.uuid = jwtHelper.getUuid();
        this.caseService = caseService;
    }

    private Uni<Void> failIfNotAuthor(Comment comment) {
        if (!comment.getAuthor().getId().equals(uuid)) {
            return Uni.createFrom().failure(ForbiddenException::new);
        }
        return Uni.createFrom().voidItem();
    }

    public Uni<Comment> createComment(int caseId, Comment comment) {
        return caseService.getCase(caseId)
                .invoke(() -> comment.getPermissions().addAll(roles))
                .invoke(() -> jdbi.useExtension(CommentDao.class, dao -> dao.insertComment(comment, caseId, uuid)))
                .stage(Exceptions::recoverFromNoUser)
                .replaceWith(Uni.createFrom().deferred(() -> getComment(caseId, comment.getId())));
    }

    public Uni<Comment> getComment(int caseId, int commentId) {
        return caseService.getCase(caseId)
                .replaceWith(
                        Uni.createFrom()
                                .optional(() -> jdbi.withExtension(CommentDao.class, dao -> dao.findCommentById(commentId))))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new)
                .call(comment -> {
                    if (Collections.disjoint(comment.getPermissions(), roles)) {
                        return Uni.createFrom().failure(ForbiddenException::new);
                    }
                    return Uni.createFrom().voidItem();
                });
    }

    public Uni<Void> updateComment(int caseId, Comment comment) {
        return getComment(caseId, comment.getId())
                .call(this::failIfNotAuthor)
                .invoke(() -> comment.getPermissions().addAll(roles))
                .flatMap(result -> {
                    Uni<Void> uni = Uni.createFrom().voidItem();
                    if (!result.equals(comment)) {
                        return uni
                                .invoke(() -> jdbi.useExtension(CommentDao.class, dao -> dao.updateComment(comment, uuid)))
                                .stage(Exceptions::recoverFromNoUser);
                    }
                    return uni;
                });
    }

    public Uni<Void> deleteComment(int caseId, int commentId) {
        return getComment(caseId, commentId)
                .call(this::failIfNotAuthor)
                .invoke(() -> jdbi.useExtension(CommentDao.class, dao -> dao.deleteCommentById(commentId)))
                .replaceWithVoid();
    }
}
