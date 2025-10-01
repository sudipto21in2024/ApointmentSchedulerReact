#!/bin/bash

echo "Building the application..."

# Build the backend
echo "Building the backend..."
dotnet build backend/AppointmentBooking.sln

# Build the frontend (example)
#echo "Building the frontend..."
#cd frontend
#npm install
#npm run build

echo "Build complete."