package com.cmclearningtree.cms;

import java.io.File;
import java.util.Map;

import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.DockerComposeContainer.RemoveImages;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;

public class MariaDBTestResourceLifecycleManager implements QuarkusTestResourceLifecycleManager {
    private static final String MARIADB = "mariadb";
    private static final int MARIADB_PORT = 3306;
    private DockerComposeContainer<?> dockerCompose;

    @Override
    public Map<String, String> start() {
        dockerCompose = new DockerComposeContainer<>(new File("../docker-compose.yml"), new File("../docker-compose.test.yml"))
                .withExposedService(MARIADB, MARIADB_PORT)
                .withLocalCompose(true)
                .withOptions("--compatibility")
                .withServices(MARIADB)
                .withRemoveImages(RemoveImages.LOCAL);
        dockerCompose.start();

        String url = String.format("jdbc:mariadb://%s:%d/cmc_learning_tree",
                dockerCompose.getServiceHost(MARIADB, MARIADB_PORT), dockerCompose.getServicePort(MARIADB, MARIADB_PORT));
        return Map.of(
                "quarkus.datasource.username", "dba",
                "quarkus.datasource.password", "GorH4l%^ztKi",
                "quarkus.datasource.jdbc.url", url,
                "quarkus.oidc.token.audience", "http://localhost:8080/api",
                "app.auth0.username", "username",
                "app.auth0.password", "password");
    }

    @Override
    public void stop() {
        dockerCompose.stop();
    }
}
