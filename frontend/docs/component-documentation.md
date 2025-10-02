# UI Components Documentation

## Overview

This documentation provides comprehensive information about the core UI components library for the Appointment Booking System. The component library is built with React, TypeScript, and Tailwind CSS, following modern web development best practices and accessibility standards.

## 🎯 Core Components

### [Button Component](./components/button.md)
Interactive button component with multiple variants, sizes, and states.

**Key Features:**
- 6 visual variants (primary, secondary, ghost, danger, warning, info)
- 4 size options (sm, md, lg, xl)
- Loading states with spinner
- Icon support (left and right)
- Full accessibility compliance
- TypeScript support

### [Input Component](./components/input.md)
Form input component with validation states and comprehensive accessibility features.

**Key Features:**
- 4 validation states (default, error, success, warning)
- 3 size options (sm, md, lg)
- Password visibility toggle
- Icon support and help text
- Label and error message display
- WCAG 2.1 AA compliant

### [Card Component](./components/card.md)
Content container component with structured layout sections.

**Key Features:**
- 5 visual variants (default, elevated, outlined, filled, ghost)
- 3 size options (sm, md, lg)
- Interactive hover effects
- Sub-components (Header, Content, Footer, Title, Description, Image)
- Image/media support
- Responsive design

### [Modal Component](./components/modal.md)
Dialog and overlay component with focus management.

**Key Features:**
- 5 size options (sm, md, lg, xl, full)
- Focus trap and management
- Keyboard navigation (ESC to close)
- Overlay with blur effect
- Smooth animations
- Full accessibility support

## 🚀 Quick Start

### Installation

The components are already installed and configured in your project. To use them in your React components:

```tsx
// Import individual components
import { Button, Input, Card, Modal } from '@/components/ui';

// Or import all components
import * as UI from '@/components/ui';
```

### Basic Usage

```tsx
import { Button, Input, Card, CardHeader, CardContent } from '@/components/ui';

function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Welcome</h2>
      </CardHeader>
      <CardContent>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
        <Button className="mt-4">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Design System

### Color Palette

The components use a consistent color system based on the design tokens:

```css
/* Primary Colors */
--primary-main: #2563EB;
--primary-dark: #1D4ED8;
--primary-light: #DBEAFE;

/* Secondary Colors */
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;

/* Neutral Colors */
--gray-900: #111827;
--gray-700: #374151;
--gray-500: #6B7280;
--gray-300: #D1D5DB;
--gray-100: #F3F4F6;
```

### Typography

The component library uses the Inter font family with a consistent type scale:

```css
/* Font Sizes */
--heading-1: 32px;
--heading-2: 24px;
--heading-3: 20px;
--body-large: 16px;
--body-medium: 14px;
--body-small: 12px;

/* Font Weights */
--regular: 400;
--medium: 500;
--semi-bold: 600;
--bold: 700;
```

### Spacing

Consistent spacing using a scale based on 4px units:

```css
/* Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

## 🔧 Component Architecture

### File Structure

```
src/components/ui/
├── Button/
│   ├── Button.tsx          # Main component
│   └── index.ts           # Exports
├── Input/
│   ├── Input.tsx
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   └── index.ts
├── Modal/
│   ├── Modal.tsx
│   └── index.ts
├── types.ts               # TypeScript definitions
├── examples.tsx           # Usage examples
└── index.ts              # Main exports
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Button`, `CardHeader`)
- **Props**: camelCase (e.g., `onClick`, `isDisabled`)
- **Variants**: lowercase with hyphens (e.g., `primary`, `error-state`)
- **Files**: kebab-case for directories, PascalCase for files

### TypeScript Integration

All components are fully typed with TypeScript:

```tsx
import { ButtonProps, InputProps, CardProps } from '@/components/ui/types';

// Use the types for better IDE support
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## ♿ Accessibility

### WCAG 2.1 AA Compliance

All components meet WCAG 2.1 AA standards:

- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Keyboard Navigation**: Full keyboard operability
- **Screen Readers**: Proper ARIA attributes and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order

### Accessibility Features

- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Tab, Enter, Space, and Escape key support
- **Focus Management**: Proper focus trapping in modals
- **Color Independence**: Information not conveyed by color alone
- **Alternative Text**: Descriptive alt text for images

### Testing Accessibility

```bash
# Install accessibility testing tools
npm install -D @axe-core/react axe-core

# Run accessibility audits
npm run test:a11y
```

## 📱 Responsive Design

### Breakpoints

The components use a mobile-first responsive approach:

```css
/* Breakpoints */
--mobile: 0px;
--tablet: 768px;
--desktop: 1024px;
--wide-screen: 1400px;
```

### Responsive Features

- **Mobile-First**: Designed for mobile devices first
- **Touch-Friendly**: Appropriate touch targets (44px minimum)
- **Flexible Layouts**: Components adapt to different screen sizes
- **Performance**: Optimized for mobile networks

## 🔄 State Management

### Component States

Components support various states:

```tsx
// Button states
<Button variant="primary" size="md">Default</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>

// Input states
<Input variant="default">Default</Input>
<Input variant="error" errorMessage="Error occurred">Error</Input>
<Input variant="success">Success</Input>
```

### State Props

- **Loading**: Shows spinner and disables interaction
- **Disabled**: Prevents interaction and changes appearance
- **Error**: Shows error styling and message
- **Success**: Shows success styling

## 🎭 Theming

### Custom Theming

Components can be customized using CSS custom properties:

```css
/* Custom theme variables */
:root {
  --primary-main: #your-color;
  --border-radius: 8px;
  --font-family: 'Your Font', sans-serif;
}
```

### Dark Mode Support

Components support dark mode through CSS custom properties:

```css
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}
```

## 🧪 Testing

### Testing Strategy

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚀 Performance

### Optimization Techniques

- **Tree Shaking**: Components are designed for tree shaking
- **Code Splitting**: Lazy load components when needed
- **Memoization**: Components use React.memo where appropriate
- **CSS Optimization**: Tailwind CSS purging for smaller bundle sizes

### Performance Best Practices

```tsx
// ✅ Good: Use specific imports
import { Button } from '@/components/ui';

// ❌ Avoid: Import everything
import * as UI from '@/components/ui';

// ✅ Good: Lazy load heavy components
const Modal = lazy(() => import('@/components/ui/Modal'));
```

## 🔧 Development

### Adding New Components

1. Create component directory under `src/components/ui/`
2. Implement component with TypeScript
3. Add comprehensive documentation
4. Include usage examples
5. Add unit and integration tests
6. Update this documentation

### Code Style

- Use functional components with hooks
- Implement proper TypeScript types
- Follow accessibility best practices
- Write comprehensive documentation
- Include usage examples

### Pull Request Requirements

- [ ] Component implementation
- [ ] TypeScript definitions
- [ ] Unit tests
- [ ] Documentation updates
- [ ] Accessibility audit
- [ ] Code review

## 📚 Resources

### Documentation

- [Component Library Overview](./component-library.md)
- [Design System Guide](./design-system.md)
- [Accessibility Guidelines](./accessibility.md)
- [Contributing Guide](./contributing.md)

### Examples

- [Basic Usage Examples](./examples/basic-usage.md)
- [Advanced Patterns](./examples/advanced-patterns.md)
- [Form Examples](./examples/forms.md)
- [Layout Examples](./examples/layouts.md)

### API Reference

- [Button API](./api/button.md)
- [Input API](./api/input.md)
- [Card API](./api/card.md)
- [Modal API](./api/modal.md)

## 🤝 Contributing

We welcome contributions to the component library! Please see our [Contributing Guide](./contributing.md) for details on:

- Setting up the development environment
- Adding new components
- Writing tests
- Documentation standards
- Pull request process

## 📄 License

This component library is part of the Appointment Booking System and follows the same license terms.

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained by**: Frontend Development Team