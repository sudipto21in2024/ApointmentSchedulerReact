# Contributing Guide

## Overview

This guide provides comprehensive instructions for contributing to the UI component library. Whether you're fixing bugs, adding new features, improving documentation, or enhancing accessibility, this guide will help you make meaningful contributions.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Latest stable version
- **Git**: For version control
- **TypeScript**: Understanding of TypeScript concepts
- **React**: Familiarity with React hooks and patterns

### Development Environment Setup

1. **Fork the repository**:
   ```bash
   git clone https://github.com/your-username/appointment-booking-ui.git
   cd appointment-booking-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your settings
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm run test
   npm run test:a11y
   ```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Core UI components
│   │   ├── Button/           # Button component
│   │   ├── Input/            # Input component
│   │   ├── Card/             # Card component
│   │   ├── Modal/            # Modal component
│   │   ├── types.ts          # TypeScript definitions
│   │   ├── examples.tsx      # Usage examples
│   │   └── index.ts          # Component exports
│   ├── auth/                 # Authentication components
│   ├── layout/               # Layout components
│   └── [feature]/            # Feature-specific components
├── utils/                    # Utility functions
├── hooks/                    # Custom React hooks
├── styles/                   # Global styles
├── types/                    # TypeScript type definitions
└── lib/                      # Third-party integrations

docs/                         # Documentation
├── components/               # Component-specific docs
├── api-reference.md         # Props and API reference
├── styling-guidelines.md    # Styling and theming guide
├── accessibility-guidelines.md # A11y best practices
└── contributing.md          # This file
```

## 🔧 Development Workflow

### 1. Creating New Components

#### Component Structure

```typescript
// src/components/ui/NewComponent/NewComponent.tsx
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

/**
 * Comprehensive component description
 * Include purpose, features, and usage context
 */
const newComponentVariants = cva(
  // Base styles
  'base-styles-here',
  {
    variants: {
      variant: {
        primary: 'variant-styles',
        secondary: 'variant-styles',
      },
      size: {
        sm: 'size-styles',
        md: 'size-styles',
        lg: 'size-styles',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  /** Custom prop description */
  customProp?: string;
  /** Event handler description */
  onCustomEvent?: (data: CustomType) => void;
}

/**
 * NewComponent - Brief description
 *
 * Detailed description with:
 * - Purpose and use cases
 * - Key features
 * - Best practices
 *
 * @example
 * ```tsx
 * <NewComponent variant="primary" size="md">
 *   Component content
 * </NewComponent>
 * ```
 */
export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, size, customProp, onCustomEvent, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(newComponentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NewComponent.displayName = 'NewComponent';

export default NewComponent;
```

#### Index File

```typescript
// src/components/ui/NewComponent/index.ts
export { NewComponent, type NewComponentProps } from './NewComponent';
export { default } from './NewComponent';
```

#### TypeScript Types

Add types to `src/components/ui/types.ts`:

```typescript
export interface NewComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  customProp?: string;
}
```

### 2. Component Documentation

#### Component Documentation File

Create `docs/components/new-component.md`:

```markdown
# NewComponent

## Overview

Brief description of the component's purpose and key features.

## 🚀 Basic Usage

```tsx
import { NewComponent } from '@/components/ui';

<NewComponent>
  Component content
</NewComponent>
```

## 🎨 Variants

### Primary

```tsx
<NewComponent variant="primary">
  Primary variant
</NewComponent>
```

## 📏 Sizes

### Small

```tsx
<NewComponent size="sm">
  Small component
</NewComponent>
```

## 🔧 Props API

### NewComponentProps

```tsx
interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  customProp?: string;
}
```

## ♿ Accessibility

Document accessibility features and ARIA usage.

## 🧪 Testing

Include testing examples and best practices.

---

**Last Updated**: October 2025
**Version**: 1.0.0
```

#### Update Main Documentation

Update `docs/component-documentation.md` to include the new component.

### 3. Adding Tests

#### Unit Tests

```typescript
// src/components/ui/NewComponent/NewComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent>Content</NewComponent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<NewComponent variant="secondary">Content</NewComponent>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('variant-secondary');
  });

  it('handles custom events', () => {
    const handleCustomEvent = jest.fn();
    render(
      <NewComponent onCustomEvent={handleCustomEvent}>
        Content
      </NewComponent>
    );

    // Trigger custom event logic
    expect(handleCustomEvent).toHaveBeenCalledTimes(0);
  });
});
```

#### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(<NewComponent>Accessible content</NewComponent>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Integration Tests

```typescript
describe('NewComponent Integration', () => {
  it('works with form submission', async () => {
    render(
      <form>
        <NewComponent name="test" />
        <button type="submit">Submit</button>
      </form>
    );

    // Test integration behavior
  });
});
```

### 4. Styling Guidelines

#### CSS Custom Properties

```css
/* Component-specific variables */
.new-component {
  --component-padding: var(--space-4);
  --component-border-radius: var(--radius-lg);
  --component-transition: var(--transition-normal);
}
```

#### Responsive Design

```css
/* Mobile-first responsive styles */
.new-component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .new-component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .new-component {
    /* Desktop styles */
  }
}
```

## 🔄 Git Workflow

### Branch Naming Convention

```bash
# Feature branches
feature/add-new-component
feature/improve-button-accessibility
feature/fix-input-validation

# Bug fix branches
bugfix/modal-focus-trap
bugfix/button-loading-state

# Documentation branches
docs/update-component-guide
docs/add-accessibility-examples

# Refactoring branches
refactor/component-structure
refactor/types-cleanup
```

### Commit Message Format

```bash
# Format: type(scope): description

# Types
feat: new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: test additions/changes
chore: maintenance tasks

# Examples
feat(button): add loading state with spinner
fix(input): resolve password toggle accessibility issue
docs(card): update props documentation
test(modal): add focus management tests
refactor(types): consolidate component interfaces
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Run all tests** to ensure nothing is broken
6. **Create a pull request** with a clear description

#### PR Template

```markdown
## Description

Brief description of changes and why they're needed.

## Changes

- [ ] Component implementation
- [ ] TypeScript definitions
- [ ] Unit tests
- [ ] Documentation updates
- [ ] Accessibility compliance

## Testing

- [ ] Unit tests pass
- [ ] Accessibility tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## Screenshots

[Before and after screenshots if applicable]

## Related Issues

[Link to related issues or tasks]

## Checklist

- [ ] Follows existing code patterns
- [ ] Includes proper TypeScript types
- [ ] Has comprehensive documentation
- [ ] Meets accessibility standards
- [ ] Includes appropriate tests
- [ ] Updates changelog if needed
```

## 🧪 Testing Guidelines

### Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Accessibility Testing**: jest-axe
- **E2E Testing**: Playwright (future)
- **Visual Testing**: Chromatic (future)

### Test Organization

```typescript
// src/components/ui/NewComponent/
├── NewComponent.tsx           # Component implementation
├── NewComponent.test.tsx      # Unit tests
├── NewComponent.a11y.test.tsx # Accessibility tests
└── NewComponent.stories.tsx   # Storybook stories
```

### Test Categories

#### Unit Tests
- Component rendering
- Props handling
- Event handling
- State management
- Error conditions

#### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- ARIA implementation
- Focus management
- Color contrast

#### Integration Tests
- Component interaction
- Form integration
- Modal behavior
- Responsive design

### Writing Good Tests

```typescript
// ✅ Good test
it('should handle user input correctly', () => {
  const handleChange = jest.fn();
  render(<Input onChange={handleChange} />);

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test input' } });

  expect(handleChange).toHaveBeenCalledWith(
    expect.objectContaining({
      target: expect.objectContaining({
        value: 'test input'
      })
    })
  );
});

// ❌ Bad test
it('should render input', () => {
  render(<Input />);
  // Too vague, doesn't test specific behavior
});
```

## 📚 Documentation Guidelines

### Component Documentation Structure

1. **Overview**: Purpose and key features
2. **Basic Usage**: Simple examples
3. **Advanced Usage**: Complex scenarios
4. **Props API**: Complete prop reference
5. **Accessibility**: A11y features and guidelines
6. **Styling**: Customization options
7. **Testing**: Testing examples
8. **Troubleshooting**: Common issues and solutions

### Writing Documentation

#### Use Clear Examples

```markdown
## Basic Usage

```tsx
// Simple example
<Button variant="primary">
  Click me
</Button>

// Advanced example
<Button
  variant="primary"
  size="lg"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```
```

#### Include Accessibility Information

```markdown
## ♿ Accessibility

The Button component is fully accessible:

- **Keyboard**: Activate with Enter or Space
- **Screen Reader**: Announces button purpose
- **Focus**: Visible focus indicator
- **ARIA**: Supports aria-label for additional context
```

#### Document Props Clearly

```markdown
## 🔧 Props API

### ButtonProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `onClick` | `(event: React.MouseEvent) => void` | - | Click event handler |
```

## 🎨 Styling Guidelines

### CSS Architecture

#### BEM Methodology

```css
/* Block */
.button { /* Base button styles */ }

/* Element */
.button__icon { /* Button icon styles */ }
.button__text { /* Button text styles */ }

/* Modifier */
.button--primary { /* Primary variant */ }
.button--loading { /* Loading state */ }
.button--disabled { /* Disabled state */ }
```

#### CSS Custom Properties

```css
/* Component variables */
.button {
  --button-height: 40px;
  --button-padding: 0 16px;
  --button-border-radius: 6px;
  --button-font-weight: 600;
}

/* Theme integration */
[data-theme="dark"] .button {
  --button-background: #3B82F6;
  --button-color: #FFFFFF;
}
```

### Responsive Design

```css
/* Mobile-first approach */
.component {
  /* Mobile styles (default) */
  padding: var(--space-4);
  font-size: var(--body-medium);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
    font-size: var(--body-large);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
  }
}
```

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

All contributions must maintain WCAG 2.1 AA compliance:

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order must be maintained
- Focus indicators must be clearly visible

#### Screen Reader Support
- Proper semantic HTML structure
- Descriptive ARIA labels and descriptions
- Status messages must be announced

#### Visual Design
- Color contrast ratio of 4.5:1 for normal text
- Color contrast ratio of 3:1 for large text
- Information not conveyed by color alone

### Accessibility Testing

```bash
# Run accessibility tests
npm run test:a11y

# Run axe-core CLI
npx @axe-core/cli http://localhost:3000

# Check color contrast
npx puppeteer-contrast-check
```

## 🚨 Code Quality Standards

### TypeScript Guidelines

#### Strict Type Checking

```typescript
// ✅ Good: Proper typing
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

const getUser = (id: string): Promise<User> => {
  return api.get(`/users/${id}`);
};

// ❌ Bad: Loose typing
const getUser = (id) => {
  return api.get(`/users/${id}`);
};
```

#### Generic Constraints

```typescript
// ✅ Good: Proper generic constraints
interface SelectProps<T extends string | number> {
  options: Array<{ label: string; value: T }>;
  value?: T;
  onChange: (value: T) => void;
}

// ❌ Bad: Overly broad generics
interface SelectProps<T> {
  options: T[];
  value?: T;
  onChange: (value: T) => void;
}
```

### Performance Guidelines

#### Component Optimization

```typescript
// ✅ Good: Memoized component
const ExpensiveComponent = React.memo<{ data: ExpensiveData }>(({ data }) => {
  return <div>{data.content}</div>;
});

// ✅ Good: Callback memoization
const handleClick = useCallback(() => {
  doSomething(expensiveValue);
}, [expensiveValue]);

// ❌ Bad: Inline objects/arrays
<div style={{ color: 'red' }}>Content</div>
```

#### Bundle Size Optimization

```typescript
// ✅ Good: Tree-shakable imports
import { Button } from '@/components/ui';

// ❌ Bad: Namespace imports
import * as UI from '@/components/ui';
```

## 🔍 Code Review Process

### Review Checklist

#### Code Quality
- [ ] Follows existing code patterns
- [ ] Proper TypeScript typing
- [ ] No ESLint errors or warnings
- [ ] Consistent naming conventions
- [ ] Appropriate component composition

#### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled properly
- [ ] Error states implemented
- [ ] Loading states implemented

#### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast adequate
- [ ] Focus management correct

#### Testing
- [ ] Unit tests included
- [ ] Accessibility tests included
- [ ] Tests pass in CI/CD
- [ ] Test coverage adequate

#### Documentation
- [ ] Component documented
- [ ] Props documented
- [ ] Examples included
- [ ] Usage guidelines provided

### Automated Checks

```yaml
# .github/workflows/pr-check.yml
name: Pull Request Checks

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run test:a11y
```

## 📈 Performance Standards

### Bundle Size Limits

- **Individual Component**: < 5KB gzipped
- **Component Library**: < 50KB gzipped
- **Total Application**: < 500KB gzipped

### Runtime Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Memory Usage

- **Component Memory**: < 1MB per component instance
- **Event Listeners**: Properly cleaned up
- **Timers**: Properly cleared

## 🔧 Tooling and Scripts

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run type-check      # TypeScript type checking
npm run lint           # ESLint code linting
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier code formatting

# Testing
npm run test           # Run all tests
npm run test:watch     # Watch mode for tests
npm run test:coverage  # Generate coverage report
npm run test:a11y      # Accessibility testing

# Documentation
npm run docs:build     # Build documentation site
npm run docs:serve     # Serve documentation locally

# Analysis
npm run analyze        # Bundle analyzer
npm run lighthouse     # Performance audit
```

### Development Tools

#### VS Code Extensions (Recommended)

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Hero**: TypeScript utilities
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Bracket Pair Colorizer 2**: Bracket matching
- **GitLens**: Git integration

#### Browser Extensions

- **React Developer Tools**: React debugging
- **Redux Developer Tools**: State management debugging
- **axe DevTools**: Accessibility testing
- **Lighthouse**: Performance auditing

## 🚨 Troubleshooting

### Common Issues

#### TypeScript Errors

```typescript
// ❌ Error: Property does not exist
<Button invalidProp="value" />

// ✅ Solution: Check props interface
<Button variant="primary" size="md" />
```

#### Import Issues

```typescript
// ❌ Error: Module not found
import { Button } from '@/components/ui/Button';

// ✅ Solution: Use index file
import { Button } from '@/components/ui';
```

#### Styling Issues

```css
/* ❌ Problem: Missing Tailwind classes */
.custom-button {
  @apply bg-blue-500 hover:bg-blue-700;
}

/* ✅ Solution: Ensure Tailwind is configured */
.module.css {
  customButton: 'bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded';
}
```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Q&A and general discussion
- **Pull Requests**: Code contributions
- **Team Chat**: Real-time questions and support

### Asking Questions

When asking for help:

1. **Search existing issues** first
2. **Provide context** about your use case
3. **Include code examples** and error messages
4. **Specify your environment** (OS, Node version, browser)
5. **Describe expected vs actual behavior**

### Reporting Bugs

```markdown
## Bug Report

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- OS: [Operating System]
- Browser: [Browser name and version]
- Node.js: [Node.js version]
- Component version: [Component version]

### Additional Context
[Additional information, screenshots, etc.]
```

## 🎉 Recognition

Contributors who make significant improvements will be:

- **Featured in release notes**
- **Mentioned in documentation**
- **Invited to maintain component areas**
- **Recognized in team meetings**

## 📜 Code of Conduct

All contributors must follow the project's Code of Conduct:

- **Be respectful** to all community members
- **Use inclusive language** in all communications
- **Focus on constructive feedback**
- **Report violations** to maintainers
- **Help create a positive environment**

## 🔄 Release Process

### Version Management

The project follows [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (X.Y.0): New features, backward compatible
- **Patch** (X.Y.Z): Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Accessibility audit passes
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)
- [ ] Version bumped in package.json
- [ ] Release notes written

---

**Last Updated**: October 2025
**Version**: 1.0.0