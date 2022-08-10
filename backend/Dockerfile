FROM alpine:latest AS init

COPY ./mvnw .
RUN apk add --no-cache dos2unix && dos2unix mvnw

FROM registry.access.redhat.com/ubi8/openjdk-11:1.11 AS builder

WORKDIR /app
COPY --chown=185 . .
COPY --from=init --chown=185 ./mvnw .

USER root
RUN ./mvnw clean package -DskipTests

FROM builder

ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'

COPY --from=builder --chown=185 app/core/target/quarkus-app/lib/ /deployments/lib/
COPY --from=builder --chown=185 app/core/target/quarkus-app/*.jar /deployments/
COPY --from=builder --chown=185 app/core/target/quarkus-app/app/ /deployments/app/
COPY --from=builder --chown=185 app/core/target/quarkus-app/quarkus/ /deployments/quarkus/
USER 185

EXPOSE 8081

ENV AB_JOLOKIA_OFF=""
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"