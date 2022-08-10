package com.cmclearningtree.cms.service;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.JsonArray;
import javax.json.JsonString;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import com.cmclearningtree.cms.Role;

import io.quarkus.runtime.LaunchMode;

@ApplicationScoped
public class JsonWebTokenHelper {

    @Inject
    JsonWebToken jwt;
    @ConfigProperty(name = "quarkus.oidc.token.audience")
    String namespace;

    public Set<Role> getRoles() {
        Stream<String> roles;
        if (LaunchMode.current() == LaunchMode.TEST) {
            roles = jwt.getGroups().stream();
        } else {
            roles = jwt.<JsonArray> getClaim(namespace + "/roles")
                    .getValuesAs(JsonString.class)
                    .stream()
                    .map(JsonString::getString);
        }
        return roles.map(Role::from).collect(Collectors.toSet());
    }

    public String getUuid() {
        return jwt.getClaim(namespace + "/uuid");
    }
}
