# Card Component Documentation

## Overview

The `app-card` component is a flexible container used to group related content and display it in a visually distinct block. It supports different elevation levels to indicate hierarchy and importance.

## Usage

To use the card component, simply wrap your content with the `app-card` selector. You can specify an `elevation` level to control its shadow.

```html
<app-card elevation="md">
  <div card-header>
    <h2 card-title>Card Title</h2>
    <p card-subtitle>Optional Subtitle</p>
  </div>
  <div card-content>
    <p>This is the content of the card.</p>
  </div>
</app-card>
```

## Props (Inputs)

| Name        | Type                          | Default Value | Description                                  |
|-------------|-------------------------------|---------------|----------------------------------------------|
| `elevation` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'none'`      | Controls the shadow intensity of the card.   |

## Slots (Content Projection)

The `app-card` component uses content projection to allow flexible content structure:

| Slot Name     | Description                                        |
|---------------|----------------------------------------------------|
| `[card-header]` | Used to project content into the card's header area. |
| `[card-title]`  | Used to project content as the card's main title.  |
| `[card-subtitle]` | Used to project content as the card's subtitle.    |
| `[card-content]`| Used to project content into the main body of the card. |

## Styling

The card component uses CSS custom properties (variables) for styling, defined in `frontend/AppointmentSaas/src/styles/abstracts/_variables.scss`. You can override these variables globally or locally to customize the card's appearance.

The component also uses BEM-like class names for different elevation levels, such as `app-card--elevation-sm`.

## Accessibility

The `app-card` component is a presentational container and relies on the accessibility of its contained content. Ensure that the content within the card is structured semantically and provides appropriate accessibility features.

## Examples

### Basic Card
```html
<app-card>
  <div card-content>
    <p>This is a basic card with no elevation.</p>
  </div>
</app-card>
```

### Card with Medium Elevation
```html
<app-card elevation="md">
  <div card-header>
    <h2 card-title>User Profile</h2>
  </div>
  <div card-content>
    <p>John Doe</p>
    <p>john.doe@example.com</p>
  </div&gt>
</app-card>
```

### Card with Header and Subtitle
```html
<app-card elevation="lg">
  <div card-header>
    <h2 card-title>Settings</h2>
    <p card-subtitle>Adjust your application preferences.</p>
  </div>
  <div card-content>
    <p>Content related to settings.</p>
  </div>
</app-card>