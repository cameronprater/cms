package com.cmclearningtree.cms.data;

import java.util.Optional;

import org.jdbi.v3.sqlobject.CreateSqlObject;
import org.jdbi.v3.sqlobject.config.RegisterBeanMapper;
import org.jdbi.v3.sqlobject.customizer.BindBean;
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys;
import org.jdbi.v3.sqlobject.statement.SqlQuery;
import org.jdbi.v3.sqlobject.statement.SqlUpdate;
import org.jdbi.v3.sqlobject.transaction.Transaction;

import com.cmclearningtree.cms.Person;

public interface PersonDao {

    @CreateSqlObject
    LogDao createLogDao();

    @SqlUpdate("INSERT INTO person (name) VALUES (:name)")
    @GetGeneratedKeys
    int insertPerson(@BindBean Person person);

    @SqlQuery("SELECT * FROM person WHERE id = :id")
    @RegisterBeanMapper(Person.class)
    Optional<Person> findPersonById(int id);

    @SqlUpdate("UPDATE person SET name = :name WHERE id = :id")
    void updatePerson(@BindBean Person person);

    @Transaction
    default void insertPerson(Person person, String userId) {
        person.setId(insertPerson(person));
        createLogDao().insertPersonLog(person, userId);
    }

    @Transaction
    default void updatePerson(Person person, String userId) {
        updatePerson(person);
        createLogDao().insertPersonLog(person, userId);
    }
}
