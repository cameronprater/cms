package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.Comment;

public interface CommentPermissionDao {

    @CreateSqlObject
    RoleDao createRoleDao();

    @SqlUpdate("INSERT INTO comment_permission VALUES (:id, :roleId)")
    void insertPermission(@BindBean Comment comment, int roleId);

    @SqlQuery("SELECT comment_id FROM comment_permission WHERE comment_id = :id AND role_id = :roleId")
    Optional<Integer> findPermission(@BindBean Comment comment, int roleId);

    @Transaction
    default void insertPermission(Comment comment, String role) {
        RoleDao roleDao = createRoleDao();
        int id = roleDao.findRoleByName(role).orElseGet(() -> roleDao.insertRole(role));
        if (findPermission(comment, id).isEmpty()) {
            insertPermission(comment, id);
        }
    }
}
