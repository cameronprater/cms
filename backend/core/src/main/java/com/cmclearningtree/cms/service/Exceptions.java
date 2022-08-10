package com.cmclearningtree.cms.service;

import static io.quarkus.runtime.configuration.ProfileManager.QUARKUS_PROFILE_ENV;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Objects;
import java.util.function.Predicate;

import org.eclipse.microprofile.config.ConfigProvider;
import org.eclipse.microprofile.jwt.JsonWebToken;

import com.cmclearningtree.cms.User;

import io.quarkus.arc.Arc;
import io.quarkus.runtime.LaunchMode;
import io.smallrye.mutiny.Uni;

public class Exceptions {
    private static final Predicate<Throwable> IS_NO_REFERENCED_USER = e -> {
        Throwable cause = e.getCause();
        if (cause == null) {
            return false;
        }
        return cause.getClass() == SQLIntegrityConstraintViolationException.class &&
                e.getMessage().matches(
                        ".+Cannot add or update a child row: a foreign key constraint fails.+REFERENCES `user`.+");
    };

    private static <T> T getBean(Class<T> type) {
        return Arc.container().instance(type).get();
    }

    public static <T> Uni<T> recoverFromNoUser(Uni<T> uni) {
        return uni.onFailure(IS_NO_REFERENCED_USER)
                .recoverWithUni(e -> {
                    String namespace = ConfigProvider.getConfig().getValue("quarkus.oidc.token.audience", String.class);
                    String uuid = getBean(JsonWebToken.class).getClaim(namespace + "/uuid");
                    if (Objects.equals(System.getenv(QUARKUS_PROFILE_ENV), LaunchMode.DEVELOPMENT.getDefaultProfile())) {
                        User user = new User();
                        user.setId(uuid);
                        user.setEmail("foo");
                        user.setName("alicia");
                        user.setPicture("bar");
                        return getBean(UserService.class).createUser(user).replaceWith(uni);
                    }
                    return Uni.createFrom().failure(new IllegalStateException(
                            String.format("User %s does not exist in the DB, please try re-logging in", uuid), e));
                });
    }

    public static class NoResultsException extends RuntimeException {
        public NoResultsException() {
            super();
        }
    }
}
