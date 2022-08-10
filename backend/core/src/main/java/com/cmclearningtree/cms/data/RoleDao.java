package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

public interface RoleDao {

    @SqlUpdate("INSERT INTO `role` (name) VALUES (:role)")
    @GetGeneratedKeys
    int insertRole(String role);

    @SqlQuery("SELECT id FROM `role` WHERE name = :role")
    Optional<Integer> findRoleByName(String role);
}
