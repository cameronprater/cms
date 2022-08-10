package com.cmclearningtree.cms.config;

import java.util.Map;

import io.smallrye.config.ConfigMapping;

@ConfigMapping(prefix = "app")
public interface CmsConfig {

    Auth0Config auth0();

    Map<String, CaseStateConfig> caseStates();

    interface Auth0Config {
        String username();

        String password();
    }

    interface CaseStateConfig {
        Map<String, String> transition();
    }
}
