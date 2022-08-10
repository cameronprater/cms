package com.cmclearningtree.cms.rest;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;

import com.cmclearningtree.cms.User;
import com.cmclearningtree.cms.service.UserService;

import io.smallrye.mutiny.Uni;

@Path("/api/users")
public class UserResource {

    @Inject
    UserService userService;

    @POST
    @RolesAllowed("auth0")
    public Uni<User> createUser(@NotNull @Valid User user) {
        return userService.createUser(user);
    }

    @PUT
    @Path("/{userId}")
    @RolesAllowed("auth0")
    public Uni<Void> updateUser(String userId, @NotNull @Valid User user) {
        return userService.updateUser(user);
    }
}
