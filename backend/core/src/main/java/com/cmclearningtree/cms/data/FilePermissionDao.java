package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.File;

public interface FilePermissionDao {

    @CreateSqlObject
    RoleDao createRoleDao();

    @SqlUpdate("INSERT INTO file_permission VALUES (:id, :roleId)")
    void insertPermission(@BindBean File file, int roleId);

    @SqlQuery("SELECT file_id FROM file_permission WHERE file_id = :id AND role_id = :roleId")
    Optional<Integer> findPermission(@BindBean File file, int roleId);

    @Transaction
    default void insertPermission(File file, String role) {
        RoleDao roleDao = createRoleDao();
        int id = roleDao.findRoleByName(role).orElseGet(() -> roleDao.insertRole(role));
        if (findPermission(file, id).isEmpty()) {
            insertPermission(file, id);
        }
    }
}
