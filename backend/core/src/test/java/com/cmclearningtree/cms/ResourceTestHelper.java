package com.cmclearningtree.cms;

import java.sql.SQLIntegrityConstraintViolationException;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.core.statement.UnableToExecuteStatementException;

public class ResourceTestHelper {

    public static String getUuid(JsonWebToken jwt) {
        return jwt.getClaim("http://localhost:8080/api/uuid");
    }

    public static void insertUser(Jdbi jdbi, JsonWebToken jwt) {
        jdbi.useHandle(
                handle -> {
                    try {
                        handle.createUpdate("INSERT INTO `user` (id, email, name, picture) VALUES (:id, 'foo', :name, 'bar')")
                                .bind("id", getUuid(jwt))
                                .bind("name", jwt.getName())
                                .execute();
                    } catch (UnableToExecuteStatementException e) {
                        if (e.getCause().getClass() != SQLIntegrityConstraintViolationException.class ||
                                !e.getMessage().matches(".+Duplicate entry '.+' for key 'PRIMARY'.+")) {
                            throw e;
                        }
                    }
                });
    }
}
