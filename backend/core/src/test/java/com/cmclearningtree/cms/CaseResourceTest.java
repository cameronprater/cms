package com.cmclearningtree.cms;

import static com.cmclearningtree.cms.ResourceTestHelper.*;

import javax.inject.Inject;

import org.eclipse.microprofile.jwt.JsonWebToken;
import org.hamcrest.Matchers;
import org.jdbi.v3.core.Handle;
import org.jdbi.v3.core.Jdbi;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.cmclearningtree.cms.data.CaseDao;
import com.cmclearningtree.cms.data.ChildDao;
import com.cmclearningtree.cms.data.PersonDao;
import com.cmclearningtree.cms.rest.CaseResource;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.common.http.TestHTTPEndpoint;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.oidc.Claim;
import io.quarkus.test.security.oidc.OidcSecurity;
import io.restassured.RestAssured;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;

@QuarkusTest
@QuarkusTestResource(MariaDBTestResourceLifecycleManager.class)
@TestHTTPEndpoint(CaseResource.class)
@TestSecurity(user = "alice", roles = "customer-service")
@OidcSecurity(claims = {
        @Claim(key = "http://localhost:8080/api/uuid", value = "00112233-4455-6677-8899-aabbccddeeff")
})
public class CaseResourceTest {

    @Inject
    Jdbi jdbi;
    @Inject
    JsonWebToken jwt;

    private static Person insertPerson(Handle handle, String name, String uuid) {
        Person person = new Person();
        person.setName(name);
        handle.attach(PersonDao.class).insertPerson(person, uuid);
        return person;
    }

    private static Child insertChild(Handle handle, String childName, String parentName, String uuid) {
        int childId = insertPerson(handle, childName, uuid).getId();
        Person parent = insertPerson(handle, parentName, uuid);
        Child child = new Child();
        child.setId(childId);
        child.setParent(parent);
        handle.attach(ChildDao.class).insertChild(child, uuid);
        return child;
    }

    public static int insertCase(Jdbi jdbi, String childName, String parentName, String uuid) {
        return jdbi.inTransaction(handle -> insertCase(handle, childName, parentName, uuid));
    }

    public static int insertCase(Handle handle, String childName, String parentName, String uuid) {
        Child child = insertChild(handle, childName, parentName, uuid);
        Case _case = new Case();
        _case.setChild(child);
        handle.attach(CaseDao.class).insertCase(_case, uuid);
        return child.getId();
    }

    @BeforeEach
    public void setup() {
        insertUser(jdbi, jwt);
    }

    @Test
    public void createCaseTest() {
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .contentType(ContentType.JSON)
                .body("{\"child\":{\"name\":\"alice\",\"parent\":{\"name\":\"bob\"}}}")
                .when().post()
                .then()
                .statusCode(200);
    }

    @Test
    public void getCaseTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .when().get("/" + id)
                .then()
                .statusCode(200);
    }

    @Test
    public void getCasesTest() {
        CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        CaseResourceTest.insertCase(jdbi, "charlie", "david", getUuid(jwt));
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .when().get()
                .then()
                .statusCode(200);
    }

    @Test
    public void updateCaseTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        RestAssured.given()
                .contentType(ContentType.JSON)
                .body("{\"child\":{\"name\":\"charlie\",\"parent\":{\"name\":\"david\"}}}")
                .when().put("/" + id)
                .then()
                .statusCode(204);
        RestAssured.given()
                .filter(new ResponseLoggingFilter())
                .contentType(ContentType.JSON)
                .when().get("/" + id)
                .then()
                .body("child.name", Matchers.is("charlie"))
                .body("child.parent.name", Matchers.is("david"));
    }

    @Test
    public void closeOrReopenCaseTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        RestAssured.given()
                .when().post("/" + id + "/close")
                .then()
                .statusCode(204);
    }

    @Test
    public void transitionCaseTest() {
        int id = CaseResourceTest.insertCase(jdbi, "alice", "bob", getUuid(jwt));
        RestAssured.given()
                .when().post("/" + id + "/state/PARENT_OUTREACH")
                .then()
                .statusCode(403);
    }
}
