package com.cmclearningtree.cms;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Null;

import org.jdbi.v3.core.mapper.Nested;

public class Comment {
    @Null
    private Integer id;
    @NotBlank
    private String content;
    @Null
    private OffsetDateTime timestamp;
    @Null
    private User author;
    private Set<Role> permissions = new HashSet<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
        Comment comment = (Comment) o;
        return id.equals(comment.id) && content.equals(comment.content) && author.equals(comment.author)
                && Objects.equals(permissions, comment.permissions);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, content, author, permissions);
    }
}
