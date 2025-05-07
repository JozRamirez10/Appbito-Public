FROM --platform=linux/arm64/v8 amazoncorretto:17.0.14-alpine3.21 as builder

ARG APP=appbito
ENV APP=$APP

WORKDIR /app/$APP

COPY ./.mvn ./.mvn
COPY ./mvnw .
COPY ./pom.xml .

RUN chmod +x ./mvnw

RUN ./mvnw clean package -Dmaven.test.skip -Dmaven.main.skip -Dspring-boot.repackage.skip && rm -r ./target/

COPY ./src ./src

RUN ./mvnw clean package -DskipTests

FROM --platform=linux/arm64/v8 amazoncorretto:17.0.14-alpine3.21

WORKDIR /app

RUN mkdir -p /app/logs

COPY --from=builder /app/appbito/target/appbito-0.0.1-SNAPSHOT.jar appbito.jar

ARG PORT_APP=8001
ENV PORT $PORT_APP

EXPOSE $PORT

CMD ["java", "-jar", "appbito.jar"]