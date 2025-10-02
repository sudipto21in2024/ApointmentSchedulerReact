# Styling and Theming Guidelines

## Overview

This guide provides comprehensive styling and theming guidelines for the UI component library. It covers design tokens, CSS custom properties, responsive design patterns, and customization techniques to maintain visual consistency across the application.

## 🎨 Design Tokens

### Color System

The component library uses a systematic color palette defined in `DesignTokens.json`:

#### Primary Colors

```css
/* Brand Colors */
--primary-main: #2563EB;    /* Blue 600 */
--primary-dark: #1D4ED8;    /* Blue 700 */
--primary-light: #DBEAFE;   /* Blue 100 */
```

#### Secondary Colors

```css
/* Status Colors */
--success: #10B981;         /* Emerald 500 */
--warning: #F59E0B;         /* Amber 500 */
--danger: #EF4444;          /* Red 500 */
--info: #3B82F6;           /* Blue 500 */
```

#### Neutral Colors

```css
/* Grayscale */
--gray-900: #111827;        /* Near black */
--gray-700: #374151;        /* Dark gray */
--gray-500: #6B7280;        /* Medium gray */
--gray-300: #D1D5DB;        /* Light gray */
--gray-100: #F3F4F6;        /* Very light gray */
--white: #FFFFFF;           /* Pure white */
```

### Typography Scale

#### Font Families

```css
/* Primary Font */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace Font */
--font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### Font Sizes

```css
/* Headings */
--heading-1: 32px;          /* 2rem */
--heading-2: 24px;          /* 1.5rem */
--heading-3: 20px;          /* 1.25rem */

/* Body Text */
--body-large: 16px;         /* 1rem */
--body-medium: 14px;        /* 0.875rem */
--body-small: 12px;         /* 0.75rem */

/* UI Text */
--ui-large: 18px;           /* 1.125rem */
--ui-medium: 16px;          /* 1rem */
--ui-small: 14px;           /* 0.875rem */
```

#### Font Weights

```css
/* Weight Scale */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Line Heights

```css
/* Line Height Scale */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing Scale

Based on 4px units for consistent spacing:

```css
/* Base Units */
--space-1: 4px;             /* 0.25rem */
--space-2: 8px;             /* 0.5rem */
--space-3: 12px;            /* 0.75rem */
--space-4: 16px;            /* 1rem */
--space-6: 24px;            /* 1.5rem */
--space-8: 32px;            /* 2rem */
--space-12: 48px;           /* 3rem */
--space-16: 64px;           /* 4rem */
```

### Border Radius

```css
/* Radius Scale */
--radius-none: 0px;
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 6px;
--radius-xl: 8px;
--radius-full: 9999px;
```

### Shadows

```css
/* Elevation Scale */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## 🎨 Component-Specific Styling

### Button Styling

#### Base Button Styles

```css
/* Button Base */
.button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Button Sizes */
.button-sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--body-small);
}

.button-md {
  height: 40px;
  padding: 0 var(--space-4);
  font-size: var(--body-medium);
}

.button-lg {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--body-large);
}

.button-xl {
  height: 56px;
  padding: 0 var(--space-8);
  font-size: var(--ui-large);
}
```

#### Button Variants

```css
/* Primary Button */
.button-primary {
  background-color: var(--primary-main);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.button-primary:hover {
  background-color: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

/* Secondary Button */
.button-secondary {
  background-color: var(--success);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

/* Ghost Button */
.button-ghost {
  background-color: transparent;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.button-ghost:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}
```

### Input Styling

#### Base Input Styles

```css
/* Input Base */
.input-base {
  display: flex;
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-300);
  background-color: var(--white);
  color: var(--gray-900);
  transition: all 0.2s ease-in-out;
  outline: none;
}

/* Input Sizes */
.input-sm {
  height: 32px;
  padding: 0 var(--space-2);
  font-size: var(--body-small);
}

.input-md {
  height: 40px;
  padding: 0 var(--space-3);
  font-size: var(--body-medium);
}

.input-lg {
  height: 48px;
  padding: 0 var(--space-4);
  font-size: var(--body-large);
}
```

#### Input States

```css
/* Focus State */
.input-base:focus {
  border-color: var(--primary-main);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Error State */
.input-error {
  border-color: var(--danger);
  color: var(--danger);
}

.input-error:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Success State */
.input-success {
  border-color: var(--success);
  color: var(--success);
}

.input-success:focus {
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
```

### Card Styling

#### Base Card Styles

```css
/* Card Base */
.card-base {
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  background-color: var(--white);
  transition: all 0.2s ease-in-out;
}

/* Card Sizes */
.card-sm {
  padding: var(--space-4);
}

.card-md {
  padding: var(--space-6);
}

.card-lg {
  padding: var(--space-8);
}
```

#### Card Variants

```css
/* Elevated Card */
.card-elevated {
  box-shadow: var(--shadow-sm);
}

.card-elevated:hover {
  box-shadow: var(--shadow-lg);
}

/* Outlined Card */
.card-outlined {
  border-width: 2px;
  border-color: var(--gray-300);
}

.card-outlined:hover {
  border-color: var(--gray-400);
}

/* Filled Card */
.card-filled {
  background-color: var(--gray-50);
}

.card-filled:hover {
  background-color: var(--gray-100);
}
```

### Modal Styling

#### Modal Overlay

```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}

/* Modal Content */
.modal-content {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Patterns

#### Container Queries

```css
/* Container */
.container-responsive {
  container-type: inline-size;
}

/* Responsive content within container */
@container (min-width: 768px) {
  .responsive-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
}
```

#### Responsive Typography

```css
/* Responsive text sizes */
.heading-responsive {
  font-size: var(--heading-3);
}

@media (min-width: 768px) {
  .heading-responsive {
    font-size: var(--heading-2);
  }
}

@media (min-width: 1024px) {
  .heading-responsive {
    font-size: var(--heading-1);
  }
}
```

## 🌙 Dark Mode Support

### Dark Mode Variables

```css
/* Dark Mode Color Overrides */
[data-theme="dark"] {
  --primary-main: #3B82F6;
  --primary-dark: #2563EB;
  --background: #111827;
  --surface: #1F2937;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --border: #374151;
}
```

### Dark Mode Implementation

```css
/* Dark mode button */
[data-theme="dark"] .button-primary {
  background-color: var(--primary-main);
  color: var(--white);
  border-color: var(--primary-main);
}

[data-theme="dark"] .button-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

/* Dark mode input */
[data-theme="dark"] .input-base {
  background-color: var(--surface);
  border-color: var(--border);
  color: var(--text-primary);
}

[data-theme="dark"] .input-base::placeholder {
  color: var(--text-secondary);
}
```

## 🎨 Custom Theming

### Creating Custom Themes

```css
/* Custom Brand Theme */
:root {
  /* Brand Colors */
  --brand-primary: #7C3AED;      /* Purple */
  --brand-secondary: #EC4899;    /* Pink */
  --brand-accent: #10B981;       /* Emerald */

  /* Override component colors */
  --primary-main: var(--brand-primary);
  --primary-dark: #6D28D9;
  --success: var(--brand-accent);
}

/* Dark version of custom theme */
[data-theme="dark"] {
  --brand-primary: #8B5CF6;
  --brand-secondary: #F472B6;
  --brand-accent: #34D399;
}
```

### Theme Configuration

```tsx
// theme-config.js
export const themes = {
  light: {
    primary: '#2563EB',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
  },
  dark: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
  },
  purple: {
    primary: '#7C3AED',
    secondary: '#EC4899',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
  },
};
```

## 🔧 CSS Custom Properties

### Global CSS Variables

```css
/* Root variables */
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-secondary: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;

  /* Borders */
  --border-width: 1px;
  --border-color: #E5E7EB;
  --border-radius: 6px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Component-Specific Variables

```css
/* Button variables */
.button {
  --button-height: 40px;
  --button-padding: 0 16px;
  --button-border-radius: 6px;
  --button-font-weight: 600;
  --button-transition: 0.2s ease-in-out;
}

/* Input variables */
.input {
  --input-height: 40px;
  --input-padding: 0 12px;
  --input-border-radius: 6px;
  --input-border-color: #D1D5DB;
  --input-focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

## 📐 Layout Patterns

### Grid Systems

```css
/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Flexbox Patterns

```css
/* Button Groups */
.button-group {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.button-group > * {
  flex-shrink: 0;
}

/* Responsive button group */
@media (max-width: 640px) {
  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .button-group > * {
    width: 100%;
  }
}
```

### Container Patterns

```css
/* Centered Container */
.container-centered {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 768px) {
  .container-centered {
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container-centered {
    padding: 0 var(--space-8);
  }
}
```

## 🎭 Animation Guidelines

### Transition Patterns

```css
/* Standard transitions */
.transition-fast {
  transition: all 0.15s ease-in-out;
}

.transition-normal {
  transition: all 0.2s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

/* Specific property transitions */
.transition-colors {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}
```

### Hover Effects

```css
/* Button hover effects */
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Loading Animations

```css
/* Spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 🔧 Customization Techniques

### Overriding Component Styles

```tsx
// Using className prop
<Button className="bg-red-500 hover:bg-red-600 text-white">
  Custom Button
</Button>

// Using CSS modules
import styles from './CustomButton.module.css';

<Button className={styles.customButton}>
  Styled Button
</Button>
```

### Creating Custom Variants

```tsx
// Extend existing variants
.button-custom {
  @extend .button-primary;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.button-custom:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
```

### Theme Switching

```tsx
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Update CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-main', theme === 'dark' ? '#3B82F6' : '#2563EB');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 📱 Mobile Optimization

### Touch Targets

```css
/* Minimum touch target size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Mobile-first button sizing */
@media (max-width: 768px) {
  .button {
    min-height: 48px;
    padding: 0 var(--space-6);
  }
}
```

### Mobile Typography

```css
/* Mobile typography scale */
@media (max-width: 768px) {
  :root {
    --heading-1: 28px;
    --heading-2: 20px;
    --heading-3: 18px;
    --body-large: 15px;
    --body-medium: 13px;
  }
}
```

## 🎨 Icon Integration

### Icon Sizing

```css
/* Icon sizes matching text */
.icon-sm {
  width: 12px;
  height: 12px;
}

.icon-md {
  width: 16px;
  height: 16px;
}

.icon-lg {
  width: 20px;
  height: 20px;
}

/* Button icons */
.button .icon {
  flex-shrink: 0;
}

.button-sm .icon {
  width: 14px;
  height: 14px;
}

.button-md .icon {
  width: 16px;
  height: 16px;
}
```

### Icon Colors

```css
/* Inherit button color */
.button .icon {
  color: currentColor;
}

/* Custom icon colors */
.button-primary .icon {
  color: var(--white);
}

.button-ghost .icon {
  color: var(--gray-700);
}
```

## 🔧 Development Tools

### CSS Debugging

```css
/* Debug mode styles */
.debug * {
  outline: 1px solid red;
}

.debug *:nth-child(odd) {
  outline-color: blue;
}

/* Enable debug mode */
.debug-mode .component {
  @extend .debug;
}
```

### Style Auditing

```css
/* Unused style detection */
.unused-style {
  /* This style might be unused */
  color: red;
}

/* Used style confirmation */
.used-style {
  /* This style is actively used */
  color: green;
}
```

## 📚 Best Practices

### Performance Considerations

1. **Use CSS custom properties for dynamic theming**
2. **Avoid deep selector nesting**
3. **Prefer CSS classes over inline styles**
4. **Use transform and opacity for animations**
5. **Implement critical CSS for above-the-fold content**

### Maintainability

1. **Follow BEM methodology for custom classes**
2. **Use semantic color names**
3. **Document custom styling decisions**
4. **Create theme tokens for consistency**
5. **Test across different themes and screen sizes**

### Accessibility in Styling

1. **Maintain 4.5:1 contrast ratios**
2. **Use focus-visible for keyboard navigation**
3. **Avoid color-only information**
4. **Ensure touch targets meet minimum sizes**
5. **Test with high contrast mode**

## 🚨 Common Styling Issues

### Z-Index Management

```css
/* Z-index scale */
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

### Box Model Issues

```css
/* Consistent box-sizing */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Reset margins and padding */
.component {
  margin: 0;
  padding: 0;
}
```

## 🔗 Integration Examples

### Tailwind CSS Integration

```css
/* Custom Tailwind colors */
@layer utilities {
  .text-brand {
    color: var(--brand-primary);
  }

  .bg-brand {
    background-color: var(--brand-primary);
  }

  .border-brand {
    border-color: var(--brand-primary);
  }
}
```

### Styled Components Integration

```tsx
import styled from 'styled-components';

const StyledButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
`;
```

## 📚 Further Reading

- [CSS Custom Properties (Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**Last Updated**: October 2025
**Version**: 1.0.0