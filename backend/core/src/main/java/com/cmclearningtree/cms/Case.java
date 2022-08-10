package com.cmclearningtree.cms;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Null;

import org.jdbi.v3.core.mapper.Nested;

import com.fasterxml.jackson.annotation.JsonView;

public class Case {
    @NotNull
    private Child child;
    @Null
    private State state;
    @Null
    private Boolean closed;
    @JsonView(Views.Expanded.class)
    private List<Comment> comments = new ArrayList<>();
    @JsonView(Views.Expanded.class)
    private List<File> files = new ArrayList<>();

    @Nested("child")
    public Child getChild() {
        return child;
    }

    public void setChild(Child child) {
        this.child = child;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public Boolean getClosed() {
        return closed;
    }

    public void setClosed(Boolean closed) {
        this.closed = closed;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public List<File> getFiles() {
        return files;
    }

    public void setFiles(List<File> files) {
        this.files = files;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Case _case = (Case) o;
        return child.equals(_case.child) && state == _case.state && closed.equals(_case.closed)
                && Objects.equals(comments, _case.comments) && Objects.equals(files, _case.files);
    }

    @Override
    public int hashCode() {
        return Objects.hash(child, state, closed, comments, files);
    }

    public enum State {
        RECOMMENDATION_PENDING("recommendation-pending"),
        PARENT_OUTREACH("parent-outreach"),
        PAYMENT_PENDING("payment-pending"),
        REPORT_PENDING("report-pending"),
        LOGBOOK_PENDING("logbook-pending");

        private final String value;

        State(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
