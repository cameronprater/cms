package com.cmclearningtree.cms.rest;

import java.util.stream.Collectors;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import com.cmclearningtree.cms.service.Exceptions;

public class ExceptionMappers {
    @ServerExceptionMapper
    public RestResponse<?> mapNoResultsException(Exceptions.NoResultsException e) {
        return RestResponse.status(Response.Status.NOT_FOUND);
    }

    @ServerExceptionMapper
    public RestResponse<String> mapConstraintViolationException(ConstraintViolationException e) {
        return RestResponse.status(Response.Status.BAD_REQUEST, e.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", ")));
    }
}
