package com.cmclearningtree.cms.auth;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import com.cmclearningtree.cms.config.CmsConfig;
import com.cmclearningtree.cms.config.CmsConfig.Auth0Config;

import io.quarkus.security.AuthenticationFailedException;
import io.quarkus.security.credential.PasswordCredential;
import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.IdentityProvider;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.request.UsernamePasswordAuthenticationRequest;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CmsConfigIdentityProvider implements IdentityProvider<UsernamePasswordAuthenticationRequest> {

    @Inject
    CmsConfig config;

    @Override
    public Class<UsernamePasswordAuthenticationRequest> getRequestType() {
        return UsernamePasswordAuthenticationRequest.class;
    }

    @Override
    public Uni<SecurityIdentity> authenticate(UsernamePasswordAuthenticationRequest req, AuthenticationRequestContext ctx) {
        return Uni.createFrom().item(() -> {
            String username = req.getUsername();
            PasswordCredential password = req.getPassword();
            Auth0Config auth0 = config.auth0();
            if (!username.equals(auth0.username()) && !new String(password.getPassword()).equals(auth0.password())) {
                throw new AuthenticationFailedException();
            }
            return QuarkusSecurityIdentity.builder()
                    .setPrincipal(() -> username)
                    .addCredential(password)
                    .addRole("auth0")
                    .build();
        });
    }
}
