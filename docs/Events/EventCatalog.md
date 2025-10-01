# Event Catalog: Multi-Tenant Appointment Booking System

## Overview

This document provides a comprehensive catalog of events that are used for communication between microservices in the Multi-Tenant Appointment Booking System. The system uses RabbitMQ and MassTransit for asynchronous communication between services.

## Core Services

1. **User Service** - Manages user accounts, authentication, and authorization
2. **Booking Service** - Manages appointment booking workflow
3. **Service Management Service** - Enables service providers to create and manage services
4. **Payment Service** - Processes payment transactions
5. **Notification Service** - Sends automated notifications
6. **Reporting Service** - Generates analytics and business intelligence reports
7. **Configuration Service** - Manages system-wide configurations

## Event Categories

### 1. User Management Events
- UserRegisteredEvent
- UserUpdatedEvent
- UserDeletedEvent
- UserProfileUpdatedEvent

### 2. Service Management Events
- ServiceCreatedEvent
- ServiceUpdatedEvent
- ServiceDeletedEvent
- ServicePublishedEvent
- ServiceUnpublishedEvent

### 3. Booking Events
- BookingCreatedEvent
- BookingConfirmedEvent
- BookingCancelledEvent
- BookingRescheduledEvent
- BookingReminderEvent

### 4. Payment Events
- PaymentProcessedEvent
- PaymentRefundedEvent
- PaymentFailedEvent

### 5. Notification Events
- NotificationSentEvent
- NotificationFailedEvent
- TemplateNotificationEvent

### 6. Slot Management Events
- SlotCreatedEvent
- SlotUpdatedEvent
- SlotDeletedEvent

### 7. Review Events
- ReviewCreatedEvent
- ReviewUpdatedEvent
- ReviewDeletedEvent

## Event Flow Patterns

1. **Synchronous Request/Response** - For immediate responses
2. **Asynchronous Publish/Subscribe** - For event notifications
3. **Saga Pattern** - For distributed transactions spanning multiple services

## Implementation Guidelines

All events implement the `IEvent` interface from `Shared.Contracts` and are handled through MassTransit with RabbitMQ as the message broker.

## Change Log
### 2025-09-17
- **Change Description:** Added `TemplateNotificationEvent` to support dynamic, template-based notifications.
- **Reason:** To enable personalized notification content generation and decouple notification content from the core services.
- **Affected Components:** Notification Service, Booking Service (publishing).