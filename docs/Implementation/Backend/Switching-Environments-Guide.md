# Switching Between Local & Kubernetes Environments

This guide provides best practices and instructions for seamlessly switching between local Docker Compose and Kubernetes environments for the API Gateway and microservices.

## 1. Configuration Management

Effective configuration management is crucial for handling different environment-specific settings.

### Local Development (Docker Compose)

*   **`appsettings.Development.json`:** Use this file for settings specific to your local development environment.
*   **Environment Variables in `docker-compose.yml`:** Define environment variables directly within the `docker-compose.yml` for service-specific configurations (e.g., `Consul:Host`, `Consul:ServiceName`, `ASPNETCORE_HTTP_PORT`). This allows easy modification without rebuilding images for local testing.

### Kubernetes

*   **`ConfigMap`:** Store non-sensitive configuration data (like `ocelot.json` and `appsettings.json` content) in Kubernetes `ConfigMap`s. This allows you to update application configuration without redeploying the application image.
*   **`Secret`:** Store sensitive information (e.g., database connection strings, API keys) in Kubernetes `Secret`s.
*   **Environment Variables in Deployment YAMLs:** Define environment variables in your Deployment YAMLs, referencing `ConfigMap`s or `Secret`s where appropriate.

## 2. Consul Host Configuration

The address for the Consul agent will differ between environments.

### Local Development (Docker Compose)

In `docker-compose.yml`, services communicate using the service name as the hostname. Therefore, `Consul:Host` should be set to `http://consul:8500`.

### Kubernetes

In Kubernetes, the Consul service is exposed via a Kubernetes Service. If your Consul service is named `consul`, and is in the same namespace, `Consul:Host` should be set to `http://consul:8500`.

## 3. Service Port Configuration

Ensure that the application's exposed port is correctly configured for each environment.

### Local Development (Docker Compose)

*   Map ports in `docker-compose.yml` (e.g., `ports: - "80:80"`).
*   Set the `ASPNETCORE_HTTP_PORT` environment variable to the internal container port (e.g., `80`).

### Kubernetes

*   The `containerPort` in your Deployment YAML should match the port the application listens on (e.g., `80`).
*   The `Service` YAML will expose this port within the cluster.
*   `ASPNETCORE_HTTP_PORT` environment variable should be set to the internal container port (e.g., `80`).

## 4. Health Check Endpoints

Ensure health check endpoints are consistent and accessible in both environments.

### Local Development (Docker Compose)

*   Health checks in `docker-compose.yml` (e.g., `test: ["CMD", "curl", "-f", "http://localhost/healthz"]`) should use `localhost` and the internal container port.

### Kubernetes

*   Health probes in Deployment YAMLs (e.g., `livenessProbe`, `readinessProbe`) should use the internal service endpoint (e.g., `httpGet: path: /healthz`).

## 5. Build and Deploy

### Local Development (Docker Compose)

1.  Build images: `docker-compose build`
2.  Run services: `docker-compose up -d`

### Kubernetes

1.  Build and push Docker images to a container registry.
2.  Apply Kubernetes manifests: `kubectl apply -f k8s/gateway/consul-deployment.yaml` (and other manifests for gateway and microservices).

By following these guidelines, you can ensure a smooth transition and consistent behavior when deploying your API Gateway and microservices across different environments.