# UI Flow: Service Management - Create/Edit Service

## 1. Overview

This document outlines the user interface flow for creating and editing services within the Multi-Tenant Appointment Booking System. This workflow utilizes a multi-step form approach to manage various service details, adhering to the design rules for forms and component grouping.

## 2. User Journey Context

This flow is critical for service providers and is part of the following user journeys:
- **Journey 1: Individual Practitioner - Setting Up and Managing Services** (Stage 1: Onboarding - Step 3: Service Creation; Stage 2: Service Management - Step 1: Add New Service).
- It directly addresses Functional Requirements related to Service Management (FR-1.1: Create and manage services, FR-1.2: Configure flexible pricing, FR-1.3: Organize by categories, FR-1.4: Add images/videos).

## 3. High-Level Layout

**Template Type:** Layout 2 (Main Application / Logged In)
**Specific Layout Pattern:** `dashboard_sidebar_layout` from `docs/layout-patterns/page-layouts.json`

The form will be integrated into the main content area of the logged-in application layout. It will follow the "Multi-Step Form" rule from the design specifications, as it involves more than 8 fields and multiple entities. Each step will group a different entity.

## 4. Wireframe (Textual Representation - Multi-Step Form)

```
+---------------------------------------------------------------------------------+
| [Header: Logo | Company Name | Breadcrumbs | User Profile | Notifications]     |
+---------------------------------------------------------------------------------+
| [Sidebar]                   | [Main Content Area]                             |
|  - [Navigation Menu]        |                                                 |
|    - Dashboard              |  [Page Header: Create New Service]              |
|    - Services (Active)      |  [Stepper Component: Step 1/3 - Basic Info]     |
|    - Bookings               |                                                 |
|                             |  [Form Card: Basic Service Information]         |
|                             |  +--------------------------------------------+ |
|                             |  | Service Name: [Input Field]                | |
|                             |  | Description: [Textarea - two columns merged]| |
|                             |  | Category: [Dropdown]                       | |
|                             |  |                                            | |
|                             |  | [Next Button]                              | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Validation Messages: below fields, error icon]|
|                             |                                                 |
|                             |  [Stepper Component: Step 2/3 - Pricing & Slots]|
|                             |                                                 |
|                             |  [Form Card: Pricing Details]                   |
|                             |  +--------------------------------------------+ |
|                             |  | Pricing Type: [Radio Buttons: Fixed, Variable, Package] |
|                             |  | Fixed Price: [Input Field] (if fixed)      | |
|                             |  | Duration: [Input Field]                    | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Form Card: Slot Configuration]                |
|                             |  +--------------------------------------------+ |
|                             |  | Max Parallel Bookings for this Service: [Number Input] |
|                             |  | [Checkbox] Allow Multiple Bookings per Time Slot |
|                             |  |   (If checked) Max Attendees per Slot: [Number Input] |
|                             |  | [Button] Configure Default Availability    |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
|                             |  [Previous Button] [Next Button]            | |
|                             |                                                 |
|                             |  [Stepper Component: Step 3/3 - Media & Review]|
|                             |                                                 |
|                             |  [Form Card: Media Upload]                      |
|                             |  +--------------------------------------------+ |
|                             |  | Service Image: [File Upload Button]        | |
|                             |  | Video Link: [Input Field]                  | |
|                             |  |                                            | |
|                             |  | [Previous Button] [Save Button]            | |
|                             |  +--------------------------------------------+ |
|                             |                                                 |
+---------------------------------------------------------------------------------+
| [Footer: Copyright | Links]                                                     |
+---------------------------------------------------------------------------------+
```

## 5. Angular Component Definitions

### 5.1. `ServiceFormComponent` (Feature Component - Smart/Container)

*   **Purpose:** Orchestrates the multi-step service creation/editing process. Manages the overall form state, navigation between steps, and submission logic.
*   **Selector:** `app-service-form`
*   **Location:** `src/app/features/service-management/service-form/service-form.component.ts`
*   **TypeScript Logic:**
    *   **Imports:** `FormBuilder`, `FormGroup`, `Validators`, `ActivatedRoute`, `Router`, `ServiceService`.
    *   **Properties:** `serviceForm: FormGroup`, `currentStep: number = 0`, `isEditMode: boolean = false`, `isLoading: boolean = false`.
    *   **Constructor:** Injects `FormBuilder`, `ServiceService`, `ActivatedRoute`, `Router`.
    *   **`ngOnInit()`:**
        *   Initializes `serviceForm` with nested `FormGroup`s for `basicInfo`, `pricing`, and `media` steps.
        *   Checks `ActivatedRoute` for an `id` parameter to determine `isEditMode`. If present, fetches existing service data using `ServiceService.getService(id)` and patches the form.
    *   **`nextStep()`, `prevStep()`:** Methods to increment/decrement `currentStep`, controlling the stepper and displaying the correct sub-form. Includes validation check before moving forward.
    *   **`onSubmit()`:**
        *   Triggered on the final step.
        *   Combines data from all nested `FormGroup`s.
        *   Sets `isLoading = true`.
        *   Calls `ServiceService.createService()` or `ServiceService.updateService()` based on `isEditMode`.
        *   Handles success (e.g., navigate to service list) and error states.
        *   Sets `isLoading = false`.
    *   **Validation:** Implements form-level validation and passes controls to child components for granular validation messages.
*   **Styling:** Uses Tailwind CSS for structural layout, leveraging `forms` and `cards` patterns defined in the design system.

### 5.2. `ServiceBasicInfoComponent` (Feature Component - Dumb/Presentational)

*   **Purpose:** Collects basic service information (name, description, category).
*   **Selector:** `app-service-basic-info`
*   **Location:** `src/app/features/service-management/service-form/service-basic-info/service-basic-info.component.ts`
*   **Inputs:** `parentForm: FormGroup` (receives the `basicInfo` FormGroup from `ServiceFormComponent`).
*   **Outputs:** `validityChanged: EventEmitter<boolean>` (emits when its internal form group's validity changes).
*   **TypeScript Logic:**
    *   **Imports:** `FormGroup`, `FormControl`, `Validators`.
    *   **`ngOnInit()`:** Binds local form controls to the `parentForm` group. Subscribes to `parentForm.statusChanges` to emit `validityChanged`.
    *   Fetches service categories using `ServiceService.getCategories()` for the dropdown.
*   **Styling:** Uses Tailwind CSS classes for form elements (`w-full`, `px-3`, `py-2`, `border`, `rounded-md`, `focus:ring-primary`, etc.), adhering to `forms` tokens.

### 5.3. `ServicePricingComponent` (Feature Component - Dumb/Presentational)

*   **Purpose:** Collects pricing and duration details for the service.
*   **Selector:** `app-service-pricing`
*   **Location:** `src/app/features/service-management/service-form/service-pricing/service-pricing.component.ts`
*   **Inputs:** `parentForm: FormGroup` (receives the `pricing` FormGroup).
*   **Outputs:** `validityChanged: EventEmitter<boolean>`.
*   **TypeScript Logic:** Similar to `ServiceBasicInfoComponent`. Manages conditional display of input fields (e.g., `fixedPrice` only visible if `pricingType` is 'Fixed').
*   **Styling:** Uses Tailwind CSS classes.

### 5.4. `ServiceMediaComponent` (Feature Component - Dumb/Presentational)

*   **Purpose:** Allows uploading service images and adding video links.
*   **Selector:** `app-service-media`
*   **Location:** `src/app/features/service-management/service-form/service-media/service-media.component.ts`
*   **Inputs:** `parentForm: FormGroup` (receives the `media` FormGroup).
*   **Outputs:** `validityChanged: EventEmitter<boolean>`, `fileUploaded: EventEmitter<string>` (for image URLs).
*   **TypeScript Logic:** Handles file input change events, validates file types/sizes, and potentially integrates with a `FileUploadService` for actual upload to storage.
*   **Styling:** Uses Tailwind CSS classes for buttons and inputs.

### 5.5. `ServiceService` (Core Service)

*   **Purpose:** Manages all API interactions related to services and categories.
*   **Selector:** N/A (service)
*   **Location:** `src/app/core/services/service.service.ts`
*   **Methods:**
    *   `createService(service: ServiceDto): Observable<Service>`: POST request to create a new service.
    *   `getService(id: string): Observable<Service>`: GET request to retrieve a single service by ID.
    *   `updateService(id: string, service: ServiceDto): Observable<Service>`: PUT request to update an existing service.
    *   `getCategories(): Observable<Category[]>`: GET request to retrieve a list of service categories.
*   **Dependencies:** `HttpClient`.

### 5.6. `StepperComponent` (Shared UI Component)

*   **Purpose:** Provides a visual indicator of progress in multi-step processes.
*   **Selector:** `app-stepper`
*   **Location:** `src/app/shared/components/ui/stepper/stepper.component.ts`
*   **Inputs:** `steps: string[]`, `currentStepIndex: number`.
*   **Outputs:** `stepClicked: EventEmitter<number>` (emits when a step is clicked for direct navigation).
*   **Styling:** Uses Tailwind CSS classes for layout, colors, and spacing, based on `design-tokens.json`.

### 5.7. `ValidationMessageComponent` (Shared UI Component)

*   **Purpose:** Displays user-friendly validation error messages for form controls.
*   **Selector:** `app-validation-message`
*   **Location:** `src/app/shared/components/forms/validation-message/validation-message.component.ts`
*   **Inputs:** `control: AbstractControl | null`, `errorMessages: { [key: string]: string }`.
*   **TypeScript Logic:** Dynamically checks the `control.errors` object and `control.touched` / `control.dirty` status to display the appropriate error message from the `errorMessages` map.
*   **Styling:** Uses Tailwind CSS classes for error text color (`text-red-600`), font size (`text-sm`), and margin.

### 5.8. `CardComponent` (Shared UI Component)

*   **Purpose:** Used to group related form fields into logical sections, as per the "Entity Grouping" rule.
*   **Selector:** `app-card`
*   **Location:** `src/app/shared/components/ui/card/card.component.ts`
*   **Inputs:** `title: string` (for the section header). Content projected via `<ng-content>`.
*   **Styling:** Uses Tailwind CSS classes based on `cards` tokens (`rounded-lg`, `shadow`, `p-6`).

## 6. Strict Adherence

All HTML structure, CSS classes, and design tokens used in the implementation of these components must strictly follow the specifications provided in `docs/ui-components/auth-components-spec.json` (for general form elements), `docs/design-system/design-tokens.json`, and `docs/layout-patterns/page-layouts.json`. No deviations are allowed.