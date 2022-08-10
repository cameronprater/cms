package com.cmclearningtree.cms.rest;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;

import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.Views;
import com.cmclearningtree.cms.rest.UploadFormData.Metadata;
import com.cmclearningtree.cms.service.FileService;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.core.buffer.Buffer;

@Path("/api/cases/{caseId}/files")
public class FileResource {
    private final FileService fileService;
    private final ObjectMapper objectMapper;
    private final Vertx vertx;

    public FileResource(FileService fileService, ObjectMapper objectMapper, Vertx vertx) {
        this.fileService = fileService;
        this.objectMapper = objectMapper;
        this.vertx = vertx;
    }

    private Uni<Buffer> readFile(String path) {
        return vertx.fileSystem().readFile(path);
    }

    private Uni<File> readFile(UploadFormData formData) {
        return readFile(formData.getMetadata().toString())
                .map(buf -> Unchecked.supplier(() -> objectMapper.readValue(buf.getBytes(), Metadata.class)).get())
                .flatMap(metadata -> readFile(formData.getData().uploadedFile().toString())
                        .map(buf -> new File(formData, metadata, buf.getBytes())));
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @JsonView(Views.Expanded.class)
    @Authenticated
    public Uni<File> createFile(int caseId, UploadFormData formData) {
        return readFile(formData).flatMap(file -> fileService.createFile(caseId, file));
    }

    @GET
    @Path("/{fileId}")
    @Produces(MediaType.MULTIPART_FORM_DATA)
    @Authenticated
    public DownloadFormData getFile(int caseId, int fileId) {
        return fileService.getFile(caseId, fileId)
                .map(DownloadFormData::new)
                // Quarkus currently does not support reactive multipart downloading
                .await().indefinitely();
    }

    @PUT
    @Path("/{fileId}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Authenticated
    public Uni<Void> updateFile(int caseId, int fileId, UploadFormData formData) {
        return readFile(formData)
                .invoke(file -> file.setId(fileId))
                .flatMap(file -> fileService.updateFile(caseId, file));
    }

    @DELETE
    @Path("/{fileId}")
    @Authenticated
    public Uni<Void> deleteFile(int caseId, int fileId) {
        return fileService.deleteFile(caseId, fileId);
    }
}
