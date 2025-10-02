# Button Component

## Overview

The Button component is a core UI element for user interactions in the Appointment Booking System. It provides a consistent, accessible, and customizable button interface that follows the design system specifications.

## 🎯 Features

- **Multiple Variants**: 6 visual styles for different use cases
- **Flexible Sizing**: 4 size options from small to extra-large
- **Loading States**: Built-in loading spinner and disabled state
- **Icon Support**: Left and right icon placement
- **Full Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **TypeScript Support**: Fully typed with comprehensive prop interfaces
- **Responsive Design**: Works seamlessly across all device sizes

## 🚀 Basic Usage

```tsx
import { Button } from '@/components/ui';

// Simple button
<Button>Click me</Button>

// Button with click handler
<Button onClick={() => console.log('Button clicked!')}>
  Submit Form
</Button>
```

## 🎨 Variants

The Button component supports 6 different visual variants:

### Primary (Default)

```tsx
<Button variant="primary">
  Primary Action
</Button>
```

The primary variant is used for the main call-to-action on a page. It uses the primary brand color (`#2563EB`) and should be used sparingly.

### Secondary

```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

The secondary variant is used for secondary actions. It uses a success color (`#10B981`) and is ideal for positive actions like "Save" or "Confirm".

### Ghost

```tsx
<Button variant="ghost">
  Ghost Button
</Button>
```

The ghost variant provides a minimal appearance with a transparent background and border. It's perfect for less prominent actions.

### Danger

```tsx
<Button variant="danger">
  Delete Item
</Button>
```

The danger variant is used for destructive actions like delete, remove, or cancel. It uses a red color (`#EF4444`) to indicate potential danger.

### Warning

```tsx
<Button variant="warning">
  Warning Action
</Button>
```

The warning variant is used for actions that require caution. It uses a yellow/orange color (`#F59E0B`).

### Info

```tsx
<Button variant="info">
  Information
</Button>
```

The info variant is used for informational actions. It uses a blue color (`#3B82F6`).

## 📏 Sizes

Choose from 4 different button sizes:

```tsx
// Small button - 32px height
<Button size="sm">Small</Button>

// Medium button - 40px height (default)
<Button size="md">Medium</Button>

// Large button - 48px height
<Button size="lg">Large</Button>

// Extra large button - 56px height
<Button size="xl">Extra Large</Button>
```

## ⏳ Loading State

Show a loading state with a spinner:

```tsx
<Button
  loading
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</Button>
```

The loading state:
- Disables the button to prevent multiple submissions
- Shows a spinning loader icon
- Displays custom loading text for accessibility
- Maintains button dimensions to prevent layout shift

## 🎯 Icons

Add icons to enhance the button's meaning:

```tsx
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Left icon
<Button leftIcon={<PlusIcon />}>
  Add Item
</Button>

// Right icon
<Button rightIcon={<ArrowRightIcon />}>
  Continue
</Button>

// Both icons
<Button
  leftIcon={<PlusIcon />}
  rightIcon={<ArrowRightIcon />}
>
  Add and Continue
</Button>
```

## 📐 Full Width

Make the button take the full width of its container:

```tsx
<Button fullWidth>
  Full Width Button
</Button>
```

## 🔧 Props API

### ButtonProps Interface

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'info';

  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Whether button should take full width */
  fullWidth?: boolean;

  /** Icon to display before button text */
  leftIcon?: React.ReactNode;

  /** Icon to display after button text */
  rightIcon?: React.ReactNode;

  /** Loading state */
  loading?: boolean;

  /** Loading text for accessibility */
  loadingText?: string;

  /** Custom loading spinner */
  spinner?: React.ReactNode;
}
```

### Inherited HTML Button Props

All standard HTML button attributes are supported:

- `onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void`
- `disabled?: boolean`
- `type?: 'button' | 'submit' | 'reset'`
- `form?: string`
- `name?: string`
- `value?: string | number`
- And all other HTML button attributes

## ♿ Accessibility

The Button component is fully accessible and WCAG 2.1 AA compliant:

### Keyboard Navigation

- **Tab**: Navigate to the button
- **Enter/Space**: Activate the button
- **Escape**: No special behavior (standard button behavior)

### Screen Reader Support

```tsx
<Button aria-label="Save your changes">
  Save
</Button>
```

### Focus Management

- Visible focus indicators
- Proper focus order in forms
- Maintains focus when loading state changes

### Best Practices

1. **Always provide meaningful text**: Screen readers announce the button text
2. **Use aria-label for icon-only buttons**:
   ```tsx
   <Button aria-label="Close dialog">
     <XIcon />
   </Button>
   ```
3. **Avoid using buttons for non-interactive elements**
4. **Test with keyboard navigation**

## 🎨 Styling

### CSS Custom Properties

The button uses CSS custom properties for easy theming:

```css
/* Primary color */
--primary-main: #2563EB;
--primary-dark: #1D4ED8;
--primary-light: #DBEAFE;

/* Component specific */
--button-height: 40px;
--button-border-radius: 6px;
--button-font-weight: 600;
```

### Custom Styling

Override default styles using the `className` prop:

```tsx
<Button
  className="shadow-lg hover:shadow-xl"
  variant="primary"
>
  Custom Styled Button
</Button>
```

## 🔄 State Management

### React State Integration

```tsx
const [isLoading, setIsLoading] = useState(false);

<Button
  loading={isLoading}
  onClick={async () => {
    setIsLoading(true);
    await saveData();
    setIsLoading(false);
  }}
>
  Save Data
</Button>
```

### Form Integration

```tsx
<form onSubmit={handleSubmit}>
  <Input name="email" type="email" />
  <Button type="submit">
    Submit Form
  </Button>
</form>
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <Button loading loadingText="Loading...">
        Save
      </Button>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚨 Common Patterns

### Form Submission

```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="email" type="email" required />
      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

### Confirmation Dialog

```tsx
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setShowConfirm(true)}
      >
        Delete
      </Button>

      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)}>
          <p>Are you sure you want to delete this item?</p>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
```

### Icon Button

```tsx
function IconButton({
  icon: Icon,
  label,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      leftIcon={<Icon className="h-4 w-4" />}
    >
      {/* Screen readers will use aria-label */}
    </Button>
  );
}
```

## 🔧 Advanced Usage

### Polymorphic Button

```tsx
function PolymorphicButton({
  as: Component = 'button',
  children,
  ...props
}: {
  as?: React.ElementType;
  children: React.ReactNode;
} & ButtonProps) {
  return (
    <Button as={Component} {...props}>
      {children}
    </Button>
  );
}

// Use as link
<PolymorphicButton as="a" href="/dashboard">
  Go to Dashboard
</PolymorphicButton>
```

### Button Group

```tsx
function ButtonGroup({ buttons }: { buttons: ButtonProps[] }) {
  return (
    <div className="flex gap-2">
      {buttons.map((buttonProps, index) => (
        <Button key={index} {...buttonProps} />
      ))}
    </div>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

**Button not responding to clicks**
- Ensure `onClick` handler is properly defined
- Check if button is in loading state
- Verify button is not disabled

**Icons not showing**
- Make sure icon components are properly imported
- Check that `leftIcon` or `rightIcon` props are used correctly
- Verify icon components return JSX elements

**Styling not applied**
- Ensure Tailwind CSS is properly configured
- Check that custom classes don't conflict with component styles
- Use the `className` prop for additional styling

**Accessibility issues**
- Always provide meaningful button text or `aria-label`
- Test with keyboard navigation
- Use screen reader testing tools

## 📈 Performance

### Optimization Tips

1. **Use React.memo for static buttons**:
   ```tsx
   const StaticButton = React.memo<ButtonProps>((props) => (
     <Button {...props} />
   ));
   ```

2. **Lazy load button icons**:
   ```tsx
   const LazyIcon = lazy(() => import('@heroicons/react/24/outline'));

   <Button leftIcon={<LazyIcon />}>
     Button with Icon
   </Button>
   ```

3. **Avoid inline functions in render**:
   ```tsx
   // ❌ Bad
   <Button onClick={() => handleClick(item.id)} />

   // ✅ Good
   <Button onClick={handleClick} data-id={item.id} />
   ```

## 🔗 Related Components

- **[Input Component](./input.md)**: Often used with buttons in forms
- **[Modal Component](./modal.md)**: Use buttons to trigger modal dialogs
- **[Card Component](./card.md)**: Buttons are commonly placed in card footers

## 📚 Examples

See the [Button Examples](../../../src/components/ui/examples.tsx) file for comprehensive usage examples including:

- All variants and sizes
- Loading states
- Icon usage
- Form integration
- Accessibility features

## 🤝 Contributing

To contribute to the Button component:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update this documentation
4. Ensure accessibility compliance
5. Test across different browsers and devices

---

**Last Updated**: October 2025
**Version**: 1.0.0