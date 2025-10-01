# Button Component Documentation

## Overview

The `app-button` component is a versatile button component that can be customized with different types, sizes, and states (e.g., disabled, loading). It provides a consistent look and feel across the application.

## Usage

To use the button component, simply add the `app-button` selector to your HTML.

```html
<app-button buttonType="primary" (click)="onClick()">Click Me</app-button>
<app-button buttonType="secondary" [disabled]="true">Disabled Button</app-button>
<app-button buttonType="warn" [loading]="true">Loading...</app-button>
```

## Props (Inputs)

| Name        | Type                          | Default Value | Description                                          |
|-------------|-------------------------------|---------------|------------------------------------------------------|
| `buttonType`| `'primary' \| 'secondary' \| 'accent' \| 'warn' \| 'success' \| 'text'` | `'primary'`   | Defines the visual style of the button.              |
| `size`      | `'small' \| 'medium' \| 'large'` | `'medium'`    | Defines the size of the button.                      |
| `fullWidth` | `boolean`                     | `false`       | If `true`, the button will take up the full width of its parent container. |
| `disabled`  | `boolean`                     | `false`       | If `true`, the button will be disabled.              |
| `loading`   | `boolean`                     | `false`       | If `true`, a loading spinner will be displayed inside the button. |

## Events (Outputs)

| Name    | Type             | Description                                  |
|---------|------------------|----------------------------------------------|
| `click` | `EventEmitter<void>` | Emits when the button is clicked.            |

## Styling

The button component uses CSS custom properties (variables) for styling, defined in `frontend/AppointmentSaas/src/styles/abstracts/_variables.scss`. You can override these variables globally or locally to customize the button's appearance.

Example of overriding a variable:

```css
/* In your component's SCSS or a global style file */
.my-custom-button {
  --color-primary-500: #673ab7; /* Purple */
}
```

The component also uses BEM-like class names for specific variations, such as `app-button--primary`, `app-button--small`, etc.

## Accessibility

The `app-button` component is designed with accessibility in mind:
- It uses a native `<button>` element, ensuring proper semantic meaning.
- Disabled state is handled via the `disabled` attribute.
- Visual focus indicators are provided.

## Examples

### Primary Button
```html
<app-button buttonType="primary">Primary Button</app-button>
```

### Secondary Button
```html
<app-button buttonType="secondary">Secondary Button</app-button>
```

### Accent Button
```html
<app-button buttonType="accent">Accent Button</app-button>
```

### Warning Button
```html
<app-button buttonType="warn">Warning Button</app-button>
```

### Success Button
```html
<app-button buttonType="success">Success Button</app-button>
```

### Text Button
```html
<app-button buttonType="text">Text Button</app-button>
```

### Small Button
```html
<app-button buttonType="primary" size="small">Small Button</app-button>
```

### Large Button
```html
<app-button buttonType="primary" size="large">Large Button</app-button>
```

### Full Width Button
```html
<app-button buttonType="primary" fullWidth="true">Full Width Button</app-button>
```

### Disabled Button
```html
<app-button buttonType="primary" [disabled]="true">Disabled Button</app-button>
```

### Loading Button
```html
<app-button buttonType="primary" [loading]="true">Loading...</app-button>