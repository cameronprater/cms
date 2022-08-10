package com.cmclearningtree.cms.service;

import javax.enterprise.context.RequestScoped;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.Person;
import com.cmclearningtree.cms.data.PersonDao;

import io.smallrye.mutiny.Uni;

@RequestScoped
public class PersonService {
    private final Jdbi jdbi;
    private final String uuid;

    public PersonService(Jdbi jdbi, JsonWebTokenHelper jwtHelper) {
        this.jdbi = jdbi;
        this.uuid = jwtHelper.getUuid();
    }

    public Uni<Person> createPerson(Person person) {
        return Uni.createFrom().voidItem()
                .invoke(() -> jdbi.useExtension(PersonDao.class, dao -> dao.insertPerson(person, uuid)))
                .stage(Exceptions::recoverFromNoUser)
                .replaceWith(person);
    }

    public Uni<Person> getPerson(int id) {
        return Uni.createFrom().optional(() -> jdbi.withExtension(PersonDao.class, dao -> dao.findPersonById(id)))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new);
    }

    public Uni<Void> updatePerson(Person person) {
        return getPerson(person.getId())
                .flatMap(result -> {
                    Uni<Void> uni = Uni.createFrom().voidItem();
                    if (!result.equals(person)) {
                        return uni.invoke(() -> jdbi.useExtension(PersonDao.class, dao -> dao.updatePerson(person, uuid)))
                                .stage(Exceptions::recoverFromNoUser);
                    }
                    return uni;
                });
    }
}
