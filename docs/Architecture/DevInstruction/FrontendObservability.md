# Frontend Observability in Angular

This document provides implementation details for the new observability infrastructure in the Angular frontend. It is intended for AI coding agents and aims to explain how to instrument the code to collect metrics, logs, and traces.

## Key Components

The following components are used for observability in the frontend:

*   **Prometheus:** Used for collecting metrics (via custom code).
*   **Angular Logging:** Used for logging events and errors.
*   **OpenTelemetry:** Used for distributed tracing.

## Implementation Details

### Metrics

1.  **Install Prometheus client library:** Since there's no direct Prometheus client library for Angular, you'll need to manually collect and expose metrics.
2.  **Collect custom metrics:** Use JavaScript to collect custom metrics in your application code (e.g., page load times, API response times, user interactions).
3.  **Expose metrics endpoint:** Create an API endpoint in your backend to expose the collected metrics in Prometheus format.
4.  **Configure Prometheus:** Configure Prometheus to scrape the metrics endpoint in your backend.

### Logging

1.  **Use Angular's built-in logging:** Use Angular's built-in `console.log`, `console.warn`, and `console.error` methods to log events and errors.
2.  **Configure a logging service:** Create a custom logging service to centralize logging and send logs to a backend service (e.g., Elasticsearch).

### Tracing

1.  **Install OpenTelemetry JavaScript packages:** Add the following packages to your Angular project:
    *   `@opentelemetry/api`
    *   `@opentelemetry/sdk-trace-base`
    *   `@opentelemetry/exporter-jaeger`
    *   `@opentelemetry/instrumentation`
    *   `@opentelemetry/auto-instrumentations-web`
2.  **Configure OpenTelemetry:** Configure OpenTelemetry in your Angular application to export traces to Jaeger:

```typescript
import { diag, DiagConsoleLogger, DiagLevel } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';

// Set diag to console
diag.setLogger(new DiagConsoleLogger(), DiagLevel.DEBUG);

const provider = new WebTracerProvider();
provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
})));
provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  tracerProvider: provider,
});
```

3.  **Create spans:** Use the OpenTelemetry API to create spans in your application code.

## Sample Code Examples

### Logging with Angular

```typescript
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class MyService {

  constructor(private logger: LoggerService) { }

  myMethod() {
    this.logger.log('This is an information message');
    this.logger.warn('This is a warning message');
    this.logger.error('This is an error message');
  }
}
```

### Metrics with Custom Code

```typescript
// In a service or component
recordPageView() {
  // Send a request to your backend to record the metric
  this.http.post('/api/metrics/pageView', { page: 'homepage' }).subscribe();
}
```

### Tracing with OpenTelemetry

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-application', '1.0.0');

// Create a span
const span = tracer.startSpan('my-operation');
// ...
span.end();
```

## Wrapper Functions for Easy Implementation

To simplify the implementation of observability for junior developers, you can create wrapper functions for logging and tracing.

### Logging Wrapper (logger.service.ts)

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  log(message: string) {
    console.log(message);
  }

  warn(message: string) {
    console.warn(message);
  }

  error(message: string) {
    console.error(message);
  }
}
```

### Tracing Wrapper

```typescript
import { trace, Span } from '@opentelemetry/api';

export class TracingHelper {
  static startSpan(name: string): Span {
    const tracer = trace.getTracer('my-application', '1.0.0');
    return tracer.startSpan(name);
  }
}
```

## Use Cases and Implementation

### Page View Tracking

*   **Implementation:** Use custom metrics to track page views. Use OpenTelemetry to trace user interactions.
*   **Code Solution:**

```typescript
// Frontend (Angular)
import { TracingHelper } from './tracing-helper';

// In a component
ngOnInit() {
  const span = TracingHelper.startSpan('HomePageView');
  this.recordPageView(); // Send metric to backend
  span.end();
}
```

### API Request Monitoring

*   **Implementation:** Use OpenTelemetry to trace API requests.
*   **Code Solution:**

```typescript
import { trace } from '@opentelemetry/api';

// Before making an API call
const tracer = trace.getTracer('my-application', '1.0.0');
const span = tracer.startSpan('api-request');

this.http.get('/api/data').subscribe(() => {
  span.end();
});