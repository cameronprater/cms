package com.cmclearningtree.cms.data;

import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import com.cmclearningtree.cms.*;

public interface LogDao {

    @SqlUpdate("INSERT INTO person_log (person_id, name, revised_by) VALUES (:id, :name, :userId)")
    void insertPersonLog(@BindBean Person person, String userId);

    @SqlUpdate("INSERT INTO child_log (child_id, parent_id, revised_by) VALUES (:id, :parent.id, :userId)")
    void insertChildLog(@BindBean Child child, String userId);

    @SqlUpdate("INSERT INTO case_log (case_id, state, closed, revised_by) VALUES (:child.id, :state, :closed, :userId)")
    void insertCaseLog(@BindBean Case _case, String userId);

    @SqlUpdate("INSERT INTO comment_log (comment_id, content, revised_by) VALUES (:id, :content, :userId)")
    void insertCommentLog(@BindBean Comment comment, String userId);

    @SqlUpdate("INSERT INTO file_log (file_id, name, extension, data, description, revised_by) VALUES (:id, :name, :extension, :data, :description, :userId)")
    void insertFileLog(@BindBean File file, String userId);
}
