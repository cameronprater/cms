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

import com.cmclearningtree.cms.File;
import com.cmclearningtree.cms.Role;
import com.cmclearningtree.cms.User;
import com.cmclearningtree.cms.data.reducer.FileReducer;

public interface FileDao {

    @CreateSqlObject
    FilePermissionDao createPermissionDao();

    @CreateSqlObject
    LogDao createLogDao();

    @SqlUpdate("INSERT INTO file (case_id, name, extension, data, description) VALUES (:caseId, :name, :extension, :data, :description)")
    @GetGeneratedKeys
    int insertFile(@BindBean File file, int caseId);

    @SqlQuery("SELECT * FROM expanded_file WHERE id = :id")
    @RegisterBeanMapper(File.class)
    @RegisterBeanMapper(User.class)
    @UseRowReducer(FileReducer.class)
    Optional<File> findFileById(int id);

    @SqlUpdate("UPDATE file SET name = :name, extension = :extension, data = :data, description = :description WHERE id = :id")
    void updateFile(@BindBean File file);

    @SqlUpdate("DELETE FROM file WHERE id = :id")
    void deleteFileById(int id);

    default void insertPermissions(File file) {
        FilePermissionDao permissionDao = createPermissionDao();
        for (Role permission : file.getPermissions()) {
            permissionDao.insertPermission(file, permission.getName());
        }
    }

    @Transaction
    default void insertFile(File file, int caseId, String userId) {
        file.setId(insertFile(file, caseId));
        createLogDao().insertFileLog(file, userId);
        insertPermissions(file);
    }

    @Transaction
    default void updateFile(File file, String userId) {
        updateFile(file);
        createLogDao().insertFileLog(file, userId);
        insertPermissions(file);
    }
}
