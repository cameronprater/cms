package com.cmclearningtree.cms.quarkus.jdbi.runtime;

import java.util.function.Supplier;

import org.jdbi.v3.core.Jdbi;

import io.quarkus.agroal.runtime.DataSources;
import io.quarkus.runtime.annotations.Recorder;

@Recorder
public class JdbiRecorder {

    public Supplier<Jdbi> jdbi(String name) {
        return new Supplier<Jdbi>() {

            @Override
            public Jdbi get() {
                return Jdbi.create(DataSources.fromName(name)).installPlugins();
            }
        };
    }
}
