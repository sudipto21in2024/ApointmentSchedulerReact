# Shared Components Documentation

## Overview

This directory contains all shared/reusable UI components for the Multi-Tenant Appointment Booking System. This documentation serves as the master reference for component development, ensuring consistency across all features and user flows.

## Component Categories

### 1. Layout Components
Essential components for application structure and navigation.

#### 1.1 MainLayoutComponent
- **Purpose**: Main application layout wrapper with sidebar and header
- **Location**: `src/app/core/layout/main-layout/main-layout.component.ts`
- **Features**:
  - Responsive sidebar integration
  - Header with breadcrumbs and user info
  - Footer integration
  - Mobile-friendly hamburger menu
- **Used In**: All authenticated pages (Layout 2)
- **Dependencies**: AppHeaderComponent, AppSidebarComponent, AppFooterComponent

#### 1.2 AuthLayoutComponent
- **Purpose**: Centered layout for authentication pages
- **Location**: `src/app/core/layout/auth-layout/auth-layout.component.ts`
- **Features**:
  - Centered card design
  - Minimal header/footer
  - Background styling
- **Used In**: Login, Registration, Password Reset (Layout 1)
- **Dependencies**: None

#### 1.3 AppHeaderComponent
- **Purpose**: Top navigation bar with user controls
- **Location**: `src/app/shared/components/layout/app-header/app-header.component.ts`
- **Features**:
  - Logo and company name
  - Breadcrumb navigation
  - User profile dropdown
  - Notifications drawer
  - Responsive design
- **Used In**: All authenticated pages
- **Dependencies**: BreadcrumbComponent

#### 1.4 AppSidebarComponent
- **Purpose**: Collapsible navigation sidebar
- **Location**: `src/app/shared/components/layout/app-sidebar/app-sidebar.component.ts`
- **Features**:
  - Hierarchical menu structure
  - Collapsible to icons
  - Mobile hamburger menu
  - Role-based menu items
  - Active state management
- **Used In**: All authenticated pages
- **Dependencies**: MenuItem interface

#### 1.5 AppFooterComponent
- **Purpose**: Application footer with links and copyright
- **Location**: `src/app/shared/components/layout/app-footer/app-footer.component.ts`
- **Features**:
  - Copyright information
  - Legal links (Privacy, Terms)
  - Social media links (optional)
  - Responsive design
- **Used In**: All pages
- **Dependencies**: None

### 2. UI Components
Basic reusable UI elements following the design system.

#### 2.1 CardComponent
- **Purpose**: Content container with consistent styling
- **Location**: `src/app/shared/components/ui/card/card.component.ts`
- **Features**:
  - Shadow and border radius
  - Optional header/title
  - Padding variations
  - Hover effects
- **Used In**: Dashboard widgets, form sections, content blocks
- **Dependencies**: None
- **Design Tokens**: `components.cards.*`

#### 2.2 ButtonComponent
- **Purpose**: Interactive button with variants
- **Location**: `src/app/shared/components/ui/button/button.component.ts`
- **Features**:
  - Multiple variants (primary, secondary, outline, ghost)
  - Size options (sm, md, lg)
  - Loading states
  - Disabled states
  - Icon support
- **Used In**: Forms, actions, navigation
- **Dependencies**: None
- **Design Tokens**: `components.buttons.*`

#### 2.3 InputComponent
- **Purpose**: Form input wrapper with validation
- **Location**: `src/app/shared/components/ui/input/input.component.ts`
- **Features**:
  - Label integration
  - Error message display
  - Icon support
  - Validation states
  - Accessibility features
- **Used In**: All forms
- **Dependencies**: ValidationMessageComponent
- **Design Tokens**: `components.forms.*`

#### 2.4 ModalComponent
- **Purpose**: Dialog/modal window container
- **Location**: `src/app/shared/components/ui/modal/modal.component.ts`
- **Features**:
  - Overlay background
  - Close button
  - Size variants
  - Focus management
  - ESC key handling
- **Used In**: Confirmations, forms, details
- **Dependencies**: None
- **Design Tokens**: `components.modal.*`

### 3. Form Components
Specialized components for form handling.

#### 3.1 ValidationMessageComponent
- **Purpose**: Display form validation errors
- **Location**: `src/app/shared/components/forms/validation-message/validation-message.component.ts`
- **Features**:
  - Dynamic error display
  - Custom error messages
  - ARIA integration
- **Used In**: All form inputs
- **Dependencies**: None

#### 3.2 StepperComponent
- **Purpose**: Multi-step form navigation
- **Location**: `src/app/shared/components/ui/stepper/stepper.component.ts`
- **Features**:
  - Step progress indication
  - Navigation controls
  - Validation integration
  - Mobile responsive
- **Used In**: Multi-step forms (registration, service creation)
- **Dependencies**: None

#### 3.3 FormSelectComponent
- **Purpose**: Dropdown select with search
- **Location**: `src/app/shared/components/forms/form-select/form-select.component.ts`
- **Features**:
  - Search functionality
  - Multi-select option
  - Custom templates
  - Async data loading
- **Used In**: Category selection, user roles, filtering
- **Dependencies**: None

### 4. Data Display Components
Components for presenting data in various formats.

#### 4.1 TableComponent (AgGridTableComponent)
- **Purpose**: Advanced data table with features
- **Location**: `src/app/shared/components/ui/table/table.component.ts`
- **Features**:
  - Sorting and filtering
  - Pagination
  - Column resizing
  - Row selection
  - Custom cell renderers
- **Used In**: Data lists, management pages
- **Dependencies**: AG-Grid library
- **Design Tokens**: `components.table.*`

#### 4.2 ChartComponent
- **Purpose**: Data visualization wrapper
- **Location**: `src/app/shared/components/ui/chart/chart.component.ts`
- **Features**:
  - Multiple chart types (line, bar, pie)
  - Responsive design
  - Loading states
  - Export options
- **Used In**: Analytics, dashboards
- **Dependencies**: Chart.js or similar library

#### 4.3 PaginationComponent
- **Purpose**: Data pagination controls
- **Location**: `src/app/shared/components/ui/pagination/pagination.component.ts`
- **Features**:
  - Page size selection
  - Navigation controls
  - Info display
- **Used In**: Data tables, lists
- **Dependencies**: None

#### 4.4 KpiCardComponent
- **Purpose**: Key Performance Indicator display
- **Location**: `src/app/shared/components/ui/kpi-card/kpi-card.component.ts`
- **Features**:
  - Value display
  - Trend indicators
  - Icon support
  - Color coding
- **Used In**: Dashboards, analytics
- **Dependencies**: None

### 5. Navigation Components
Components for navigation and wayfinding.

#### 5.1 BreadcrumbComponent
- **Purpose**: Navigation breadcrumb trail
- **Location**: `src/app/shared/components/navigation/breadcrumb/breadcrumb.component.ts`
- **Features**:
  - Dynamic generation
  - Clickable links
  - Icon support
- **Used In**: Page headers
- **Dependencies**: None

#### 5.2 TabComponent
- **Purpose**: Tab navigation interface
- **Location**: `src/app/shared/components/navigation/tab/tab.component.ts`
- **Features**:
  - Multiple tabs
  - Active state
  - Disabled states
- **Used In**: Settings, multi-section forms
- **Dependencies**: None

### 6. Feature-Specific Components
Components for specific business features.

#### 6.1 ServiceCardComponent
- **Purpose**: Service information display card
- **Location**: `src/app/shared/components/feature/service-card/service-card.component.ts`
- **Features**:
  - Service image
  - Price and duration
  - Rating display
  - Action buttons
- **Used In**: Service discovery, listings
- **Dependencies**: ButtonComponent, RatingComponent

#### 6.2 PricingCardComponent
- **Purpose**: Pricing plan display card
- **Location**: `src/app/shared/components/feature/pricing-card/pricing-card.component.ts`
- **Features**:
  - Plan name and price
  - Feature list
  - Call-to-action button
  - Popular/highlight indicators
- **Used In**: Pricing page, subscription management
- **Dependencies**: ButtonComponent, IconComponent

#### 6.3 NotificationComponent
- **Purpose**: User notification display
- **Location**: `src/app/shared/components/feature/notification/notification.component.ts`
- **Features**:
  - Notification types (info, success, warning, error)
  - Dismissible
  - Auto-hide option
  - Action buttons
- **Used In**: Global notifications, form feedback
- **Dependencies**: ButtonComponent

### 7. Admin Components
Components for administrative functions.

#### 7.1 TenantManagement Components
- **TenantListTableComponent**: Tenant data table
- **AddEditTenantModalComponent**: Tenant creation/editing
- **TenantDetailViewComponent**: Tenant information display

#### 7.2 SystemAdmin Components
- **GlobalKpiCardComponent**: System-wide KPI display
- **SystemChartComponent**: System analytics charts
- **SystemAlertsWidgetComponent**: System alerts display
- **RecentGlobalActivityTableComponent**: Global activity log

#### 7.3 ServiceManagement Components
- **ServiceListTableComponent**: Service management table
- **ServiceDetailViewComponent**: Service details modal
- **AddEditServiceModalComponent**: Service creation/editing

## Component Dependencies

### Dependency Graph
```
Layout Components
├── MainLayoutComponent
│   ├── AppHeaderComponent
│   ├── AppSidebarComponent
│   └── AppFooterComponent
└── AuthLayoutComponent

UI Components
├── CardComponent (standalone)
├── ButtonComponent (standalone)
├── InputComponent
│   └── ValidationMessageComponent
├── ModalComponent (standalone)
├── TableComponent (AG-Grid)
├── ChartComponent (Chart library)
└── PaginationComponent (standalone)

Form Components
├── StepperComponent (standalone)
├── FormSelectComponent (standalone)
└── ValidationMessageComponent (standalone)

Navigation Components
├── BreadcrumbComponent (standalone)
└── TabComponent (standalone)

Feature Components
├── ServiceCardComponent
│   ├── ButtonComponent
│   └── RatingComponent
├── PricingCardComponent
│   ├── ButtonComponent
│   └── IconComponent
└── NotificationComponent
    └── ButtonComponent
```

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. **Layout Components** - Essential for any page structure
2. **Basic UI Components** - Required for all interfaces
3. **Form Components** - Needed for data entry

### Phase 2: Data Display (Week 3-4)
4. **Data Display Components** - For showing information
5. **Navigation Components** - For user wayfinding

### Phase 3: Features (Week 5-6)
6. **Feature-Specific Components** - Business logic components
7. **Admin Components** - Management interfaces

### Phase 4: Polish (Week 7-8)
8. **Advanced Components** - Specialized functionality
9. **Optimization** - Performance and accessibility improvements

## Component Specifications

### Naming Conventions
- **Components**: PascalCase (e.g., `ServiceCardComponent`)
- **Files**: kebab-case (e.g., `service-card.component.ts`)
- **Selectors**: kebab-case with app prefix (e.g., `app-service-card`)
- **Directories**: feature-based organization

### File Structure
```
src/app/shared/components/
├── ui/                          # Basic UI components
│   ├── card/
│   ├── button/
│   ├── input/
│   ├── modal/
│   ├── table/
│   ├── chart/
│   └── pagination/
├── forms/                       # Form-related components
│   ├── validation-message/
│   ├── form-select/
│   └── stepper/
├── layout/                      # Layout components
│   ├── app-header/
│   ├── app-sidebar/
│   └── app-footer/
├── navigation/                  # Navigation components
│   ├── breadcrumb/
│   └── tab/
└── feature/                     # Feature-specific components
    ├── service-card/
    ├── pricing-card/
    └── notification/
```

### Component Interface Standards

#### Input Properties
```typescript
export interface ComponentInputs {
  // Required inputs
  data: any;
  config?: ComponentConfig;

  // Optional inputs with defaults
  disabled?: boolean = false;
  loading?: boolean = false;
  size?: 'sm' | 'md' | 'lg' = 'md';
}
```

#### Output Events
```typescript
export interface ComponentOutputs {
  // Action events
  onAction: EventEmitter<ComponentAction>;
  onClose: EventEmitter<void>;

  // Data events
  onDataChange: EventEmitter<any>;
  onSelectionChange: EventEmitter<any[]>;
}
```

## Design System Integration

### Required Specifications
All components must reference:
- `docs/ui-components/auth-components-spec.json` (for form elements)
- `docs/design-system/design-tokens.json` (for styling)
- `docs/layout-patterns/page-layouts.json` (for layouts)

### Validation Requirements
- HTML structure must match specifications exactly
- CSS classes must use only approved design tokens
- Components must pass automated validation
- Accessibility compliance (WCAG 2.1 AA)

## Usage Guidelines

### When to Create New Components
1. **Reusable Logic**: If used in 2+ places
2. **Complex UI**: If component has multiple states/behaviors
3. **Business Logic**: If component encapsulates specific business rules
4. **Consistency**: If needed to maintain design consistency

### When NOT to Create New Components
1. **Single Use**: Simple elements used only once
2. **Static Content**: Purely presentational HTML
3. **Simple Styling**: Basic CSS without behavior

## Development Workflow

### 1. Component Planning
- Identify component requirements from UI flows
- Check if existing component can be extended
- Define component interface (inputs/outputs)
- Plan file structure and dependencies

### 2. Implementation
- Create component files (ts, html, scss, spec)
- Implement TypeScript logic
- Copy HTML structure from specifications
- Add CSS classes from design tokens
- Implement unit tests

### 3. Validation
- Run automated validation script
- Test accessibility compliance
- Verify responsive behavior
- Check browser compatibility

### 4. Documentation
- Update this README with new component
- Add usage examples
- Document dependencies
- Update component interface

## Testing Requirements

### Unit Tests
- Component creation and rendering
- Input/output binding
- State management
- Event emission

### Integration Tests
- Component interaction with services
- Data flow between parent/child components
- Error handling

### E2E Tests
- User interaction scenarios
- Accessibility testing
- Cross-browser compatibility

## Accessibility Standards

All components must meet:
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** requirements
- **Focus management** for complex components

## Performance Considerations

- **Lazy loading** for feature components
- **OnPush change detection** where appropriate
- **TrackBy functions** for *ngFor loops
- **Virtual scrolling** for large lists
- **Component size optimization**

## Future Enhancements

### Planned Components
1. **DatePickerComponent** - Date selection with calendar
2. **FileUploadComponent** - File upload with preview
3. **RatingComponent** - Star rating display/input
4. **SearchComponent** - Advanced search with filters
5. **CalendarComponent** - Full calendar view

### Component Library Expansion
- **Design system** integration
- **Storybook** documentation
- **Theme support** (light/dark mode)
- **Internationalization** support
- **Mobile optimization** improvements

---

*Last Updated: September 2025*
*Version: 1.0.0*
*Maintainer: Frontend Development Team*