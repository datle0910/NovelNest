# Stage 1: Build Java Services
FROM maven:3.9.7-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend /app/backend
RUN cd /app/backend/discovery-server && mvn clean package -DskipTests
RUN cd /app/backend/api-gateway && mvn clean package -DskipTests
RUN cd /app/backend/auth-service && mvn clean package -DskipTests
RUN cd /app/backend/story-service && mvn clean package -DskipTests
RUN cd /app/backend/media-service && mvn clean package -DskipTests

# Stage 2: Build Frontend (Vite)
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend /app/frontend
# Build using relative path for API endpoint to let Nginx handle reverse proxying
ARG VITE_API_URL=""
ARG VITE_WS_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
RUN cd /app/frontend && npm install && npm run build

# Stage 3: Package Runner
FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built JARs from Stage 1
COPY --from=backend-build /app/backend/discovery-server/target/*.jar discovery-server.jar
COPY --from=backend-build /app/backend/api-gateway/target/*.jar api-gateway.jar
COPY --from=backend-build /app/backend/auth-service/target/*.jar auth-service.jar
COPY --from=backend-build /app/backend/story-service/target/*.jar story-service.jar
COPY --from=backend-build /app/backend/media-service/target/*.jar media-service.jar

# Copy Frontend static files and Nginx config from Stage 2
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.hf.conf /etc/nginx/sites-available/default

# Create local uploads folder
RUN mkdir -p /app/uploads

# Expose port 7860 (Hugging Face Spaces requirement)
EXPOSE 7860

# Add entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
