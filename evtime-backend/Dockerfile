# ---- build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# cache dependencies first
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

COPY src src
RUN ./gradlew --no-daemon bootJar -x test

# ---- runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd --system --create-home evtimes && mkdir -p /app/uploads && chown -R evtimes /app
USER evtimes

COPY --from=build /app/build/libs/*.jar app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
VOLUME /app/uploads

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
