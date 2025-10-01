# Local Development Setup Guide (Ocelot & Consul)

This guide provides instructions for setting up and running the API Gateway (Ocelot) and Consul locally using Docker Compose, along with an example microservice (UserService) integrated with Consul.

## Prerequisites

*   Docker Desktop (or Docker Engine) installed and running.
*   .NET SDK 8.0 or later.

## 1. Build Docker Images

Navigate to the root of the project and build the Docker images for the Gateway and other services:

```bash
docker-compose build
```

## 2. Start the Services

Start the Consul server, API Gateway, and other microservices using Docker Compose:

```bash
docker-compose up -d consul gateway userservice bookingservice servicemanagementservice paymentservice notificationservice reportingservice slotmanagementservice
```

## 3. Verify Consul UI

Open your web browser and navigate to `http://localhost:8500/ui`. You should see the Consul UI, and after a few moments, the `userservice` and `gateway` services should appear in the list of registered services with a passing health check.

## 4. Test API Gateway

You can now test the API Gateway by making requests to its exposed port (e.g., `http://localhost:80/userservice/api/users`). The Gateway will route these requests to the `userservice` discovered via Consul.

For example, to access a hypothetical user endpoint:

```bash
curl http://localhost:80/userservice/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\", \"password\":\"password\"}"
```

Replace `/userservice/api/auth/login` with the actual upstream path configured in `ocelot.json` for the `UserService`.

## 5. Stopping Services

To stop the services:

```bash
docker-compose down
```

This guide helps in quickly setting up a local development environment to test the API Gateway and Consul integration.