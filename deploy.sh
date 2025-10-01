#!/bin/bash

echo "Deploying the application..."

# Build the docker images
echo "Building the docker images..."
docker-compose build

# Deploy the application
echo "Deploying the application..."
docker-compose up -d

echo "Deployment complete."