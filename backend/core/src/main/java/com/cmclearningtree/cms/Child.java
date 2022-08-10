package com.cmclearningtree.cms;

import java.util.Objects;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import org.jdbi.v3.core.mapper.Nested;

public class Child extends Person {
    @Null
    private Integer id;
    @NotNull
    private Person parent;

    @Nested("parent")
    public Person getParent() {
        return parent;
    }

    public void setParent(Person parent) {
        this.parent = parent;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        Child child = (Child) o;
        return parent.equals(child.parent);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), parent);
    }
}
