package com.cmclearningtree.cms.service;

import javax.enterprise.context.RequestScoped;

import org.jdbi.v3.core.Jdbi;

import com.cmclearningtree.cms.Child;
import com.cmclearningtree.cms.data.ChildDao;

import io.smallrye.mutiny.Uni;

@RequestScoped
public class ChildService {
    private final Jdbi jdbi;
    private final String uuid;
    private final PersonService personService;

    public ChildService(Jdbi jdbi, JsonWebTokenHelper jwtHelper, PersonService personService) {
        this.jdbi = jdbi;
        this.uuid = jwtHelper.getUuid();
        this.personService = personService;
    }

    public Uni<Child> createChild(Child child) {
        return personService.createPerson(child.getParent())
                .replaceWith(personService.createPerson(child))
                .invoke(() -> jdbi.useExtension(ChildDao.class, dao -> dao.insertChild(child, uuid)))
                .stage(Exceptions::recoverFromNoUser)
                .replaceWith(child);
    }

    public Uni<Child> getChild(int id) {
        return Uni.createFrom().optional(() -> jdbi.withExtension(ChildDao.class, dao -> dao.findChildById(id)))
                .onItem().ifNull().failWith(Exceptions.NoResultsException::new);
    }

    public Uni<Void> updateChild(Child child) {
        return personService.updatePerson(child)
                .replaceWith(getChild(child.getId()))
                .invoke(result -> result.getParent().setName(child.getParent().getName()))
                .flatMap(result -> personService.updatePerson(result.getParent()))
                .replaceWithVoid();
    }
}
