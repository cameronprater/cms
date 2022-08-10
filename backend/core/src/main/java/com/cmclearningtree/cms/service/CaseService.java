package com.cmclearningtree.cms.service;

import java.util.Collections;
import java.util.Set;

import javax.enterprise.context.RequestScoped;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.Case;
import com.cmclearningtree.cms.Case.State;
import com.cmclearningtree.cms.Child;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.config.CmsConfig;
import com.cmclearningtree.cms.data.CaseDao;

import io.quarkus.security.ForbiddenException;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;

@RequestScoped
public class CaseService {
    private final Jdbi jdbi;
    private final Set<Role> roles;
    private final String uuid;
    private final CmsConfig config;
    private final ChildService childService;

    public CaseService(Jdbi jdbi, JsonWebTokenHelper jwtHelper, CmsConfig config, ChildService childService) {
        this.jdbi = jdbi;
        this.roles = jwtHelper.getRoles();
        this.uuid = jwtHelper.getUuid();
        this.config = config;
        this.childService = childService;
    }

    private void filterCommentsAndFiles(Case _case) {
        _case.getComments().removeIf(comment -> Collections.disjoint(comment.getPermissions(), roles));
        _case.getFiles().removeIf(file -> Collections.disjoint(file.getPermissions(), roles));
    }

    private Uni<Void> verifyCaseStateTransition(State oldState, State newState) {
        String role = config.caseStates().get(oldState.getValue()).transition().get(newState.getValue());
        if (role != null && !roles.contains(Role.from(role))) {
            return Uni.createFrom().failure(ForbiddenException::new);
        }
        return Uni.createFrom().voidItem();
    }

    public Uni<Case> createCase(Case _case) {
        return childService.createChild(_case.getChild())
                .invoke(() -> jdbi.useExtension(CaseDao.class, dao -> dao.insertCase(_case, uuid)))
                .stage(Exceptions::recoverFromNoUser)
                .replaceWith(Uni.createFrom().deferred(() -> getCase(_case.getChild().getId())));
    }

    public Uni<Case> getCase(int id) {
        return Uni.createFrom().optional(() -> jdbi.withExtension(CaseDao.class, dao -> dao.findCaseById(id)))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new)
                .invoke(this::filterCommentsAndFiles);
    }

    public Multi<Case> getCases() {
        return Multi.createFrom().iterable(jdbi.withExtension(CaseDao.class, CaseDao::listCases))
                .invoke(this::filterCommentsAndFiles);
    }

    public Uni<Void> updateCase(Case _case) {
        Child child = _case.getChild();
        return getCase(child.getId())
                .replaceWith(childService.updateChild(child));
    }

    public Uni<Void> closeOrReopenCase(int id) {
        return getCase(id)
                .invoke(result -> result.setClosed(!result.getClosed()))
                .flatMap(result -> Uni.createFrom().voidItem()
                        .invoke(() -> jdbi.useExtension(CaseDao.class, dao -> dao.updateCase(result, uuid)))
                        .stage(Exceptions::recoverFromNoUser));
    }

    public Uni<Void> updateCaseState(int id, State state) {
        return getCase(id)
                .call(result -> verifyCaseStateTransition(result.getState(), state))
                .invoke(result -> result.setState(state))
                .flatMap(result -> Uni.createFrom().voidItem()
                        .invoke(() -> jdbi.useExtension(CaseDao.class, dao -> dao.updateCase(result, uuid)))
                        .stage(Exceptions::recoverFromNoUser));
    }
}
