# Input Component

## Overview

The Input component is a comprehensive form input solution for the Appointment Booking System. It provides a consistent, accessible, and feature-rich input interface that handles various input types, validation states, and user interactions.

## 🎯 Features

- **Multiple Input Types**: text, email, password, number, tel, url, search
- **Validation States**: default, error, success, warning with visual feedback
- **Flexible Sizing**: 3 size options for different use cases
- **Icon Support**: Left and right icons for enhanced UX
- **Password Toggle**: Built-in show/hide password functionality
- **Label & Help Text**: Accessible labeling and guidance
- **Error Handling**: Clear error messages and validation feedback
- **Full Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **TypeScript Support**: Fully typed with comprehensive prop interfaces

## 🚀 Basic Usage

```tsx
import { Input } from '@/components/ui';

// Simple text input
<Input placeholder="Enter your name" />

// Input with label
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
/>

// Input with validation
<Input
  label="Password"
  type="password"
  errorMessage="Password must be at least 8 characters"
  variant="error"
/>
```

## 📝 Input Types

The Input component supports all standard HTML input types:

```tsx
// Text input (default)
<Input type="text" placeholder="Enter text" />

// Email input with validation
<Input
  type="email"
  placeholder="Enter your email"
  required
/>

// Password input with toggle
<Input
  type="password"
  placeholder="Enter password"
  showPasswordToggle
/>

// Number input
<Input
  type="number"
  placeholder="Enter quantity"
  min="0"
  max="100"
/>

// Phone input
<Input
  type="tel"
  placeholder="Enter phone number"
  leftIcon={<PhoneIcon />}
/>

// URL input
<Input
  type="url"
  placeholder="Enter website URL"
/>

// Search input
<Input
  type="search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
/>
```

## 🎨 Validation States

### Default State

```tsx
<Input
  label="Username"
  placeholder="Enter your username"
  variant="default"
/>
```

The default state is used for normal inputs without any validation feedback.

### Error State

```tsx
<Input
  label="Email"
  type="email"
  variant="error"
  errorMessage="Please enter a valid email address"
  value={invalidEmail}
/>
```

Use the error state to indicate validation errors or required field issues.

### Success State

```tsx
<Input
  label="Confirmation Code"
  variant="success"
  value="Code verified"
  rightIcon={<CheckIcon />}
/>
```

Use the success state to indicate successful validation or completed actions.

### Warning State

```tsx
<Input
  label="Password Strength"
  type="password"
  variant="warning"
  helpText="Consider using a stronger password"
  showPasswordToggle
/>
```

Use the warning state for cautionary feedback that doesn't prevent form submission.

## 📏 Sizes

Choose from 3 different input sizes:

```tsx
// Small input - 32px height
<Input size="sm" placeholder="Small input" />

// Medium input - 40px height (default)
<Input size="md" placeholder="Medium input" />

// Large input - 48px height
<Input size="lg" placeholder="Large input" />
```

## 👁️ Password Visibility Toggle

Enable password visibility toggle for password inputs:

```tsx
<Input
  label="Password"
  type="password"
  placeholder="Enter your password"
  showPasswordToggle
/>
```

The toggle button:
- Shows/hides password text
- Includes proper ARIA labels for accessibility
- Maintains focus management
- Can be customized or disabled

## 🎯 Icons

Add icons to enhance the input's meaning and improve UX:

```tsx
// Left icon
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  leftIcon={<MailIcon />}
/>

// Right icon
<Input
  label="Search"
  type="search"
  placeholder="Search"
  rightIcon={<SearchIcon />}
/>

// Both icons
<Input
  label="Phone"
  type="tel"
  placeholder="Enter phone"
  leftIcon={<PhoneIcon />}
  rightIcon={<ArrowIcon />}
/>
```

## 📋 Labels and Help Text

### Labels

```tsx
<Input
  label="Full Name"
  placeholder="Enter your full name"
  required
/>
```

Labels are:
- Automatically associated with the input for accessibility
- Displayed above the input field
- Support required field indicators (*)
- Styled consistently with the design system

### Help Text

```tsx
<Input
  label="Password"
  type="password"
  helpText="Password must be at least 8 characters long"
  showPasswordToggle
/>
```

Help text provides:
- Additional context or instructions
- Formatting requirements
- Usage tips
- Positioned below the input field

### Error Messages

```tsx
<Input
  label="Email"
  type="email"
  variant="error"
  errorMessage="Please enter a valid email address"
  value={email}
/>
```

Error messages:
- Display validation errors clearly
- Use the error variant styling
- Include role="alert" for screen readers
- Positioned below the input field

## 🔧 Props API

### InputProps Interface

```tsx
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input visual variant */
  variant?: 'default' | 'error' | 'success' | 'warning';

  /** Input size */
  size?: 'sm' | 'md' | 'lg';

  /** Label text displayed above the input */
  label?: string;

  /** Help text displayed below the input */
  helpText?: string;

  /** Error message displayed when variant is 'error' */
  errorMessage?: string;

  /** Icon to display on the left side of the input */
  leftIcon?: React.ReactNode;

  /** Icon to display on the right side of the input */
  rightIcon?: React.ReactNode;

  /** Whether to show the password visibility toggle */
  showPasswordToggle?: boolean;

  /** Custom container className for additional styling */
  containerClassName?: string;

  /** Whether the input is required */
  required?: boolean;
}
```

### Inherited HTML Input Props

All standard HTML input attributes are supported:

- `value?: string`
- `onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void`
- `onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void`
- `onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void`
- `placeholder?: string`
- `disabled?: boolean`
- `readOnly?: boolean`
- `maxLength?: number`
- `min?: string | number`
- `max?: string | number`
- `pattern?: string`
- And all other HTML input attributes

## ♿ Accessibility

The Input component is fully accessible and WCAG 2.1 AA compliant:

### Keyboard Navigation

- **Tab**: Navigate to the input
- **Shift + Tab**: Navigate away from the input
- **Arrow keys**: Move cursor within the input (when applicable)

### Screen Reader Support

```tsx
<Input
  label="Email Address"
  type="email"
  aria-describedby="email-help"
  helpText="We'll never share your email"
/>
```

### Focus Management

- Visible focus indicators
- Proper focus order in forms
- Maintains focus when validation errors occur

### ARIA Attributes

The component automatically includes:
- `aria-label` or `aria-labelledby` for the label
- `aria-describedby` for help text and error messages
- `aria-invalid` for error states
- `aria-required` for required fields

### Best Practices

1. **Always provide labels**: Use the `label` prop or external label with `id`
2. **Use appropriate input types**: Helps mobile keyboards and validation
3. **Provide helpful error messages**: Clear, actionable feedback
4. **Test with screen readers**: Ensure proper announcements
5. **Consider field length**: Use appropriate `maxLength` for data constraints

## 🎨 Styling

### CSS Custom Properties

The input uses CSS custom properties for theming:

```css
/* Input colors */
--input-border: #d1d5db;
--input-focus: #2563eb;
--input-error: #ef4444;
--input-success: #10b981;

/* Input dimensions */
--input-height: 40px;
--input-border-radius: 6px;
--input-padding: 12px;
```

### Custom Styling

Override default styles using the `className` prop:

```tsx
<Input
  className="border-2 border-blue-500"
  containerClassName="mb-6"
  label="Custom Styled Input"
/>
```

## 🔄 Form Integration

### Basic Form

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />

      <Input
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        multiline
        rows={4}
      />

      <Button type="submit">Send Message</Button>
    </form>
  );
}
```

### Validation Integration

```tsx
function ValidatedForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        variant={errors.email ? 'error' : 'default'}
        errorMessage={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        variant={errors.password ? 'error' : 'default'}
        errorMessage={errors.password}
        showPasswordToggle
        required
      />

      <Button type="submit">Create Account</Button>
    </form>
  );
}
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui';

describe('Input', () => {
  it('renders with label and placeholder', () => {
    render(
      <Input
        label="Email"
        placeholder="Enter your email"
      />
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(
      <Input
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows error state', () => {
    render(
      <Input
        label="Email"
        variant="error"
        errorMessage="Invalid email"
      />
    );

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(
    <Input label="Accessible Input" />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚨 Common Patterns

### Search Input

```tsx
function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <Input
      type="search"
      placeholder="Search for services..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      leftIcon={<SearchIcon />}
      rightIcon={
        query && (
          <button onClick={() => setQuery('')}>
            <XIcon className="h-4 w-4" />
          </button>
        )
      }
    />
  );
}
```

### Password Confirmation

```tsx
function PasswordInput() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const confirmError = confirmPassword && !passwordsMatch;

  return (
    <div className="space-y-4">
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showPasswordToggle
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        variant={confirmError ? 'error' : passwordsMatch ? 'success' : 'default'}
        errorMessage={confirmError ? 'Passwords do not match' : undefined}
        showPasswordToggle
        required
      />
    </div>
  );
}
```

### Numeric Input with Validation

```tsx
function AgeInput() {
  const [age, setAge] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setAge(value);
    }
  };

  return (
    <Input
      label="Age"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={age}
      onChange={handleChange}
      helpText="Enter your age in years"
      rightIcon={<UserIcon />}
    />
  );
}
```

## 🔧 Advanced Usage

### Custom Validation

```tsx
function CustomInput({
  validation,
  ...props
}: InputProps & {
  validation?: (value: string) => { isValid: boolean; message?: string }
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (validation) {
      const result = validation(newValue);
      setError(result.isValid ? '' : (result.message || 'Invalid input'));
    }
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      variant={error ? 'error' : 'default'}
      errorMessage={error}
    />
  );
}
```

### Controlled Input with Debouncing

```tsx
function DebouncedInput({
  onSearch,
  delay = 300,
  ...props
}: InputProps & {
  onSearch: (query: string) => void;
  delay?: number;
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, onSearch, delay]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

## 🚨 Troubleshooting

### Common Issues

**Input not responding to changes**
- Ensure `onChange` handler is properly defined
- Check if input is disabled or read-only
- Verify the input is not in a loading state

**Icons not showing**
- Make sure icon components are properly imported
- Check that `leftIcon` or `rightIcon` props are used correctly
- Verify icon components return JSX elements

**Validation not working**
- Ensure `errorMessage` is provided when using `variant="error"`
- Check that form validation logic is correctly implemented
- Verify that `onChange` handlers are updating component state

**Accessibility issues**
- Always provide a label using the `label` prop or external label
- Test with keyboard navigation
- Use screen reader testing tools

**Styling issues**
- Ensure Tailwind CSS is properly configured
- Check that custom classes don't conflict with component styles
- Use developer tools to inspect computed styles

## 📈 Performance

### Optimization Tips

1. **Use controlled inputs wisely**:
   ```tsx
   // ✅ Good: Controlled input with state
   const [value, setValue] = useState('');
   <Input value={value} onChange={(e) => setValue(e.target.value)} />

   // ✅ Good: Uncontrolled input for performance
   <Input defaultValue="initial" onChange={handleChange} />
   ```

2. **Debounce rapid changes**:
   ```tsx
   // Use for search inputs or real-time validation
   const debouncedOnChange = debounce(handleChange, 300);
   <Input onChange={debouncedOnChange} />
   ```

3. **Avoid unnecessary re-renders**:
   ```tsx
   // ✅ Good: Memoize expensive validation
   const validateInput = useMemo(() => (value) => {
     // Expensive validation logic
   }, []);

   // ❌ Bad: Inline validation on every render
   <Input onChange={(e) => expensiveValidation(e.target.value)} />
   ```

## 🔗 Related Components

- **[Button Component](./button.md)**: Often used with inputs in forms
- **[Modal Component](./modal.md)**: May contain forms with inputs
- **[Card Component](./card.md)**: Inputs are commonly placed in card content

## 📚 Examples

See the [Input Examples](../../../src/components/ui/examples.tsx) file for comprehensive usage examples including:

- All input types and variants
- Validation states
- Icon usage
- Password toggle functionality
- Form integration
- Accessibility features

## 🤝 Contributing

To contribute to the Input component:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update this documentation
4. Ensure accessibility compliance
5. Test across different browsers and devices

---

**Last Updated**: October 2025
**Version**: 1.0.0