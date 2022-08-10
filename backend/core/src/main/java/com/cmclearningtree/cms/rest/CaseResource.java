package com.cmclearningtree.cms.rest;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;

import com.cmclearningtree.cms.*;
import com.cmclearningtree.cms.Case.State;
import com.cmclearningtree.cms.service.CaseService;
import com.fasterxml.jackson.annotation.JsonView;

import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;

@Path("/api/cases")
public class CaseResource {

    @Inject
    CaseService caseService;

    @POST
    @RolesAllowed("customer-service")
    public Uni<Case> createCase(@NotNull @Valid Case _case) {
        return caseService.createCase(_case);
    }

    @GET
    @Path("/{caseId}")
    @JsonView(Views.Expanded.class)
    @Authenticated
    public Uni<Case> getCase(int caseId) {
        return caseService.getCase(caseId);
    }

    @GET
    @Authenticated
    public Multi<Case> getCases() {
        return caseService.getCases();
    }

    @PUT
    @Path("/{caseId}")
    @RolesAllowed("customer-service")
    public Uni<Void> updateCase(int caseId, @NotNull @Valid Case _case) {
        _case.getChild().setId(caseId);
        return caseService.updateCase(_case);
    }

    @POST
    @Path("/{caseId}/close")
    @RolesAllowed("customer-service")
    public Uni<Void> closeOrReopenCase(int caseId) {
        return caseService.closeOrReopenCase(caseId);
    }

    @POST
    @Path("/{caseId}/state/{state}")
    @Authenticated
    public Uni<Void> updateCaseState(int caseId, State state) {
        return caseService.updateCaseState(caseId, state);
    }
}
