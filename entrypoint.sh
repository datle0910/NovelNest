#!/bin/bash

# Print start logs
echo "Starting NovelNest Services..."

# Start Eureka Discovery Server
echo "Starting Discovery Server..."
java -jar discovery-server.jar > discovery.log 2>&1 &

# Wait for discovery server to start (port 8761)
echo "Waiting for Discovery Server to start..."
while ! curl -s http://localhost:8761/eureka/apps > /dev/null; do
  sleep 3
done
echo "Discovery Server is active!"

# Start other microservices
echo "Starting Auth Service..."
java -jar auth-service.jar > auth.log 2>&1 &

echo "Starting Story Service..."
java -jar story-service.jar > story.log 2>&1 &

echo "Starting Media Service..."
java -jar media-service.jar > media.log 2>&1 &

# Wait for services to bootstrap
sleep 10
echo "Starting API Gateway..."
java -jar api-gateway.jar > gateway.log 2>&1 &

# Wait for API Gateway to be online
echo "Waiting for API Gateway to be online..."
while ! curl -s http://localhost:8080 > /dev/null; do
  sleep 2
done
echo "API Gateway is active on port 8080!"

# Start Nginx in foreground to serve frontend on port 7860
echo "Starting Nginx server..."
nginx -g "daemon off;"
