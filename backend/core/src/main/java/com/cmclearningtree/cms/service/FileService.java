package com.cmclearningtree.cms.service;

import java.util.Collections;
import java.util.Set;

import javax.enterprise.context.RequestScoped;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.data.FileDao;

import io.quarkus.security.ForbiddenException;
import io.smallrye.mutiny.Uni;

@RequestScoped
public class FileService {
    private final Jdbi jdbi;
    private final Set<Role> roles;
    private final String uuid;
    private final CaseService caseService;

    public FileService(Jdbi jdbi, JsonWebTokenHelper jwtHelper, CaseService caseService) {
        this.jdbi = jdbi;
        this.roles = jwtHelper.getRoles();
        this.uuid = jwtHelper.getUuid();
        this.caseService = caseService;
    }

    private Uni<Void> failIfNotAuthor(File file) {
        if (!file.getAuthor().getId().equals(uuid)) {
            return Uni.createFrom().failure(ForbiddenException::new);
        }
        return Uni.createFrom().voidItem();
    }

    public Uni<File> createFile(int caseId, File file) {
        return caseService.getCase(caseId)
                .invoke(() -> file.getPermissions().addAll(roles))
                .invoke(() -> jdbi.useExtension(FileDao.class, dao -> dao.insertFile(file, caseId, uuid)))
                .stage(Exceptions::recoverFromNoUser)
                .replaceWith(Uni.createFrom().deferred(() -> getFile(caseId, file.getId())));
    }

    public Uni<File> getFile(int caseId, int fileId) {
        return caseService.getCase(caseId)
                .replaceWith(
                        Uni.createFrom().optional(() -> jdbi.withExtension(FileDao.class, dao -> dao.findFileById(fileId))))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new)
                .call(file -> {
                    if (Collections.disjoint(file.getPermissions(), roles)) {
                        return Uni.createFrom().failure(ForbiddenException::new);
                    }
                    return Uni.createFrom().voidItem();
                });
    }

    public Uni<Void> updateFile(int caseId, File file) {
        return getFile(caseId, file.getId())
                .call(this::failIfNotAuthor)
                .invoke(() -> file.getPermissions().addAll(roles))
                .flatMap(result -> {
                    Uni<Void> uni = Uni.createFrom().voidItem();
                    if (!result.equals(file)) {
                        return uni.invoke(() -> jdbi.useExtension(FileDao.class, dao -> dao.updateFile(file, uuid)))
                                .stage(Exceptions::recoverFromNoUser);
                    }
                    return uni;
                });
    }

    public Uni<Void> deleteFile(int caseId, int fileId) {
        return getFile(caseId, fileId)
                .call(this::failIfNotAuthor)
                .invoke(() -> jdbi.useExtension(FileDao.class, dao -> dao.deleteFileById(fileId)))
                .replaceWithVoid();
    }
}
