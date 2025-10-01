# Style Guide: Multi-Tenant Appointment Booking System

## 1. Introduction

This style guide defines the visual language and design principles for the Multi-Tenant Appointment Booking System. It establishes consistency across all user interfaces and ensures a cohesive user experience for both service providers and customers.

## 2. Brand Identity

### 2.1 Brand Colors

#### Primary Palette
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Blue | #2563EB | Main brand color, buttons, links |
| Primary Dark | #1D4ED8 | Secondary brand color, hover states |
| Primary Light | #DBEAFE | Backgrounds, subtle accents |

#### Secondary Palette
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Success Green | #10B981 | Success states, confirmations |
| Warning Orange | #F59E0B | Warnings, cautions |
| Danger Red | #EF4444 | Errors, destructive actions |
| Info Blue | #3B82F6 | Informational messages |

#### Neutral Palette
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Black | #000000 | Text, icons |
| Gray 900 | #111827 | Primary text |
| Gray 700 | #374151 | Secondary text |
| Gray 500 | #6B7280 | Disabled text, borders |
| Gray 300 | #D1D5DB | Dividers, backgrounds |
| Gray 100 | #F3F4F6 | Light backgrounds |
| White | #FFFFFF | Base backgrounds |

### 2.2 Typography

#### Font Family
- Primary: Inter (system font stack)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

#### Font Sizes
| Size Name | px Value | Usage |
|-----------|----------|-------|
| Heading 1 | 32px | Main page titles |
| Heading 2 | 24px | Section headings |
| Heading 3 | 20px | Sub-section headings |
| Body Large | 16px | Main body text |
| Body Medium | 14px | Secondary text |
| Body Small | 12px | Captions, labels |

#### Font Weights
| Weight Name | Value | Usage |
|-------------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Buttons, labels |
| SemiBold | 600 | Headings |
| Bold | 700 | Important text |

### 2.3 Spacing System

#### Base Units
- 4px = 1 unit
- 8px = 2 units
- 12px = 3 units
- 16px = 4 units
- 24px = 6 units
- 32px = 8 units
- 48px = 12 units
- 64px = 16 units

#### Spacing Scale
| Spacing Name | Units | px Value |
|--------------|-------|----------|
| xs | 1 | 4px |
| sm | 2 | 8px |
| md | 4 | 16px |
| lg | 6 | 24px |
| xl | 8 | 32px |
| xxl | 12 | 48px |
| xxxl | 16 | 64px |

### 2.4 Component States

#### Button States
| State | Color | Hover | Active |
|-------|-------|-------|--------|
| Primary | #2563EB | #1D4ED8 | #1E40AF |
| Secondary | #FFFFFF | #F3F4F6 | #E5E7EB |
| Ghost | #FFFFFF | #F3F4F6 | #E5E7EB |
| Disabled | #E5E7EB | #E5E7EB | #E5E7EB |

#### Input States
| State | Border Color | Background |
|-------|--------------|------------|
| Default | #D1D5DB | #FFFFFF |
| Focus | #2563EB | #FFFFFF |
| Error | #EF4444 | #FEF2F2 |
| Disabled | #E5E7EB | #F9FAFB |

## 3. Layout and Grid System

### 3.1 Grid System
- 12-column grid system
- Breakpoints:
  - Mobile: 0px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px and above

### 3.2 Container Sizes
- Mobile: 100% width
- Tablet: 750px
- Desktop: 1200px
- Wide Screen: 1400px

### 3.3 Margins and Padding
- Standard margin: 16px (4 units)
- Section spacing: 32px (8 units)
- Card spacing: 24px (6 units)

## 4. Component Design

### 4.1 Cards
- Rounded corners: 8px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Hover effect: 0 4px 6px rgba(0, 0, 0, 0.1)
- Padding: 24px

### 4.2 Buttons
- Height: 40px
- Padding: 12px 24px
- Border radius: 6px
- Font weight: 600
- Transition: 0.2s ease

### 4.3 Forms
- Label spacing: 8px
- Input height: 40px
- Input padding: 12px
- Border radius: 6px
- Focus ring: 0 0 0 3px rgba(37, 99, 235, 0.3)

### 4.4 Navigation
- Navigation height: 64px
- Hover background: rgba(0, 0, 0, 0.05)
- Active indicator: 3px bottom border (#2563EB)

## 5. Icons

### 5.1 Icon Set
- Material Design Icons (baseline set)
- Custom icons for unique actions
- Consistent stroke width: 2px
- Size variations: 16px, 20px, 24px, 32px

### 5.2 Icon Color Palette
- Primary: #111827
- Secondary: #6B7280
- Success: #10B981
- Warning: #F59E0B
- Danger: #EF4444

## 6. Visual Hierarchy

### 6.1 Headings
- H1: 32px, 700 weight, #111827
- H2: 24px, 600 weight, #111827
- H3: 20px, 600 weight, #111827
- H4: 16px, 600 weight, #111827

### 6.2 Text Elements
- Primary text: 16px, 400 weight, #111827
- Secondary text: 14px, 400 weight, #374151
- Caption: 12px, 400 weight, #6B7280

## 7. Animation and Transitions

### 7.1 Timing Functions
- Ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
- Fast: 0.15s
- Normal: 0.2s
- Slow: 0.3s

### 7.2 Common Animations
- Hover effects: 0.2s transition
- Loading spinners: 1s infinite rotation
- Fade in/out: 0.2s ease
- Slide transitions: 0.3s ease

## 8. Responsive Behavior

### 8.1 Mobile First Approach
- Mobile layouts as baseline
- Progressive enhancement for larger screens
- Touch targets minimum 44px

### 8.2 Breakpoint Specific Styles
- Mobile: Flexbox column layout
- Tablet: Grid layout with 2 columns
- Desktop: Grid layout with 3-4 columns

## 9. Accessibility Standards

### 9.1 Color Contrast
- Text: 4.5:1 contrast ratio
- Interactive elements: 3:1 contrast ratio
- Focus indicators: 3:1 contrast ratio

### 9.2 Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Focus management
- Skip to content link

### 9.3 Screen Reader Support
- Semantic HTML structure
- ARIA labels where appropriate
- Proper heading hierarchy
- Landmark regions

## 10. Brand Voice and Tone

### 10.1 Voice Characteristics
- Professional yet approachable
- Clear and concise
- Action-oriented
- Trustworthy

### 10.2 Messaging Guidelines
- Use active voice
- Avoid jargon
- Be specific and helpful
- Show empathy in error messages

## 11. Data Visualization

### 11.1 Chart Colors
- Primary series: #2563EB
- Secondary series: #6B7280
- Accent colors: #10B981, #F59E0B, #EF4444

### 11.2 Chart Types
- Bar charts for comparisons
- Line charts for trends
- Pie charts for proportions
- Heatmaps for time-based data

This style guide provides the foundation for consistent, accessible, and visually appealing user interfaces for the Multi-Tenant Appointment Booking System.