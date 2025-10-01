#!/bin/bash

echo "Running tests..."

# Run backend tests
echo "Running backend tests..."
dotnet test backend/AppointmentBooking.sln

# Run frontend tests (example)
#echo "Running frontend tests..."
#cd frontend
#npm install
#npm test

echo "Tests complete."