# AlertManager Configuration

This document explains how to configure AlertManager to send notifications for critical events.

## What is AlertManager?

AlertManager is an open-source alerting system used to handle alerts sent by Prometheus. It allows you to configure routing, grouping, and silencing of alerts, and to send notifications to various channels such as email, Slack, and PagerDuty.

## Key Concepts

*   **Alerts:** Notifications triggered by Prometheus based on predefined rules.
*   **Receivers:** Destinations for notifications, such as email addresses, Slack channels, or PagerDuty services.
*   **Routes:** Rules that determine which receivers should be notified for specific alerts.
*   **Inhibition:** Rules that prevent certain alerts from being sent if other alerts are already firing.
*   **Silences:** Temporary suppressions of alerts.

## Configuration File (alertmanager.yml)

The AlertManager configuration is defined in the `alertmanager.yml` file. This file specifies the receivers, routes, and other settings for AlertManager.

## Example Configuration

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'email-notifications'

receivers:
- name: 'email-notifications'
  email_configs:
  - to: 'developers@example.com'
    from: 'alertmanager@example.com'
    smarthost: 'smtp.example.com:587'
    auth_username: 'alertmanager@example.com'
    auth_password: 'password'
    secure: 'tls'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

## Troubleshooting Common Issues

*   **Alerts are not being sent:** Check the AlertManager configuration for errors. Verify that the receivers are configured correctly and that the routes are properly defined.
*   **Alerts are being sent to the wrong receivers:** Check the routes in the AlertManager configuration. Verify that the `match` and `match_re` fields are correctly configured.
*   **Alerts are being silenced unexpectedly:** Check the active silences in AlertManager. Verify that the silences are not too broad and that they are not expiring prematurely.

## Further Documentation

*   [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)