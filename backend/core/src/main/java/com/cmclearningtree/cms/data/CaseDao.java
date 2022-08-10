package com.cmclearningtree.cms.data;

import java.util.List;
import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.statement.UseRowReducer;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.Case;
import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.User;
import com.cmclearningtree.cms.data.reducer.CaseReducer;

@RegisterBeanMapper(Case.class)
@RegisterBeanMapper(value = Comment.class, prefix = "comment")
@RegisterBeanMapper(value = File.class, prefix = "file")
@RegisterBeanMapper(value = User.class, prefix = "author")
public interface CaseDao {

    @CreateSqlObject
    LogDao createLogDao();

    @SqlUpdate("INSERT INTO `case` (id) VALUES (:child.id)")
    void insertCase(@BindBean Case _case);

    @SqlQuery("SELECT * FROM expanded_case WHERE child_id = :id ORDER BY file_timestamp DESC, comment_timestamp DESC")
    @UseRowReducer(CaseReducer.class)
    Optional<Case> findCaseById(int id);

    @SqlQuery("SELECT * FROM expanded_case ORDER BY file_timestamp DESC, comment_timestamp DESC")
    @UseRowReducer(CaseReducer.class)
    List<Case> listCases();

    @SqlUpdate("UPDATE `case` SET state = :state, closed = :closed WHERE id = :child.id")
    void updateCase(@BindBean Case _case);

    @Transaction
    default void insertCase(Case _case, String userId) {
        insertCase(_case);
        createLogDao().insertCaseLog(_case, userId);
    }

    @Transaction
    default void updateCase(Case _case, String userId) {
        updateCase(_case);
        createLogDao().insertCaseLog(_case, userId);
    }
}
