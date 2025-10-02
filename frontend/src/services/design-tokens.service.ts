/**
 * ============================================================================
 * DESIGN TOKENS UTILITY
 * ============================================================================
 * React utility for accessing design tokens programmatically across the application.
 *
 * This utility provides type-safe access to design tokens defined in:
 * - design-tokens.json (comprehensive token definitions)
 * - tokens.css (CSS custom properties)
 *
 * @author Frontend Development Team
 * @version 1.0.0
 * @since 2025-10-02
 * ============================================================================
 */

import designTokens from '../assets/design-tokens.json';

/**
 * ============================================================================
 * COLOR SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get primary brand colors
 * @returns Primary color palette with semantic naming
 */
export function getPrimaryColors() {
  return designTokens.colors.primary;
}

/**
 * Get semantic colors (success, warning, danger, info)
 * @returns Object containing all semantic color palettes
 */
export function getSemanticColors() {
  return designTokens.colors.secondary;
}

/**
 * Get neutral colors for text, backgrounds, and borders
 * @returns Neutral color palette
 */
export function getNeutralColors() {
  return designTokens.colors.neutral;
}

/**
 * Get appointment-specific colors
 * @returns Colors for appointment states and statuses
 */
export function getAppointmentColors() {
  return designTokens.colors.appointment;
}

/**
 * ============================================================================
 * TYPOGRAPHY SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get font family configuration
 * @returns Font family object for primary and monospace fonts
 */
export function getFontFamilies() {
  return designTokens.typography.fontFamily;
}

/**
 * Get font size scale
 * @returns Font sizes in rem units
 */
export function getFontSizes() {
  return designTokens.typography.fontSize;
}

/**
 * Get a specific font size by key
 * @param key - The font size key (xs, sm, base, lg, xl, etc.)
 * @returns Font size value in rem
 */
export function getFontSize(key: keyof typeof designTokens.typography.fontSize) {
  return designTokens.typography.fontSize[key];
}

/**
 * Get font weight scale
 * @returns Font weights from thin (100) to black (900)
 */
export function getFontWeights() {
  return designTokens.typography.fontWeight;
}

/**
 * Get predefined text styles for common use cases
 * @returns Text style objects for headings, body text, labels, etc.
 */
export function getTextStyles() {
  return designTokens.typography.textStyles;
}

/**
 * ============================================================================
 * SPACING SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get spacing scale values
 * @returns Spacing values in rem units (0 to 96)
 */
export function getSpacingScale() {
  return designTokens.spacing.scale;
}

/**
 * Get a specific spacing value by key
 * @param key - The spacing key (0, 1, 2, 4, 8, 12, 16, etc.)
 * @returns Spacing value in rem
 */
export function getSpacing(key: keyof typeof designTokens.spacing.scale) {
  return designTokens.spacing.scale[key];
}

/**
 * Get semantic spacing shortcuts
 * @returns Commonly used spacing values (xs, sm, md, lg, xl, etc.)
 */
export function getSemanticSpacing() {
  return designTokens.spacing.semantic;
}

/**
 * Get component-specific spacing values
 * @returns Spacing configurations for cards, forms, navigation, etc.
 */
export function getComponentSpacing() {
  return designTokens.spacing.components;
}

/**
 * ============================================================================
 * BREAKPOINT SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get breakpoint values for responsive design
 * @returns Breakpoint object with min/max values and container sizes
 */
export function getBreakpoints() {
  return designTokens.breakpoints;
}

/**
 * Get media query strings for use in components
 * @returns Predefined media query strings for different breakpoints
 */
export function getBreakpointQueries() {
  return designTokens.breakpoints.queries;
}

/**
 * ============================================================================
 * COMPONENT TOKEN FUNCTIONS
 * ============================================================================
 */

/**
 * Get card component specifications
 * @returns Card styling tokens including shadows, padding, and borders
 */
export function getCardTokens() {
  return designTokens.components.card;
}

/**
 * Get button component specifications
 * @returns Button styling tokens including sizes, padding, and states
 */
export function getButtonTokens() {
  return designTokens.components.button;
}

/**
 * Get form component specifications
 * @returns Form styling tokens including inputs, labels, and validation
 */
export function getFormTokens() {
  return designTokens.components.form;
}

/**
 * Get navigation component specifications
 * @returns Navigation styling tokens for sidebar, breadcrumbs, etc.
 */
export function getNavigationTokens() {
  return designTokens.components.navigation;
}

/**
 * Get modal component specifications
 * @returns Modal styling tokens including overlay, content, and layout
 */
export function getModalTokens() {
  return designTokens.components.modal;
}

/**
 * Get table component specifications
 * @returns Table styling tokens for headers, rows, and cells
 */
export function getTableTokens() {
  return designTokens.components.table;
}

/**
 * Get badge component specifications
 * @returns Badge styling tokens for status indicators
 */
export function getBadgeTokens() {
  return designTokens.components.badge;
}

/**
 * Get loading component specifications
 * @returns Loading state styling tokens for spinners and skeletons
 */
export function getLoadingTokens() {
  return designTokens.components.loading;
}

/**
 * ============================================================================
 * ANIMATION SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get animation easing functions
 * @returns Cubic-bezier values for different animation types
 */
export function getAnimationEasing() {
  return designTokens.animation.easing;
}

/**
 * Get animation duration values
 * @returns Duration values for fast, normal, slow, and slower animations
 */
export function getAnimationDurations() {
  return designTokens.animation.duration;
}

/**
 * Get predefined animation presets
 * @returns Animation configuration objects for common effects
 */
export function getAnimationPresets() {
  return designTokens.animation.presets;
}

/**
 * ============================================================================
 * Z-INDEX SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get z-index scale for layering components
 * @returns Z-index values for dropdowns, modals, tooltips, etc.
 */
export function getZIndexScale() {
  return designTokens.zIndex;
}

/**
 * ============================================================================
 * ACCESSIBILITY SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get accessibility compliance values
 * @returns WCAG 2.1 AA contrast ratios and requirements
 */
export function getAccessibilityStandards() {
  return designTokens.accessibility;
}

/**
 * Get focus styling tokens
 * @returns Focus ring and outline specifications for keyboard navigation
 */
export function getFocusTokens() {
  return designTokens.accessibility.focus;
}

/**
 * ============================================================================
 * THEME SYSTEM FUNCTIONS
 * ============================================================================
 */

/**
 * Get light theme configuration
 * @returns Light theme color values for backgrounds, text, and borders
 */
export function getLightTheme() {
  return designTokens.theme.light;
}

/**
 * Get dark theme configuration (for future implementation)
 * @returns Dark theme color values for backgrounds, text, and borders
 */
export function getDarkTheme() {
  return designTokens.theme.dark;
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Get CSS custom property name for a given token path
 * Useful for dynamically applying tokens in component styles
 *
 * @param tokenPath - Dot notation path to the token (e.g., 'colors.primary.main')
 * @returns CSS custom property name (e.g., '--color-primary-main')
 *
 * @example
 * ```typescript
 * const cssVar = getCSSVariableName('colors.primary.main');
 * // Returns: '--color-primary-main'
 * ```
 */
export function getCSSVariableName(tokenPath: string): string {
  return `--${tokenPath.replace(/\./g, '-')}`;
}

/**
 * Get all available token categories
 * @returns Array of top-level token category names
 */
export function getTokenCategories(): string[] {
  return Object.keys(designTokens);
}

/**
 * Get metadata about the design token system
 * @returns Version and compliance information
 */
export function getMetadata() {
  return designTokens.metadata;
}

/**
 * Validate that a token path exists in the system
 * @param tokenPath - Dot notation path to validate
 * @returns True if the token exists, false otherwise
 */
export function hasToken(tokenPath: string): boolean {
  const keys = tokenPath.split('.');
  let current: any = designTokens;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Get a token value by its dot notation path
 * @param tokenPath - Dot notation path to the token
 * @param defaultValue - Default value if token doesn't exist
 * @returns Token value or default value
 */
export function getTokenValue(tokenPath: string, defaultValue?: any): any {
  if (!hasToken(tokenPath)) {
    return defaultValue;
  }

  const keys = tokenPath.split('.');
  let current: any = designTokens;

  for (const key of keys) {
    current = current[key];
  }

  return current;
}

/**
 * ============================================================================
 * REACT HOOK FOR DESIGN TOKENS
 * ============================================================================
 */

/**
 * React hook for accessing design tokens in functional components
 * Provides a convenient way to use design tokens with React hooks pattern
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { getPrimaryColor, getFontSize } = useDesignTokens();
 *
 *   return (
 *     <div style={{ color: getPrimaryColor() }}>
 *       Text with primary color and {getFontSize('lg')} font size
 *     </div>
 *   );
 * }
 * ```
 */
export function useDesignTokens() {
  return {
    // Color functions
    getPrimaryColors,
    getSemanticColors,
    getNeutralColors,
    getAppointmentColors,

    // Typography functions
    getFontFamilies,
    getFontSizes,
    getFontSize,
    getFontWeights,
    getTextStyles,

    // Spacing functions
    getSpacingScale,
    getSpacing,
    getSemanticSpacing,
    getComponentSpacing,

    // Breakpoint functions
    getBreakpoints,
    getBreakpointQueries,

    // Component token functions
    getCardTokens,
    getButtonTokens,
    getFormTokens,
    getNavigationTokens,
    getModalTokens,
    getTableTokens,
    getBadgeTokens,
    getLoadingTokens,

    // Animation functions
    getAnimationEasing,
    getAnimationDurations,
    getAnimationPresets,

    // Z-index functions
    getZIndexScale,

    // Accessibility functions
    getAccessibilityStandards,
    getFocusTokens,

    // Theme functions
    getLightTheme,
    getDarkTheme,

    // Utility functions
    getCSSVariableName,
    getTokenCategories,
    getMetadata,
    hasToken,
    getTokenValue,

    // Direct access to tokens object
    tokens: designTokens,
  };
}

/**
 * ============================================================================
 * TYPE DEFINITIONS FOR BETTER TYPE SAFETY
 * ============================================================================
 */

/**
 * Type definition for the complete design tokens structure
 * Provides full IntelliSense and type checking in TypeScript
 */
export type DesignTokens = typeof designTokens;

/**
 * Type definition for color tokens
 */
export type ColorTokens = DesignTokens['colors'];

/**
 * Type definition for typography tokens
 */
export type TypographyTokens = DesignTokens['typography'];

/**
 * Type definition for spacing tokens
 */
export type SpacingTokens = DesignTokens['spacing'];

/**
 * Type definition for breakpoint tokens
 */
export type BreakpointTokens = DesignTokens['breakpoints'];

/**
 * Type definition for component tokens
 */
export type ComponentTokens = DesignTokens['components'];

/**
 * ============================================================================
 * USAGE EXAMPLES AND DOCUMENTATION
 * ============================================================================
 *
 * EXAMPLES:
 *
 * 1. Using functions directly:
 * ```typescript
 * import { getPrimaryColors, getFontSize } from '../services/design-tokens.service';
 *
 * const primaryColor = getPrimaryColors().main;
 * const fontSize = getFontSize('lg');
 * ```
 *
 * 2. Using the React hook:
 * ```typescript
 * import { useDesignTokens } from '../services/design-tokens.service';
 *
 * function MyComponent() {
 *   const { getPrimaryColors, getFontSize } = useDesignTokens();
 *
 *   return (
 *     <div style={{ color: getPrimaryColors().main }}>
 *       Text with {getFontSize('lg')} font size
 *     </div>
 *   );
 * }
 * ```
 *
 * 3. Using CSS custom properties in styled-components:
 * ```typescript
 * import { getCSSVariableName } from '../services/design-tokens.service';
 *
 * const Button = styled.button`
 *   background-color: var(${getCSSVariableName('colors.primary.main')});
 *   font-size: var(${getCSSVariableName('typography.fontSize.lg')});
 *   padding: var(${getCSSVariableName('components.button.padding.md')});
 * `;
 * ```
 *
 * 4. Responsive design with breakpoints:
 * ```typescript
 * import { getBreakpoints } from '../services/design-tokens.service';
 *
 * const breakpoints = getBreakpoints();
 * const isMobile = window.innerWidth <= parseInt(breakpoints.mobile.max);
 * const isTablet = window.innerWidth >= parseInt(breakpoints.tablet.min);
 * ```
 *
 * 5. Animation with design tokens:
 * ```typescript
 * import { getAnimationPresets, getAnimationEasing } from '../services/design-tokens.service';
 *
 * const fadeIn = getAnimationPresets().fadeIn;
 * const easing = getAnimationEasing()[fadeIn.easing];
 *
 * const animatedDiv = {
 *   animationDuration: fadeIn.duration,
 *   animationTimingFunction: easing,
 *   animationFillMode: fadeIn.fillMode
 * };
 * ```
 *
 * ============================================================================
 */