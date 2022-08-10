package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.statement.UseRowReducer;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.Comment;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.User;
import com.cmclearningtree.cms.data.reducer.CommentReducer;

public interface CommentDao {

    @CreateSqlObject
    CommentPermissionDao createPermissionDao();

    @CreateSqlObject
    LogDao createLogDao();

    @SqlUpdate("INSERT INTO comment (case_id, content) VALUES (:caseId, :content)")
    @GetGeneratedKeys
    int insertComment(@BindBean Comment comment, int caseId);

    @SqlQuery("SELECT * FROM expanded_comment WHERE id = :id")
    @RegisterBeanMapper(Comment.class)
    @RegisterBeanMapper(User.class)
    @UseRowReducer(CommentReducer.class)
    Optional<Comment> findCommentById(int id);

    @SqlUpdate("UPDATE comment SET content = :content WHERE id = :id")
    void updateComment(@BindBean Comment comment);

    @SqlUpdate("DELETE FROM comment WHERE id = :id")
    void deleteCommentById(int id);

    default void insertPermissions(Comment comment) {
        CommentPermissionDao permissionDao = createPermissionDao();
        for (Role permission : comment.getPermissions()) {
            permissionDao.insertPermission(comment, permission.getName());
        }
    }

    @Transaction
    default void insertComment(Comment comment, int caseId, String userId) {
        comment.setId(insertComment(comment, caseId));
        createLogDao().insertCommentLog(comment, userId);
        insertPermissions(comment);
    }

    @Transaction
    default void updateComment(Comment comment, String userId) {
        updateComment(comment);
        createLogDao().insertCommentLog(comment, userId);
        insertPermissions(comment);
    }
}
