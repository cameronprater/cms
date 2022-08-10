package com.cmclearningtree.cms;

import java.util.Objects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class User {
    @NotNull
    private String id;
    @NotBlank
    private String email;
    @NotBlank
    private String name;
    @NotBlank
    private String picture;
    private Boolean active;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        User user = (User) o;
        return id.equals(user.id) && email.equals(user.email) && name.equals(user.name) && picture.equals(user.picture)
                && active.equals(user.active);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email, name, picture, active);
    }
}
