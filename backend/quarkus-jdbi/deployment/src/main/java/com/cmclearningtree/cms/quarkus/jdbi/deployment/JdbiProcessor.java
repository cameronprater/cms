package com.cmclearningtree.cms.quarkus.jdbi.deployment;

import java.util.HashSet;
import java.util.Set;

import javax.enterprise.context.ApplicationScoped;

import com.cmclearningtree.cms.quarkus.jdbi.runtime.JdbiRecorder;
import io.quarkus.agroal.DataSource;
import org.jboss.jandex.AnnotationInstance;
import org.jboss.jandex.DotName;

import io.quarkus.arc.deployment.BeanRegistrationPhaseBuildItem;
import io.quarkus.arc.deployment.SyntheticBeanBuildItem;
import io.quarkus.arc.deployment.SyntheticBeanBuildItem.ExtendedBeanConfigurator;
import io.quarkus.arc.processor.DotNames;
import io.quarkus.arc.processor.InjectionPointInfo;
import io.quarkus.datasource.common.runtime.DataSourceUtil;
import io.quarkus.deployment.annotations.BuildProducer;
import io.quarkus.deployment.annotations.BuildStep;
import io.quarkus.deployment.annotations.ExecutionTime;
import io.quarkus.deployment.annotations.Record;
import io.quarkus.deployment.builditem.FeatureBuildItem;
import org.jdbi.v3.core.Jdbi;

public class JdbiProcessor {
    private static final DotName DATA_SOURCE = DotName.createSimple(DataSource.class.getName());
    private static final DotName JDBI = DotName.createSimple(Jdbi.class.getName());

    private SyntheticBeanBuildItem syntheticBean(JdbiRecorder recorder,
                                                 ExtendedBeanConfigurator beanConfigurator,
                                                 String name) {
        if (DataSourceUtil.isDefault(name)) {
            beanConfigurator.addQualifier(DotNames.DEFAULT);
        } else {
            beanConfigurator.addQualifier().annotation(DotNames.NAMED).addValue("value", name).done();
            beanConfigurator.addQualifier().annotation(DATA_SOURCE).addValue("value", name).done();
        }
        return beanConfigurator.supplier(recorder.jdbi(name)).done();
    }

    @BuildStep
    FeatureBuildItem feature() {
        return new FeatureBuildItem("jdbi");
    }

    @BuildStep
    @Record(ExecutionTime.RUNTIME_INIT)
    void syntheticBeans(JdbiRecorder recorder,
                        BeanRegistrationPhaseBuildItem registrationPhase,
                        BuildProducer<SyntheticBeanBuildItem> syntheticBeans) {
        Set<String> names = new HashSet<>();
        boolean defaultProduced = false;

        for (InjectionPointInfo injectionPoint : registrationPhase.getInjectionPoints()) {
            DotName injectionPointType = injectionPoint.getRequiredType().name();

            if (injectionPointType.equals(JDBI)) {
                ExtendedBeanConfigurator beanConfigurator = SyntheticBeanBuildItem.configure(Jdbi.class)
                        .scope(ApplicationScoped.class)
                        .setRuntimeInit();
                AnnotationInstance jdbiDataSource = injectionPoint.getRequiredQualifier(DATA_SOURCE);

                if (!defaultProduced && injectionPoint.hasDefaultedQualifier()) {
                    syntheticBeans.produce(syntheticBean(recorder, beanConfigurator, DataSourceUtil.DEFAULT_DATASOURCE_NAME));
                    defaultProduced = true;
                } else if (jdbiDataSource != null) {
                    String name = jdbiDataSource.value().asString();
                    if (!names.contains(name)) {
                        syntheticBeans.produce(syntheticBean(recorder, beanConfigurator, name));
                        names.add(name);
                    }
                }
            }
        }
    }
}
