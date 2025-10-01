# Events Documentation

This directory contains comprehensive documentation for all events used in the Multi-Tenant Appointment Booking System. The system uses RabbitMQ and MassTransit for asynchronous communication between microservices.

## Overview

The Multi-Tenant Appointment Booking System follows an event-driven architecture pattern where microservices communicate through events. This approach provides loose coupling between services, improved scalability, and better fault tolerance.

## Event Categories

1. [User Management Events](UserManagementEvents.md) - Events related to user lifecycle
2. [Service Management Events](ServiceManagementEvents.md) - Events related to service lifecycle
3. [Booking Events](BookingEvents.md) - Events related to booking lifecycle
4. [Payment Events](PaymentEvents.md) - Events related to payment processing
5. [Notification Events](NotificationEvents.md) - Events related to notification delivery
6. [Slot Management Events](SlotManagementEvents.md) - Events related to time slot management
7. [Review Events](ReviewEvents.md) - Events related to service reviews

## Event Flow Visualization

![Event Flow Diagram](EventFlowDiagram.mmd)

## Implementation Guidelines

[AI Coding Implementation Guidelines](AICodingImplementationGuidelines.md) - Standards and best practices for implementing events

## Event Catalog

[Event Catalog](EventCatalog.md) - Complete list of all events in the system

## Shared Event Contracts

The `shared/Events` directory contains the actual C# implementations of all event contracts that are shared across microservices.

## Getting Started

To implement events in a service:

1. Reference the `Shared` project which contains all event definitions
2. Implement consumers for events your service needs to handle
3. Use `IPublishEndpoint` to publish events from your service
4. Configure MassTransit in your service's startup code

## Best Practices

1. Keep events small and focused on a single business occurrence
2. Make events immutable
3. Include sufficient context for consumers to process the event
4. Design consumers to be idempotent
5. Handle errors gracefully in event consumers
6. Monitor event processing metrics
7. Version events appropriately for backward compatibility

## Contributing

When adding new events to the system:

1. Document the event in the appropriate markdown file
2. Add the event contract to the `shared/Events` directory
3. Update the event flow diagram
4. Ensure implementation follows the guidelines in the AI Coding Implementation Guidelines