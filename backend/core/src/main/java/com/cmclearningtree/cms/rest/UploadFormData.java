package com.cmclearningtree.cms.rest;

import java.nio.file.Path;
import java.util.Set;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import com.cmclearningtree.cms.Role;

public class UploadFormData {
    @RestForm
    private FileUpload data;
    @RestForm
    private Path metadata;

    public FileUpload getData() {
        return data;
    }

    public void setData(FileUpload data) {
        this.data = data;
    }

    public Path getMetadata() {
        return metadata;
    }

    public void setMetadata(Path metadata) {
        this.metadata = metadata;
    }

    public static class Metadata {
        private String description;
        private Set<Role> permissions;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Set<Role> getPermissions() {
            return permissions;
        }

        public void setPermissions(Set<Role> permissions) {
            this.permissions = permissions;
        }
    }
}
