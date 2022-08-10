package com.cmclearningtree.cms;

import java.util.UUID;

import javax.inject.Inject;

import org.jdbi.v3.core.Jdbi;
import org.junit.jupiter.api.Test;

import com.cmclearningtree.cms.data.UserDao;
import com.cmclearningtree.cms.rest.UserResource;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.common.http.TestHTTPEndpoint;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;

@QuarkusTest
@QuarkusTestResource(MariaDBTestResourceLifecycleManager.class)
@TestHTTPEndpoint(UserResource.class)
public class UserResourceTest {

    @Inject
    Jdbi jdbi;

    private static String insertUser(Jdbi jdbi) {
        return jdbi.withHandle(handle -> {
            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setEmail("foo");
            user.setName("alicia");
            user.setPicture("bar");

            handle.attach(UserDao.class).insertUser(user);
            return user.getId();
        });
    }

    @Test
    public void createUserTest() {
        String json = String.format("{\"id\":\"%s\",\"email\":\"foo\",\"name\":\"alicia\",\"picture\":\"bar\"}",
                UUID.randomUUID());
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .contentType(ContentType.JSON)
                .body(json)
                .auth().basic("username", "password")
                .when().post()
                .then()
                .statusCode(200);
    }

    @Test
    public void updateUserTest() {
        String id = insertUser(jdbi);
        RestAssured.given()
                .contentType(ContentType.JSON)
                .body(String.format(
                        "{\"id\":\"%s\",\"email\":\"bar\",\"name\":\"bob\",\"picture\":\"foo\",\"active\":false}", id))
                .auth().basic("username", "password")
                .when().put("/" + id)
                .then()
                .statusCode(204);
    }
}
