package com.cmclearningtree.cms;

public enum Role {
    CLINICAL_DIRECTOR("clinical-director"),
    CUSTOMER_SERVICE("customer-service"),
    ACCOUNTING("accounting"),
    REPORTING_ASSISTANT("reporting-assistant"),
    THERAPIST("therapist");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public static Role from(String name) {
        switch (name) {
            case "clinical-director":
                return Role.CLINICAL_DIRECTOR;
            case "customer-service":
                return Role.CUSTOMER_SERVICE;
            case "accounting":
                return Role.ACCOUNTING;
            case "reporting-assistant":
                return Role.REPORTING_ASSISTANT;
            case "therapist":
                return Role.THERAPIST;
            default:
                throw new IllegalArgumentException();
        }
    }
}