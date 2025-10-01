# Kubernetes Deployment Guide (Ocelot & Consul)

This guide provides instructions for deploying the Ocelot API Gateway and Consul within a Kubernetes cluster.

## Prerequisites

*   A running Kubernetes cluster.
*   `kubectl` configured to connect to your cluster.
*   Docker images for your microservices (including the `gateway` image) pushed to a container registry accessible by your Kubernetes cluster.

## 1. Deploy Consul

Apply the Consul deployment and service manifests:

```bash
kubectl apply -f k8s/gateway/consul-deployment.yaml
kubectl apply -f k8s/gateway/consul-service.yaml
```

Verify that Consul pods are running and the service is accessible:

```bash
kubectl get pods -l app=consul
kubectl get services -l app=consul
```

## 2. Deploy API Gateway

First, create the ConfigMap for the Ocelot configuration:

```bash
kubectl apply -f k8s/gateway/gateway-configmap.yaml
```

Then, deploy the Gateway and its service:

```bash
kubectl apply -f k8s/gateway/gateway-deployment.yaml
kubectl apply -f k8s/gateway/gateway-service.yaml
```

Verify that the Gateway pod is running and the service is accessible:

```bash
kubectl get pods -l app=gateway
kubectl get services -l app=gateway
```

## 3. Update Microservices for Kubernetes

Each microservice needs to be deployed to Kubernetes and configured to register with the Consul service running in the cluster.

*   **Example (UserService):**
    *   Create a `Deployment` for `UserService` (similar to `gateway-deployment.yaml`).
    *   Create a `Service` for `UserService`.
    *   Ensure the `UserService` `Deployment` has environment variables set for Consul:
        ```yaml
        env:
          - name: ASPNETCORE_ENVIRONMENT
            value: Production
          - name: ASPNETCORE_HTTP_PORT
            value: "80"
          - name: Consul__Host
            value: "http://consul:8500" # Pointing to the Consul service
          - name: Consul__ServiceName
            value: "UserService"
        ```
    *   The `UserService` will automatically register with Consul upon startup due to the `ConsulRegisterService` hosted service.

## 4. Accessing the API Gateway

If you have an Ingress Controller configured in your Kubernetes cluster, you can create an Ingress resource to expose the API Gateway externally:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway-ingress
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: gateway
                port:
                  number: 80
```

Apply the Ingress:

```bash
kubectl apply -f your-ingress.yaml
```

You can then access the API Gateway via the Ingress controller's external IP or hostname.

## Troubleshooting

*   **Check Pod Logs:** `kubectl logs <pod-name>` for any errors during startup or runtime.
*   **Check Service Endpoints:** `kubectl describe service <service-name>` to ensure endpoints are correctly resolved.
*   **Access Consul UI:** If possible, port-forward to the Consul UI service (`kubectl port-forward service/consul 8500:8500`) to verify service registrations and health checks.