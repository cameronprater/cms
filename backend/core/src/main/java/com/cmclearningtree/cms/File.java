package com.cmclearningtree.cms;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import org.apache.commons.io.FilenameUtils;
import org.jdbi.v3.core.mapper.Nested;

import com.cmclearningtree.cms.rest.UploadFormData;
import com.cmclearningtree.cms.rest.UploadFormData.Metadata;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;

public class File {
    private Integer id;
    @JsonView(Views.Expanded.class)
    private String name;
    @JsonView(Views.Expanded.class)
    private String extension;
    @JsonIgnore
    private byte[] data;
    @JsonView(Views.Expanded.class)
    private String description;
    @JsonView(Views.Expanded.class)
    private OffsetDateTime timestamp;
    @JsonView(Views.Expanded.class)
    private User author;
    private Set<Role> permissions = new HashSet<>();

    public File() {
    }

    public File(UploadFormData formData, Metadata metadata, byte[] data) {
        String filename = formData.getData().fileName();
        this.extension = FilenameUtils.getExtension(filename);
        this.name = filename.substring(0, filename.lastIndexOf('.' + extension));
        this.data = data;
        this.description = metadata.getDescription();
        this.permissions = metadata.getPermissions();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
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

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
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

    @Nested("author")
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

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        File file = (File) o;
        return id.equals(file.id) && name.equals(file.name) && extension.equals(file.extension)
                && Arrays.equals(data, file.data) && Objects.equals(description, file.description)
                && author.equals(file.author) && Objects.equals(permissions, file.permissions);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(id, name, extension, description, author, permissions);
        result = 31 * result + Arrays.hashCode(data);
        return result;
    }
}
