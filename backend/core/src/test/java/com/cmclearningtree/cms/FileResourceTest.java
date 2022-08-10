package com.cmclearningtree.cms;

import static com.cmclearningtree.cms.ResourceTestHelper.*;

import java.io.File;
import java.nio.file.Files;
import java.util.Set;

import javax.inject.Inject;

import org.apache.commons.io.FilenameUtils;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jdbi.v3.core.Jdbi;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.cmclearningtree.cms.data.FileDao;
import com.cmclearningtree.cms.rest.FileResource;

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
import io.smallrye.mutiny.unchecked.Unchecked;

@QuarkusTest
@QuarkusTestResource(MariaDBTestResourceLifecycleManager.class)
@TestHTTPEndpoint(FileResource.class)
@TestSecurity(user = "alice", roles = "customer-service")
@OidcSecurity(claims = {
        @Claim(key = "http://localhost:8080/api/uuid", value = "00112233-4455-6677-8899-aabbccddeeff")
})
public class FileResourceTest {
    private static final String DIR = "src/test/resources/";

    @Inject
    Jdbi jdbi;
    @Inject
    JsonWebToken jwt;

    private static Tuple2<Integer, Integer> insertFile(Jdbi jdbi, File file, String uuid) {
        return jdbi.inTransaction(handle -> {
            int caseId = CaseResourceTest.insertCase(handle, "alice", "bob", uuid);
            com.cmclearningtree.cms.File f = new com.cmclearningtree.cms.File();
            f.setName(file.getName());
            f.setExtension(FilenameUtils.getExtension(file.getName()));
            f.setData(Unchecked.supplier(() -> Files.readAllBytes(file.toPath())).get());
            f.setPermissions(Set.of(Role.CUSTOMER_SERVICE));

            handle.attach(FileDao.class).insertFile(f, caseId, uuid);
            return Tuple2.of(caseId, f.getId());
        });
    }

    @BeforeEach
    public void setup() {
        insertUser(jdbi, jwt);
    }

    @Test
    public void createFileTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        String json = "{\"description\":\"Standard parent questionnaire\",\"permissions\":[\"CLINICAL_DIRECTOR\"]}";

        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .pathParam("caseId", id)
                .contentType(ContentType.MULTIPART)
                .multiPart("data", new File(DIR + "parent-questionnaire.pdf"))
                .multiPart("metadata", "blob", json.getBytes())
                .when().post()
                .then()
                .statusCode(200);
    }

    @Test
    public void getFileTest() {
        Tuple2<Integer, Integer> ids = insertFile(jdbi, new File(DIR + "parent-questionnaire.pdf"), getUuid(jwt));
        RestAssured.given()
                .pathParam("caseId", ids.getItem1())
                .when().get("/" + ids.getItem2())
                .then()
                .statusCode(200);
    }

    @Test
    public void updateFileTest() {
        Tuple2<Integer, Integer> ids = insertFile(jdbi, new File(DIR + "parent-questionnaire.pdf"), getUuid(jwt));
        String json = "{\"description\":\"Parent questionnaire for babies\",\"permissions\":[\"CLINICAL_DIRECTOR\"]}";

        RestAssured.given()
                .pathParam("caseId", ids.getItem1())
                .contentType(ContentType.MULTIPART)
                .multiPart("data", new File(DIR + "parent-questionnaire-babies.pdf"))
                .multiPart("metadata", "blob", json.getBytes())
                .when().put("/" + ids.getItem2())
                .then()
                .statusCode(204);
    }

    @Test
    public void deleteFileTest() {
        Tuple2<Integer, Integer> ids = insertFile(jdbi, new File(DIR + "parent-questionnaire.pdf"), getUuid(jwt));
        RestAssured.given()
                .pathParam("caseId", ids.getItem1())
                .when().delete("/" + ids.getItem2())
                .then()
                .statusCode(204);
    }
}
