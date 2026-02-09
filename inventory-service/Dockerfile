# Etapa 1: Compilación (Build) con Maven y Java 21
FROM maven:3.9.6-amazoncorretto-21 AS build
WORKDIR /app
# Copiamos el POM para descargar dependencias primero (cache)
COPY pom.xml .
RUN mvn dependency:go-offline
# Copiamos el código fuente y compilamos el JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen de ejecución (Runtime)
FROM amazoncorretto:21-alpine
WORKDIR /app
# Copiamos el JAR generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
# Puerto de Inventario
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]