# Design Tokens Documentation

## Overview

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. They are used in place of hard-coded values (such as hex values for color or pixel values for spacing) to maintain a scalable and consistent visual system for UI development.

This document defines the design tokens for the Multi-Tenant Appointment Booking System based on the DesignTokens.json file.

## Color Tokens

### Primary Colors

| Token Name | Value | Usage |
|------------|-------|-------|
| `colors.primary.main` | #2563EB | Main brand color, primary buttons, links |
| `colors.primary.dark` | #1D4ED8 | Darker variant for hover states |
| `colors.primary.light` | #DBEAFE | Lighter variant for backgrounds, subtle accents |

### Secondary Colors

| Token Name | Value | Usage |
|------------|-------|-------|
| `colors.secondary.success` | #10B981 | Success states, confirmations |
| `colors.secondary.warning` | #F59E0B | Warnings, cautions |
| `colors.secondary.danger` | #EF4444 | Errors, destructive actions |
| `colors.secondary.info` | #3B82F6 | Informational messages |

### Neutral Colors

| Token Name | Value | Usage |
|------------|-------|-------|
| `colors.neutral.black` | #000000 | Text, icons |
| `colors.neutral.gray900` | #111827 | Primary text |
| `colors.neutral.gray700` | #374151 | Secondary text |
| `colors.neutral.gray500` | #6B7280 | Disabled text, borders |
| `colors.neutral.gray300` | #D1D5DB | Dividers, backgrounds |
| `colors.neutral.gray100` | #F3F4F6 | Light backgrounds |
| `colors.neutral.white` | #FFFFFF | Base backgrounds |

## Typography Tokens

### Font Family

| Token Name | Value |
|------------|-------|
| `typography.fontFamily` | Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif |

### Font Sizes

| Token Name | Value | Usage |
|------------|-------|-------|
| `typography.sizes.heading1` | 32px | Main page titles |
| `typography.sizes.heading2` | 24px | Section headings |
| `typography.sizes.heading3` | 20px | Sub-section headings |
| `typography.sizes.bodyLarge` | 16px | Main body text |
| `typography.sizes.bodyMedium` | 14px | Secondary text |
| `typography.sizes.bodySmall` | 12px | Captions, labels |

### Font Weights

| Token Name | Value | Usage |
|------------|-------|-------|
| `typography.weights.regular` | 400 | Body text |
| `typography.weights.medium` | 500 | Buttons, labels |
| `typography.weights.semiBold` | 600 | Headings |
| `typography.weights.bold` | 700 | Important text |

## Spacing Tokens

### Spacing Units

| Token Name | Value | Usage |
|------------|-------|-------|
| `spacing.units.xs` | 4px | Extra small spacing |
| `spacing.units.sm` | 8px | Small spacing |
| `spacing.units.md` | 16px | Medium spacing |
| `spacing.units.lg` | 24px | Large spacing |
| `spacing.units.xl` | 32px | Extra large spacing |
| `spacing.units.xxl` | 48px | Double extra large spacing |
| `spacing.units.xxxl` | 64px | Triple extra large spacing |

### Spacing Scale

| Token Name | Value |
|------------|-------|
| `spacing.scale.1` | 4px |
| `spacing.scale.2` | 8px |
| `spacing.scale.3` | 12px |
| `spacing.scale.4` | 16px |
| `spacing.scale.6` | 24px |
| `spacing.scale.8` | 32px |
| `spacing.scale.12` | 48px |
| `spacing.scale.16` | 64px |

## Component Tokens

### Cards

| Token Name | Value | Usage |
|------------|-------|-------|
| `components.cards.borderRadius` | 8px | Card corner radius |
| `components.cards.shadow` | 0 1px 3px rgba(0, 0, 0, 0.1) | Default card shadow |
| `components.cards.hoverShadow` | 0 4px 6px rgba(0, 0, 0, 0.1) | Hover card shadow |
| `components.cards.padding` | 24px | Card padding |

### Buttons

| Token Name | Value | Usage |
|------------|-------|-------|
| `components.buttons.height` | 40px | Button height |
| `components.buttons.padding` | 12px 24px | Button padding |
| `components.buttons.borderRadius` | 6px | Button corner radius |
| `components.buttons.fontWeight` | 600 | Button font weight |
| `components.buttons.transition` | 0.2s ease | Button transition |

### Forms

| Token Name | Value | Usage |
|------------|-------|-------|
| `components.forms.labelSpacing` | 8px | Spacing between label and input |
| `components.forms.inputHeight` | 40px | Input field height |
| `components.forms.inputPadding` | 12px | Input field padding |
| `components.forms.borderRadius` | 6px | Input field corner radius |
| `components.forms.focusRing` | 0 0 0 3px rgba(37, 99, 235, 0.3) | Focus ring style |

### Navigation

| Token Name | Value | Usage |
|------------|-------|-------|
| `components.navigation.height` | 64px | Navigation bar height |
| `components.navigation.hoverBackground` | rgba(0, 0, 0, 0.05) | Hover background |
| `components.navigation.activeIndicatorHeight` | 3px | Active indicator height |
| `components.navigation.activeIndicatorColor` | #2563EB | Active indicator color |

## Breakpoint Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `breakpoints.mobile` | 0px | Mobile breakpoint start |
| `breakpoints.tablet` | 768px | Tablet breakpoint start |
| `breakpoints.desktop` | 1024px | Desktop breakpoint start |
| `breakpoints.wideScreen` | 1400px | Wide screen breakpoint start |

## Container Size Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `containerSizes.mobile` | 100% | Mobile container width |
| `containerSizes.tablet` | 750px | Tablet container width |
| `containerSizes.desktop` | 1200px | Desktop container width |
| `containerSizes.wideScreen` | 1400px | Wide screen container width |

## Animation Tokens

### Timing Functions

| Token Name | Value | Usage |
|------------|-------|-------|
| `animations.timingFunctions.easeInOut` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `animations.timingFunctions.fast` | 0.15s | Fast animations |
| `animations.timingFunctions.normal` | 0.2s | Normal animations |
| `animations.timingFunctions.slow` | 0.3s | Slow animations |

### Common Animations

| Token Name | Value | Usage |
|------------|-------|-------|
| `animations.common.hoverTransition` | 0.2s transition | Hover effects |
| `animations.common.loadingSpinner` | 1s infinite rotation | Loading spinners |
| `animations.common.fadeInOut` | 0.2s ease | Fade in/out effects |
| `animations.common.slideTransition` | 0.3s ease | Slide transitions |

## Accessibility Tokens

### Contrast Ratios

| Token Name | Value | Usage |
|------------|-------|-------|
| `accessibility.contrastRatios.text` | 4.5:1 | Text contrast ratio |
| `accessibility.contrastRatios.interactive` | 3:1 | Interactive element contrast |
| `accessibility.contrastRatios.focus` | 3:1 | Focus indicator contrast |

## Implementation Guidelines

### CSS Custom Properties

Design tokens should be implemented as CSS custom properties for easy access and theming:

```css
:root {
  --color-primary-main: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #DBEAFE;
  --font-size-heading1: 32px;
  --font-size-heading2: 24px;
  --spacing-md: 16px;
  --border-radius-card: 8px;
}
```

### Tailwind CSS Integration

For React projects using Tailwind CSS, tokens can be integrated through CSS custom properties:

```css
/* styles/design-tokens.css */
:root {
  --color-primary-main: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #DBEAFE;
  --font-size-heading1: 32px;
  --font-size-heading2: 24px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --border-radius-sm: 0.125rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### TypeScript Token Access

Tokens can be accessed in React components through CSS custom properties or JavaScript objects:

```typescript
// utils/designTokens.ts
export const designTokens = {
  colors: {
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      light: '#DBEAFE'
    },
    semantic: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    }
  },
  typography: {
    sizes: {
      heading1: '32px',
      heading2: '24px',
      body: '16px'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
} as const;

// hooks/useDesignTokens.ts
import { useMemo } from 'react';

export const useDesignTokens = () => {
  return useMemo(() => ({
    getColor: (path: string) => {
      return path.split('.').reduce((obj: any, key) => obj?.[key], designTokens.colors);
    },
    getSpacing: (size: keyof typeof designTokens.spacing) => designTokens.spacing[size],
    getTypography: (size: keyof typeof designTokens.typography.sizes) => designTokens.typography.sizes[size]
  }), []);
};
```

### JavaScript/TypeScript Access

Tokens should also be accessible in JavaScript/TypeScript for dynamic styling:

```typescript
const designTokens = {
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
```

## Maintenance

Design tokens should be maintained as a single source of truth. Any changes to tokens should be:
1. Documented with clear rationale
2. Reviewed by both design and development teams
3. Updated in all implementation formats (CSS, Sass, JS/TS)
4. Released with appropriate versioning