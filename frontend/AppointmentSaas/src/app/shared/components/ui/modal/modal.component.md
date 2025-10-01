# Modal Component Documentation

## Overview

The `app-modal` component provides a flexible and accessible dialog box for displaying content that requires user interaction or attention. It features an overlay, a customizable header with a title and close button, and a body for content.

## Usage

To use the modal component, include the `app-modal` selector in your template. The modal's visibility is controlled by the `isOpen` input property. Content for the header and body is projected using specific selectors.

```html
<app-modal [isOpen]="isModalOpen" (closeModal)="onCloseModal()">
  <div modal-header>
    <h2 modal-title>Modal Title</h2>
  </div>
  <div modal-body>
    <p>This is the content inside the modal.</p>
    <app-button buttonType="primary" (click)="doSomething()">Action</app-button>
  </div>
</app-modal>
```

## Props (Inputs)

| Name     | Type      | Default Value | Description                                  |
|----------|-----------|---------------|----------------------------------------------|
| `isOpen` | `boolean` | `false`       | Controls the visibility of the modal. If `true`, the modal is displayed. |

## Events (Outputs)

| Name        | Type             | Description                                  |
|-------------|------------------|----------------------------------------------|
| `closeModal`| `EventEmitter<void>` | Emits when the modal's close button is clicked or the overlay is clicked. |

## Slots (Content Projection)

The `app-modal` component uses content projection to allow flexible content structure:

| Slot Name     | Description                                        |
|---------------|----------------------------------------------------|
| `[modal-header]` | Used to project content into the modal's header area. |
| `[modal-title]`  | Used to project content as the modal's main title.  |
| `[modal-body]`| Used to project content into the main body of the modal. |

## Styling

The modal component uses CSS custom properties (variables) for styling, defined in `frontend/AppointmentSaas/src/styles/abstracts/_variables.scss`. You can override these variables globally or locally to customize the modal's appearance.

## Accessibility

The `app-modal` component is designed with accessibility in mind:
- It includes an overlay to visually separate the modal from the rest of the page.
- The close button is keyboard navigable.
- Proper `aria` attributes should be added to the modal and its contents for full screen reader support, especially when integrating with Angular Material's `cdk-overlay` or similar accessibility tools.

## Examples

### Basic Modal
```html
<app-modal [isOpen]="showBasicModal" (closeModal)="showBasicModal = false">
  <div modal-header>
    <h2 modal-title>Basic Modal</h2>
  </div>
  <div modal-body>
    <p>This is a simple modal with some content.</p>
    <app-button buttonType="primary" (click)="showBasicModal = false">Close</app-button>
  </div>
</app-modal>
```

### Modal with Custom Header Content
```html
<app-modal [isOpen]="showCustomModal" (closeModal)="showCustomModal = false">
  <div modal-header>
    <h2 modal-title>Custom Header</h2>
    <!-- You can add other elements here, like an icon or additional text -->
    <span style="margin-left: auto;">Additional Info</span>
  </div>
  <div modal-body>
    <p>This modal has a customized header.</p>
  </div>
</app-modal>