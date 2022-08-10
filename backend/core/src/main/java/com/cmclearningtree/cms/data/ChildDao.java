package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.Child;

public interface ChildDao {

    @CreateSqlObject
    LogDao createLogDao();

    @SqlUpdate("INSERT INTO child VALUES (:id, :parent.id)")
    void insertChild(@BindBean Child child);

    @SqlQuery("SELECT * FROM child_with_parent WHERE id = :id")
    @RegisterBeanMapper(Child.class)
    Optional<Child> findChildById(int id);

    @Transaction
    default void insertChild(Child child, String userId) {
        insertChild(child);
        createLogDao().insertChildLog(child, userId);
    }
}
