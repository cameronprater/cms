package com.cmclearningtree.cms.service;

import java.util.UUID;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.BadRequestException;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.User;
import com.cmclearningtree.cms.data.UserDao;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class UserService {

    @Inject
    Jdbi jdbi;

    public Uni<User> createUser(User user) {
        return Uni.createFrom().voidItem()
                .invoke(() -> jdbi.useExtension(UserDao.class, dao -> dao.insertUser(user)))
                .replaceWith(getUser(user.getId()));
    }

    public Uni<User> getUser(String userId) {
        return Uni.createFrom().item(() -> UUID.fromString(userId))
                .onFailure(IllegalArgumentException.class).transform(BadRequestException::new)
                .replaceWith(Uni.createFrom()
                        .optional(() -> jdbi.withExtension(UserDao.class, dao -> dao.findUserById(userId))))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new);
    }

    public Uni<Void> updateUser(User user) {
        return getUser(user.getId())
                .invoke(() -> jdbi.useExtension(UserDao.class, dao -> dao.updateUser(user)))
                .replaceWithVoid();
    }
}
