package com.cmclearningtree.cms.rest;

import java.time.OffsetDateTime;
import java.util.Set;

import javax.ws.rs.core.MediaType;

import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;

import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.User;

public class DownloadFormData {
    @RestForm
    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    private byte[] data;
    @RestForm
    @PartType(MediaType.APPLICATION_JSON)
    private Metadata metadata;

    public DownloadFormData(File file) {
        this.data = file.getData();
        this.metadata = new Metadata(file);
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    public static class Metadata {
        private int id;
        private String name;
        private String extension;
        private String description;
        private OffsetDateTime timestamp;
        private User author;
        private Set<Role> permissions;

        public Metadata(File file) {
            this.id = file.getId();
            this.name = file.getName();
            this.extension = file.getExtension();
            this.description = file.getDescription();
            this.timestamp = file.getTimestamp();
            this.author = file.getAuthor();
            this.permissions = file.getPermissions();
        }

        public Metadata() {
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getExtension() {
            return extension;
        }

        public void setExtension(String extension) {
            this.extension = extension;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public OffsetDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(OffsetDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public User getAuthor() {
            return author;
        }

        public void setAuthor(User author) {
            this.author = author;
        }

        public Set<Role> getPermissions() {
            return permissions;
        }

        public void setPermissions(Set<Role> permissions) {
            this.permissions = permissions;
        }
    }
}
