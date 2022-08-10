package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;

import com.cmclearningtree.cms.User;

public interface UserDao {

    @SqlUpdate("INSERT INTO `user` (id, email, name, picture) VALUES (:id, :email, :name, :picture)")
    void insertUser(@BindBean User user);

    @SqlQuery("SELECT * FROM `user` WHERE id = :id")
    @RegisterBeanMapper(User.class)
    Optional<User> findUserById(String id);

    @SqlUpdate("UPDATE `user` SET email = :email, name = :name, picture = :picture, active = :active WHERE id = :id")
    void updateUser(@BindBean User user);
}
