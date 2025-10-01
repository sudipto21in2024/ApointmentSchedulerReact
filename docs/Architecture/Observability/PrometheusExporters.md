# Prometheus Exporters

This document explains how to set up Prometheus exporters for applications to expose metrics to Prometheus.

## What are Prometheus Exporters?

Prometheus exporters are programs that collect metrics from a system or application and expose them in a format that Prometheus can understand. They act as intermediaries between Prometheus and the target system, allowing Prometheus to scrape metrics even if the target system doesn't natively support Prometheus's data format.

## Common Exporters

*   **Node Exporter:** Exposes system metrics (CPU, memory, disk, network) from Linux/Unix systems.
*   **cAdvisor:** Exposes container metrics from Docker containers.
*   **JMX Exporter:** Exposes metrics from Java applications via JMX.
*   **Blackbox Exporter:** Probes endpoints over HTTP, HTTPS, DNS, TCP, and ICMP.

## Setting up a Prometheus Exporter

1.  **Choose an appropriate exporter:** Select an exporter that is suitable for the system or application you want to monitor.
2.  **Install the exporter:** Download the exporter binary or install it using a package manager.
3.  **Configure the exporter:** Configure the exporter to collect the desired metrics. This may involve specifying the target system, authentication credentials, and other parameters.
4.  **Start the exporter:** Start the exporter and verify that it is running correctly.
5.  **Configure Prometheus:** Add the exporter as a scrape target in Prometheus's configuration file (`prometheus.yml`).

## Example: Setting up Node Exporter

1.  **Download Node Exporter:** Download the latest version of Node Exporter from the Prometheus website.
2.  **Extract the archive:** Extract the downloaded archive to a directory on the target system.
3.  **Start Node Exporter:** Run the `node_exporter` binary.
4.  **Configure Prometheus:** Add the following to the `scrape_configs` section of `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
```

## Custom Exporters

If there isn't an existing exporter for your application, you can create a custom exporter using the Prometheus client libraries for various programming languages.

## Further Documentation

*   [Prometheus Exporters](https://prometheus.io/docs/instrumenting/exporters/)
*   [Node Exporter](https://github.com/prometheus/node_exporter)
*   [cAdvisor](https://github.com/google/cadvisor)