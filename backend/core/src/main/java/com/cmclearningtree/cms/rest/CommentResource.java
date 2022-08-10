package com.cmclearningtree.cms.rest;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.DELETE;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;

import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.service.CommentService;

import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;

@Path("/api/cases/{caseId}/comments")
public class CommentResource {

    @Inject
    CommentService commentService;

    @POST
    @Authenticated
    public Uni<Comment> createComment(int caseId, @NotNull @Valid Comment comment) {
        return commentService.createComment(caseId, comment);
    }

    @PUT
    @Path("/{commentId}")
    @Authenticated
    public Uni<Void> updateComment(int caseId, int commentId, @NotNull @Valid Comment comment) {
        comment.setId(commentId);
        return commentService.updateComment(caseId, comment);
    }

    @DELETE
    @Path("/{commentId}")
    @Authenticated
    public Uni<Void> deleteComment(int caseId, int commentId) {
        return commentService.deleteComment(caseId, commentId);
    }
}
