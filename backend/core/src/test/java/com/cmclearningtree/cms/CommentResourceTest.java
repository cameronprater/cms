package com.cmclearningtree.cms;

import static com.cmclearningtree.cms.ResourceTestHelper.*;

import java.util.Set;

import javax.inject.Inject;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jdbi.v3.core.Jdbi;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.cmclearningtree.cms.data.CommentDao;
import com.cmclearningtree.cms.rest.CommentResource;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.common.http.TestHTTPEndpoint;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.oidc.Claim;
import io.quarkus.test.security.oidc.OidcSecurity;
import io.restassured.RestAssured;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.smallrye.mutiny.tuples.Tuple2;

@QuarkusTest
@QuarkusTestResource(MariaDBTestResourceLifecycleManager.class)
@TestHTTPEndpoint(CommentResource.class)
@TestSecurity(user = "alice", roles = "customer-service")
@OidcSecurity(claims = {
        @Claim(key = "http://localhost:8080/api/uuid", value = "00112233-4455-6677-8899-aabbccddeeff")
})
public class CommentResourceTest {

    @Inject
    Jdbi jdbi;
    @Inject
    JsonWebToken jwt;

    private static Tuple2<Integer, Integer> insertComment(Jdbi jdbi, String content, String uuid) {
        return jdbi.inTransaction(handle -> {
            int caseId = CaseResourceTest.insertCase(handle, "alice", "bob", uuid);
            Comment comment = new Comment();
            comment.setContent(content);
            comment.setPermissions(Set.of(Role.CUSTOMER_SERVICE));

            handle.attach(CommentDao.class).insertComment(comment, caseId, uuid);
            return Tuple2.of(caseId, comment.getId());
        });
    }

    @BeforeEach
    public void setup() {
        insertUser(jdbi, jwt);
    }

    @Test
    public void createCommentTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .pathParam("caseId", id)
                .contentType(ContentType.JSON)
                .body("{\"content\":\"Hello, World!\", \"permissions\":[\"CLINICAL_DIRECTOR\"]}")
                .when().post()
                .then()
                .statusCode(200);
    }

    @Test
    public void updateCommentTest() {
        Tuple2<Integer, Integer> ids = insertComment(jdbi, "Hello, World!", getUuid(jwt));
        RestAssured.given()
                .pathParam("caseId", ids.getItem1())
                .contentType(ContentType.JSON)
                .body("{\"content\":\"Hola, Mundo!\", \"permissions\":[\"CLINICAL_DIRECTOR\"]}")
                .when().put("/" + ids.getItem2())
                .then()
                .statusCode(204);
    }

    @Test
    public void deleteCommentTest() {
        Tuple2<Integer, Integer> ids = insertComment(jdbi, "Hello, World!", getUuid(jwt));
        RestAssured.given()
                .pathParam("caseId", ids.getItem1())
                .when().delete("/" + ids.getItem2())
                .then()
                .statusCode(204);
    }
}
