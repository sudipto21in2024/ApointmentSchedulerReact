# Input Component Documentation

## Overview

The `app-input` component provides a styled input field with support for labels, placeholders, and validation. It aims to offer a consistent input experience across the application.

## Usage

To use the input component, include the `app-input` selector in your template and bind its properties.

```html
<app-input
  label="Username"
  placeholder="Enter your username"
  [type]="'text'"
  [value]="username"
  (valueChange)="onUsernameChange($event)"
  [invalid]="usernameInvalid"
  errorMessage="Username is required"
></app-input>
```

## Props (Inputs)

| Name           | Type      | Default Value | Description                                  |
|----------------|-----------|---------------|----------------------------------------------|
| `label`        | `string`  | `''`          | The label text displayed above the input.    |
| `placeholder`  | `string`  | `''`          | The placeholder text inside the input.       |
| `type`         | `string`  | `'text'`      | The HTML `input` type (e.g., `text`, `password`, `email`, `number`). |
| `value`        | `string`  | `''`          | The current value of the input field.        |
| `disabled`     | `boolean` | `false`       | If `true`, the input field will be disabled. |
| `invalid`      | `boolean` | `false`       | If `true`, the input field will display an error state. |
| `errorMessage` | `string`  | `''`          | The error message displayed when `invalid` is `true`. |

## Events (Outputs)

| Name         | Type                      | Description                                  |
|--------------|---------------------------|----------------------------------------------|
| `valueChange`| `EventEmitter<string>` | Emits the current value of the input field on every change. |

## Styling

The input component uses CSS custom properties (variables) for styling, defined in `frontend/AppointmentSaas/src/styles/abstracts/_variables.scss`. You can override these variables globally or locally to customize the input's appearance.

The component also uses BEM-like class names, such as `app-input-container--invalid` for error states.

## Accessibility

The `app-input` component is designed with accessibility in mind:
- It uses a native `<input>` element.
- The `label` input is associated with the input field for screen readers.
- Error messages are visually linked to the input field.

## Examples

### Basic Text Input
```html
<app-input label="Name" placeholder="Enter your name" type="text"></app-input>
```

### Password Input
```html
<app-input label="Password" placeholder="Enter your password" type="password"></app-input>
```

### Disabled Input
```html
<app-input label="Email" placeholder="Enter your email" type="email" [disabled]="true"></app-input>
```

### Input with Error
```html
<app-input label="Required Field" [invalid]="true" errorMessage="This field is mandatory."></app-input>