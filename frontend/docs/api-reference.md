# API Reference

## Overview

This API reference provides comprehensive documentation for all UI component props, interfaces, and types. Use this as a technical reference when implementing components in your application.

## 🔘 Button Component

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

### Button Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `primary` | Main brand color with white text | Primary actions, form submissions |
| `secondary` | Success color for positive actions | Save, confirm, approve |
| `ghost` | Transparent with border | Secondary actions, minimal UI |
| `danger` | Red color for destructive actions | Delete, remove, cancel |
| `warning` | Orange color for caution | Warning actions, review needed |
| `info` | Blue color for informational actions | Learn more, information |

### Button Sizes

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `sm` | 32px | 8px 12px | 14px | Compact layouts, toolbars |
| `md` | 40px | 12px 16px | 14px | Standard buttons (default) |
| `lg` | 48px | 16px 24px | 16px | Prominent actions, mobile |
| `xl` | 56px | 20px 32px | 18px | Hero sections, main CTAs |

## 📝 Input Component

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

### Input Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard input styling | Normal form fields |
| `error` | Red border and text | Validation errors, required fields |
| `success` | Green border and text | Valid input, confirmed data |
| `warning` | Orange border and text | Needs review, caution needed |

### Input Sizes

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `sm` | 32px | 8px | 12px | Compact forms, data tables |
| `md` | 40px | 12px | 14px | Standard forms (default) |
| `lg` | 48px | 16px | 16px | Prominent forms, mobile |

### Supported Input Types

- `text` - Single line text input
- `email` - Email address with validation
- `password` - Password input with toggle option
- `number` - Numeric input with increment/decrement
- `tel` - Telephone number
- `url` - Web URL
- `search` - Search input with enhanced UX

## 🃏 Card Component

### CardProps Interface

```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card visual variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';

  /** Card size */
  size?: 'sm' | 'md' | 'lg';

  /** Whether the card should be interactive (clickable) */
  interactive?: boolean;

  /** Custom container className for additional styling */
  containerClassName?: string;
}
```

### Card Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard card with subtle styling | General content containers |
| `elevated` | Card with shadow for emphasis | Featured content, callouts |
| `outlined` | Card with prominent border | Structured content, forms |
| `filled` | Card with background color | Alternative sections, highlights |
| `ghost` | Minimal styling for seamless integration | Embedded content, lists |

### Card Sizes

| Size | Padding | Use Case |
|------|---------|----------|
| `sm` | 16px | Compact cards, list items |
| `md` | 24px | Standard cards (default) |
| `lg` | 32px | Spacious cards, hero sections |

### Card Sub-components

#### CardHeader

```tsx
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### CardContent

```tsx
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### CardFooter

```tsx
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### CardTitle

```tsx
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}
```

#### CardDescription

```tsx
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}
```

#### CardImage

```tsx
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}
```

## 🔲 Modal Component

### ModalProps Interface

```tsx
interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  open?: boolean;

  /** Callback fired when the modal should be closed */
  onClose?: () => void;

  /** Whether clicking the overlay should close the modal */
  closeOnOverlayClick?: boolean;

  /** Whether pressing ESC should close the modal */
  closeOnEscape?: boolean;

  /** Prevent the modal from being closed */
  preventClose?: boolean;

  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

### Modal Sizes

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 448px | Simple dialogs, confirmations |
| `md` | 512px | Standard forms, content (default) |
| `lg` | 672px | Complex forms, detailed content |
| `xl` | 896px | Wide content, data tables |
| `full` | 100% | Full screen experiences, galleries |

### Modal Sub-components

#### ModalHeader

```tsx
interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### ModalContent

```tsx
interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### ModalFooter

```tsx
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

#### ModalTitle

```tsx
interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}
```

#### ModalDescription

```tsx
interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}
```

#### ModalClose

```tsx
interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}
```

## 🎨 Type Definitions

### Base Types

```tsx
interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Child components */
  children?: ReactNode;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}
```

### Utility Types

```tsx
type ComponentWithChildren<T = Record<string, never>> = T & {
  children?: ReactNode;
};

type ComponentWithClassName<T = Record<string, never>> = T & {
  className?: string;
};

type ComponentWithVariants<T, V> = T & {
  variant?: V;
};

type ComponentWithSizes<T, S> = T & {
  size?: S;
};
```

### Event Handler Types

```tsx
type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void;
type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;
```

## ♿ Accessibility Types

### AriaAttributes

```tsx
interface AriaAttributes {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  busy?: boolean;
}
```

### AccessibilityProps

```tsx
interface AccessibilityProps {
  /** ARIA attributes for screen readers */
  aria?: AriaAttributes;
  /** Role attribute for semantic meaning */
  role?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Skip link for keyboard users */
  skipLink?: boolean;
}
```

## 📱 Responsive Types

### ResponsiveProps

```tsx
interface ResponsiveProps {
  /** Mobile-first responsive classes */
  mobile?: string;
  /** Tablet breakpoint classes */
  tablet?: string;
  /** Desktop breakpoint classes */
  desktop?: string;
  /** Wide screen breakpoint classes */
  wideScreen?: string;
}
```

## 🎭 Animation Types

### AnimationProps

```tsx
interface AnimationProps {
  /** Animation duration */
  duration?: 'fast' | 'normal' | 'slow' | string;
  /** Animation timing function */
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  /** Animation delay */
  delay?: string;
  /** Disable animations */
  disableAnimation?: boolean;
}
```

## 🔧 Form Validation Types

### ValidationRule

```tsx
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
}
```

### ValidationResult

```tsx
interface ValidationResult {
  isValid: boolean;
  message?: string;
}
```

## 🎨 Theme Types

### ThemeColors

```tsx
interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}
```

### ComponentTheme

```tsx
interface ComponentTheme {
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  borderRadius: Record<string, string>;
}
```

## 📊 Data Types

### Common Data Patterns

```tsx
interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
}
```

## 🚀 Usage Examples

### Complete Form Interface

```tsx
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  initialData?: Partial<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
  errors?: Record<keyof LoginFormData, string>;
}
```

### Component Composition

```tsx
interface CardWithActionsProps extends CardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  image?: string;
  imageAlt?: string;
}
```

## 🔍 Search and Filter Types

### Filter Types

```tsx
interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: SelectOption[];
}

interface SortOption {
  key: string;
  label: string;
  direction?: 'asc' | 'desc';
}
```

### Search Types

```tsx
interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  filters?: FilterOption[];
  onFiltersChange?: (filters: Record<string, any>) => void;
}
```

## 📅 Date and Time Types

### Date Range

```tsx
interface DateRange {
  start: Date;
  end: Date;
}

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: string;
}
```

## 🔔 Notification Types

### Toast Types

```tsx
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: React.ReactNode;
}
```

## 📊 Analytics Types

### Event Tracking

```tsx
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}
```

## 🔒 Security Types

### Authentication

```tsx
interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  permissions?: string[];
  roles?: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

## 🌐 Internationalization Types

### Translation

```tsx
interface TranslationKeys {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
  };
  validation: {
    required: string;
    email: string;
    minLength: string;
  };
}

interface I18nProps {
  t: (key: string) => string;
  locale: string;
  rtl?: boolean;
}
```

## 📱 Mobile Types

### Touch Events

```tsx
interface TouchProps {
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  disabled?: boolean;
}
```

## 🔄 State Management Types

### Loading States

```tsx
interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

interface AsyncOperation<T> {
  data?: T;
  loading: boolean;
  error?: string;
}
```

## 🎯 Utility Types

### Optional Properties

```tsx
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type MakeRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### Deep Types

```tsx
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
```

## 🚨 Error Types

### Error Boundaries

```tsx
interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}
```

### API Errors

```tsx
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}
```

## 📋 Form Types

### Field Types

```tsx
interface FieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: ValidationRule[];
}

interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validationSchema?: any;
  children: React.ReactNode;
}
```

## 🎨 Styling Types

### CSS Variables

```tsx
interface CSSVariables {
  [key: `--${string}`]: string | number;
}

interface ThemeVariables extends CSSVariables {
  '--primary-color': string;
  '--secondary-color': string;
  '--font-family': string;
  '--border-radius': string;
}
```

## 🔧 Development Types

### Component Metadata

```tsx
interface ComponentMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  category: 'layout' | 'form' | 'navigation' | 'feedback' | 'data-display';
  status: 'stable' | 'beta' | 'experimental';
  dependencies?: string[];
}
```

## 📚 Examples with Types

### Typed Button Usage

```tsx
const ButtonExample: React.FC = () => {
  const handleClick: ClickHandler = (event) => {
    console.log('Button clicked!', event.currentTarget);
  };

  const handleLoadingClick = async () => {
    // TypeScript ensures proper async handling
    setLoading(true);
    await apiCall();
    setLoading(false);
  };

  return (
    <Button
      variant="primary"
      size="lg"
      loading={loading}
      loadingText="Saving..."
      onClick={handleClick}
      leftIcon={<SaveIcon />}
      aria-label="Save your changes"
    >
      Save Changes
    </Button>
  );
};
```

### Typed Form Usage

```tsx
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleSubmit = async (data: ContactFormData) => {
    // TypeScript ensures all required fields are present
    const response = await submitForm(data);
    return response;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          errorMessage={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          errorMessage={errors.email}
          required
        />
      </CardContent>
    </Card>
  );
};
```

## 🔍 Type Checking

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Common Type Patterns

```tsx
// Discriminated unions for component variants
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'info';

// Conditional types for props
type ConditionalProps<T> = T extends { variant: 'primary' }
  ? { primaryColor: string }
  : { secondaryColor: string };

// Mapped types for responsive props
type ResponsiveProps<T> = {
  [K in keyof T as K extends string ? `${K}Sm` | `${K}Md` | `${K}Lg` | `${K}Xl` : K]: T[K];
};
```

## 🚨 Error Handling Types

### Component Error States

```tsx
interface ComponentError {
  code: string;
  message: string;
  component?: string;
  timestamp: Date;
  recoverable: boolean;
}

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

## 📈 Performance Types

### Virtualization Types

```tsx
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}
```

### Memoization Types

```tsx
interface MemoizedComponentProps {
  expensiveValue: ExpensiveComputation;
  onValueChange: (value: ExpensiveComputation) => void;
}
```

## 🔧 Testing Types

### Test Utilities

```tsx
interface RenderOptions {
  wrapper?: React.ComponentType;
  initialProps?: Record<string, any>;
}

interface CustomRenderResult extends RenderResult {
  user: UserEvent;
  mockApi: MockApi;
}
```

## 📚 Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Advanced TypeScript Patterns](https://www.typescriptlang.org/docs/handbook/advanced-types.html)

---

**Last Updated**: October 2025
**Version**: 1.0.0