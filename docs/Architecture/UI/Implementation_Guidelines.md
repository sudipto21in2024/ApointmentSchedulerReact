# UI Implementation Guidelines

## Overview

This document provides comprehensive guidelines for implementing the UI components and templates for the Multi-Tenant Appointment Booking System. These guidelines ensure consistent implementation, maintainability, and adherence to the design system principles.

## Technology Stack

### Frontend Framework
- **React 18+**: Primary framework for UI implementation with modern features
- **TypeScript**: Strongly typed language for enhanced code quality
- **React Hooks**: For state management and lifecycle management
- **Redux Toolkit**: State management for complex applications

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **CSS Custom Properties**: For design token implementation
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **CSS-in-JS**: Optional styling approach with styled-components

### Component Libraries
- **Material-UI (MUI)**: Pre-built React components with design system
- **AG Grid React**: Data grid implementation for React
- **FullCalendar React**: Calendar and scheduling components
- **React Hook Form**: Performant forms with easy validation

### Development Tools
- **Vite**: Fast build tool and dev server with HMR
- **Storybook**: Component development and documentation
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting consistency

## Project Structure

### Directory Organization
```
src/
├── components/              # Shared UI components
│   ├── atoms/               # Basic components (buttons, inputs, etc.)
│   ├── molecules/           # Composite components
│   ├── organisms/           # Complex components
│   └── templates/           # Page templates
├── features/                # Feature-specific modules
│   ├── auth/                # Authentication-related components
│   ├── booking/             # Booking functionality
│   ├── dashboard/           # Dashboard components
│   ├── services/            # Service management
│   └── user/                # User profile components
├── hooks/                   # Custom React hooks
├── store/                   # Redux store configuration
├── styles/                  # Global styles and design tokens
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions and helpers
├── App.tsx                  # Root component
├── main.tsx                 # Application entry point
└── vite-env.d.ts           # Vite environment types
```

### Component Structure
```
Button/
├── Button.tsx               # Component implementation
├── Button.module.css        # Component-specific styles (optional)
├── Button.test.tsx          # Component tests
├── index.ts                 # Public API export
└── README.md               # Component documentation
```

## Component Implementation

### Component Creation Process

#### 1. Component Specification
Before implementing a component, create a specification that includes:
- Component name and description
- Props interface with TypeScript types
- Event definitions
- Slot/content projection requirements
- Accessibility requirements
- Responsive behavior specifications

#### 2. Component Scaffolding
Create component files manually or use a generator:
```bash
# Create component directory
mkdir -p src/components/atoms/Button

# Create component files
touch src/components/atoms/Button/Button.tsx
touch src/components/atoms/Button/Button.test.tsx
touch src/components/atoms/Button/index.ts
```

#### 3. TypeScript Implementation
```typescript
import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  block?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  block = false,
  onClick,
  children,
  className,
  type = 'button',
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-800 underline hover:no-underline focus:ring-blue-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm rounded',
    medium: 'px-4 py-2 text-base rounded-md',
    large: 'px-6 py-3 text-lg rounded-md'
  };

  const classes = twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    block && 'w-full',
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      aria-busy={loading}
      {...props}
    >
      <span className="flex items-center gap-2">
        {icon && <i className={icon} />}
        {children}
      </span>
      {loading && (
        <span className="ml-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
};
```

#### 4. JSX Implementation
```tsx
import React from 'react';
import { Button } from './Button';

const LoginForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Handle form submission
    setLoading(false);
  };

  return (
    <Button
      variant="primary"
      size="large"
      block
      loading={loading}
      onClick={handleSubmit}
      className="w-full"
    >
      Sign In
    </Button>
  );
};
```

#### 5. Styling Implementation with Tailwind CSS
```tsx
// Button.tsx with Tailwind CSS
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  className,
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500';
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
      case 'link':
        return 'text-blue-600 hover:text-blue-800 underline hover:no-underline focus:ring-blue-500';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm';
      case 'medium':
        return 'px-4 py-2 text-base';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const classes = twMerge(
    'inline-flex items-center justify-center font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'rounded-md',
    getVariantClasses(),
    getSizeClasses(),
    block && 'w-full',
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </span>
    </button>
  );
};
```

### Component Best Practices

#### 1. TypeScript Guidelines
- Use strict typing for all component props and state
- Define interfaces for complex props and data structures
- Use union types for props with limited options
- Implement proper error boundaries
- Follow React functional component patterns with hooks

#### 2. JSX Guidelines
- Use semantic HTML elements
- Implement proper accessibility attributes
- Minimize logic in JSX with custom hooks
- Use React.Fragment for multiple elements
- Follow proper key patterns for lists

#### 3. Styling Guidelines
- Use Tailwind CSS utility classes for consistent styling
- Implement responsive design with Tailwind responsive prefixes
- Use CSS custom properties for design tokens
- Optimize for performance with CSS-in-JS when needed
- Follow mobile-first responsive design approach

#### 4. Accessibility Guidelines
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Provide meaningful text alternatives
- Use semantic HTML structure
- Test with screen readers and accessibility tools

## Template Implementation

### Template Creation Process

#### 1. Template Analysis
- Analyze template requirements from design specifications
- Identify required components and their props
- Determine responsive behavior requirements
- Plan data flow and state management

#### 2. Template Implementation with React
```tsx
import React, { useState } from 'react';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/atoms/FormField';
import { Heading } from '../components/atoms/Heading';
import { Text } from '../components/atoms/Text';
import { Link } from '../components/atoms/Link';
import { Divider } from '../components/atoms/Divider';
import { Logo } from '../components/atoms/Logo';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export const LoginTemplate: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle form submission
      console.log('Login attempt:', formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="medium" variant="full" className="mx-auto mb-8" />
          <Heading level={1} className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </Heading>
          <Text variant="subtitle" className="text-gray-600">
            Sign in to your account
          </Text>
        </div>

        <div className="space-y-6">
          <Divider text="Or sign in with email" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              type="email"
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={errors.email}
              required
            />

            <FormField
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={errors.password}
              showToggle
              required
            />

            <div className="flex items-center justify-between">
              <FormField
                type="checkbox"
                name="remember"
                label="Remember me"
                checked={formData.remember}
                onChange={(value) => handleInputChange('remember', value)}
              />
              <Link href="/forgot-password" className="text-sm">
                Forgot password?
              </Link>
            </div>

            <Button
              variant="primary"
              block
              size="large"
              type="submit"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Text className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium">
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};
```

### Template Best Practices

#### 1. Composition
- Compose templates from smaller components
- Use content projection for flexible layouts
- Implement template inheritance when appropriate
- Parameterize templates for reusability

#### 2. Data Flow
- Implement clear data flow patterns
- Use reactive forms for complex form handling
- Manage state with NgRx for large applications
- Implement proper error handling

#### 3. Performance
- Optimize template rendering
- Use OnPush change detection strategy
- Implement lazy loading for templates
- Minimize DOM manipulation

## Design Token Integration

### CSS Custom Properties Implementation
```scss
:root {
  // Colors
  --color-primary-main: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #DBEAFE;
  
  // Typography
  --font-size-heading1: 32px;
  --font-size-heading2: 24px;
  --font-size-body-large: 16px;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  // Components
  --border-radius-card: 8px;
  --button-height-medium: 40px;
}
```

### Sass Variable Implementation
```scss
// _design-tokens.scss
$color-primary-main: #2563EB;
$color-primary-dark: #1D4ED8;
$font-size-heading1: 32px;
$spacing-md: 16px;
$border-radius-card: 8px;
```

### TypeScript Token Access
```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      light: '#DBEAFE'
    }
  },
  typography: {
    sizes: {
      heading1: '32px',
      heading2: '24px'
    }
  }
};

// token-service.ts
import { Injectable } from '@angular/core';
import { designTokens } from './design-tokens';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  getToken(path: string): string {
    return path.split('.').reduce((obj: any, key) => obj[key], designTokens);
  }
}
```

## State Management

### Redux Toolkit Implementation

#### 1. State Definition and Slice
```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
```

#### 2. Store Configuration
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 3. Custom Hooks for State Management
```typescript
// hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginUser, logout } from '../store/slices/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, loading, error } = useSelector((state: RootState) => state.user);

  const login = (email: string, password: string) => {
    dispatch(loginUser({ email, password }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user: currentUser,
    loading,
    error,
    login,
    logout: logoutUser,
    isAuthenticated: !!currentUser
  };
};
```

#### 4. Usage in Components
```typescript
// components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './atoms/Button';
import { FormField } from './atoms/FormField';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData.email, formData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        type="email"
        label="Email"
        value={formData.email}
        onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
        required
      />

      <FormField
        type="password"
        label="Password"
        value={formData.password}
        onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
        required
      />

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <Button type="submit" loading={loading} block>
        Sign In
      </Button>
    </form>
  );
};
```

## Responsive Design Implementation

### Tailwind CSS Responsive Utilities

Tailwind CSS provides built-in responsive utilities using mobile-first breakpoints:

```scss
// tailwind.config.js breakpoints
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### Responsive Component Implementation
```tsx
// ResponsiveCard.tsx
import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      p-4
      md:p-6
      lg:p-8
      md:flex
      md:flex-row
      lg:max-w-4xl
      lg:mx-auto
      ${className}
    `}>
      {children}
    </div>
  );
};

// Usage
<ResponsiveCard>
  <div className="md:w-1/2 lg:w-2/3">
    <h2 className="text-xl md:text-2xl lg:text-3xl">
      Responsive Heading
    </h2>
    <p className="text-sm md:text-base lg:text-lg">
      This content scales with screen size
    </p>
  </div>
  <div className="md:w-1/2 lg:w-1/3">
    <img
      src="/image.jpg"
      alt="Responsive image"
      className="w-full h-48 md:h-64 lg:h-80 object-cover rounded"
    />
  </div>
</ResponsiveCard>
```

### Custom Responsive Hook
```typescript
// hooks/useResponsive.ts
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ResponsiveState {
  currentBreakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      width,
      currentBreakpoint: getCurrentBreakpoint(width),
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        setState({
          width,
          currentBreakpoint: getCurrentBreakpoint(width),
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
};

function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
}
```

## Accessibility Implementation

### Semantic HTML
```html
<!-- Good example -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/services">Services</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Page Title</h1>
  <p>Page content...</p>
</main>

<!-- Avoid -->
<div class="header">
  <div class="nav">
    <div class="list">
      <div class="item"><span class="link">Dashboard</span></div>
    </div>
  </div>
</div>
```

### ARIA Attributes
```html
<!-- Form with proper labeling -->
<form>
  <label for="email">Email Address</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    aria-describedby="email-error"
    aria-invalid="false">
  <div id="email-error" role="alert" aria-live="polite"></div>
</form>

<!-- Custom button with proper roles -->
<button 
  role="button" 
  aria-pressed="false"
  aria-label="Toggle menu">
  Menu
</button>
```

### Keyboard Navigation Hook
```typescript
// hooks/useKeyboardNavigation.ts
import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  preventDefault?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    preventDefault = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, preventDefault]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { handleKeyDown };
};
```

### Focus Management Hook
```typescript
// hooks/useFocusManagement.ts
import { useRef, useEffect } from 'react';

export const useFocusManagement = (autoFocus = false) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  const focus = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  const blur = () => {
    if (ref.current) {
      ref.current.blur();
    }
  };

  return { ref, focus, blur };
};
```

## Performance Optimization

### Code Splitting and Lazy Loading
```tsx
// App.tsx with React Router lazy loading
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components
const Dashboard = React.lazy(() => import('./features/Dashboard/Dashboard'));
const Services = React.lazy(() => import('./features/Services/Services'));
const Auth = React.lazy(() => import('./features/Auth/Auth'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/services/*" element={<Services />} />
          <Route path="/auth/*" element={<Auth />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### React.memo for Component Optimization
```tsx
import React from 'react';

interface UserCardProps {
  user: User;
  onSelect?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = React.memo(({ user, onSelect }) => {
  console.log(`Rendering user: ${user.name}`);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <button
        onClick={() => onSelect?.(user.id)}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        Select
      </button>
    </div>
  );
});
```

### Custom Hooks for Performance
```typescript
// hooks/useMemoizedList.ts
import { useMemo } from 'react';

export const useMemoizedList = <T,>(
  items: T[],
  getKey: (item: T) => string | number
) => {
  return useMemo(() => {
    return items.map((item, index) => ({
      item,
      key: getKey(item),
      index
    }));
  }, [items, getKey]);
};

// Usage
const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  const memoizedUsers = useMemoizedList(users, (user) => user.id);

  return (
    <div className="space-y-2">
      {memoizedUsers.map(({ item: user, key }) => (
        <UserCard key={key} user={user} />
      ))}
    </div>
  );
};
```

### Virtual Scrolling for Large Lists
```tsx
// hooks/useVirtualization.ts
import { useState, useEffect, useMemo } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  items: any[];
}

export const useVirtualization = ({ itemHeight, containerHeight, items }: UseVirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetTop: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, scrollTop, visibleCount]);

  return {
    totalHeight,
    visibleItems,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)
  };
};
```

## Testing Implementation

### Unit Testing with React Testing Library
```typescript
// components/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading spinner when loading', () => {
    render(<Button loading>Loading button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('should apply correct variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });
});
```

### Integration Testing with React Testing Library
```typescript
// features/Auth/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from './LoginForm';
import userReducer from '../../store/slices/userSlice';

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: {
      user: {
        currentUser: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('LoginForm', () => {
  it('should render login form', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if loading state is handled correctly
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('should show validation errors', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

### Custom Render Function
```typescript
// test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import userReducer from '../store/slices/userSlice';

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  store?: ReturnType<typeof configureStore>;
}

const AllTheProviders: React.FC<{ children: React.ReactNode; store: any; initialEntries?: string[] }> = ({
  children,
  store,
  initialEntries = ['/']
}) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    store = configureStore({
      reducer: { user: userReducer },
      preloadedState: { user: { currentUser: null, loading: false, error: null } }
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders store={store} initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender };
```

## Documentation and Storybook

### Storybook Stories for React
```typescript
// components/Button/Button.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component that supports multiple variants, sizes, and states.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'link']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    },
    block: {
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
    children: 'Secondary Button'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    loading: true,
    children: 'Loading Button'
  }
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    children: 'Button with Icon',
    // Assuming you have an icon component or use a library like Heroicons
    // icon: <SomeIcon />
  }
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
};
```

### API Documentation with JSDoc
```typescript
// components/Button/Button.tsx
import React from 'react';

/**
 * Button Component
 *
 * A versatile button component that supports multiple variants, sizes, and states.
 * Built with Tailwind CSS for consistent styling and responsive design.
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="large"
 *   onClick={() => console.log('clicked')}
 * >
 *   Click Me
 * </Button>
 * ```
 *
 * @example With loading state
 * ```tsx
 * <Button loading={isSubmitting} onClick={handleSubmit}>
 *   Submit Form
 * </Button>
 * ```
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant that determines the visual style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** Button size that controls padding and font size */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading spinner and disable interaction */
  loading?: boolean;
  /** Whether the button should take full width */
  block?: boolean;
  /** Icon element to display alongside text */
  icon?: React.ReactNode;
  /** Click handler function */
  onClick?: () => void;
  /** Button content */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  className,
  children,
  ...props
}) => {
  // Component implementation
};
```

## Deployment and CI/CD

### Build Optimization with Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux']
  }
});
```

### Package.json Scripts
```json
{
  "name": "appointment-booking-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "type-check": "tsc --noEmit"
  }
}
```

### CI/CD Pipeline for React
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Type checking
      run: npm run type-check

    - name: Lint
      run: npm run lint

    - name: Test
      run: npm run test:coverage

    - name: Build
      run: npm run build

    - name: Upload coverage to Codecov
      if: matrix.node-version == '20.x'
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build for production
      run: npm run build

    - name: Deploy to production
      run: |
        # Add your deployment steps here
        echo "Deploying to production..."
```

These implementation guidelines provide a comprehensive framework for developing consistent, maintainable, and high-quality UI components and templates for the Multi-Tenant Appointment Booking System.