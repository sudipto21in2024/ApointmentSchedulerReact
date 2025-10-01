# Template System Documentation

## Overview

The Template System is a structured approach to creating consistent UI designs using a component-based templating syntax. This system allows designers and developers to create reusable UI patterns that adhere to the design system guidelines while providing flexibility for different use cases.

This document outlines the template syntax, creation process, and usage guidelines for the Multi-Tenant Appointment Booking System.

## Template Syntax

### Basic Structure

Templates follow a hierarchical structure using JSX-like component syntax:

```tsx
<ComponentName property1="value" property2="value">
  <ChildComponent property="value" />
</ComponentName>
```

### Component Declaration

Each component is declared with:
- **Component Name**: Matches the component library names (PascalCase for React)
- **Properties**: Key-value pairs defining component behavior and appearance
- **Children**: Nested components using JSX syntax with opening and closing tags

### Property Types

#### String Properties
```
FormField: text, name="firstName", label="First Name", placeholder="Enter your first name"
```

#### Boolean Properties
```
FormField: checkbox, name="terms", required=true, label="I agree to the terms"
```

#### Number Properties
```
FormRow: columns=2, gap=16
```

#### Array Properties
```
ButtonGroup: buttons=["Save", "Cancel", "Delete"], variant="primary"
```

#### Object Properties
```
Chart: data={labels: ["Jan", "Feb", "Mar"], values: [10, 20, 30]}, type="bar"
```

### Nesting and Hierarchy

Components can be nested to create complex layouts using JSX syntax:

```tsx
<Container maxWidth="1200px">
  <Stack spacing="24px">
    <Heading level={1} text="Dashboard" />
    <Grid columns={3}>
      <Card variant="elevated">
        <StatCard label="Total Bookings" value={124} />
      </Card>
      <Card variant="elevated">
        <StatCard label="Revenue" value="$12,400" />
      </Card>
      <Card variant="elevated">
        <StatCard label="New Users" value={42} />
      </Card>
    </Grid>
  </Stack>
</Container>
```

## Template Creation Process

### 1. Requirements Analysis

Before creating a template, analyze:
- User personas and their needs
- Business requirements from BRD/PRD
- Existing templates for similar use cases
- Design system constraints and guidelines

### 2. Low-Fidelity Design

Start with ASCII-based wireframes to establish structure:

```
// Header Section
[Logo]                    [Navigation]          [User Menu]
------------------------------------------------------------
[Dashboard Title]
[Subtitle/Description]
------------------------------------------------------------
[Stat Card] [Stat Card] [Stat Card]
------------------------------------------------------------
[Filter Controls] [Search Box] [Action Buttons]
------------------------------------------------------------
[Data Table]
[Table Controls]
------------------------------------------------------------
[Footer]
```

### 3. Template Structure Definition

Convert wireframes to structured templates:

```
Container: maxWidth="1200px", padding="24px" > 
  Flex: direction="row", justify="space-between", align="center" > 
    Logo: size="large", variant="full"
    Navbar: items=["Dashboard", "Services", "Bookings", "Analytics"]
    Dropdown: trigger="User Avatar" > Menu: items=["Profile", "Settings", "Logout"]
  >
  Stack: spacing="16px" > 
    Heading: level=1, text="Dashboard"
    Text: variant="subtitle", content="Welcome back! Here's your overview."
    Grid: columns=4, gap="16px" > 
      StatCard: label="Total Bookings", value=124, trend="up"
      StatCard: label="Revenue", value="$12,400", trend="up"
      StatCard: label="New Users", value=42, trend="down"
      StatCard: label="Pending Reviews", value=8, trend="none"
    >
    Flex: direction="row", justify="space-between", align="center" > 
      FilterBar: filters=["Date Range", "Status", "Provider"]
      SearchBox: placeholder="Search bookings..."
      ButtonGroup: buttons=["Export", "Add Booking"], variant="primary"
    >
    Table: columns=["Booking ID", "Customer", "Service", "Date", "Status", "Actions"]
  >
```

### 4. Component Mapping

Map template components to actual component library implementations:

| Template Component | Library Component | Notes |
|--------------------|-------------------|-------|
| Container | Container | Main layout container |
| Flex | Flex | Flexible layout component |
| Heading | Heading | Page title |
| Text | Text | Subtitle/description |
| Grid | Grid | Stat cards layout |
| StatCard | StatCard | Individual stat cards |
| FilterBar | FilterBar | Filtering controls |
| SearchBox | SearchBox | Search functionality |
| ButtonGroup | ButtonGroup | Action buttons |
| Table | Table | Data display |

### 5. Property Definition

Define all component properties with appropriate values:

```
Container: 
  maxWidth="1200px", 
  padding={mobile: "16px", tablet: "24px", desktop: "24px"}, 
  centered=true

Heading: 
  level=1, 
  text="Dashboard", 
  color="colors.neutral.gray900", 
  weight="typography.weights.bold"

StatCard: 
  label="Total Bookings", 
  value=124, 
  trend="up", 
  icon="booking-icon", 
  change="+12%"
```

## Template Categories

### 1. Authentication Templates

#### Login Template
```
Container: maxWidth="480px", centered=true, padding="40px 24px" > 
  Stack: spacing="32px", align="center" > 
    Logo: size="medium", variant="full", link="/"
    Stack: spacing="8px", align="center" > 
      Heading: level=1, text="Welcome Back"
      Text: variant="subtitle", content="Sign in to your account"
    >
    Stack: spacing="16px", width="10%" > 
      Divider: text="Sign in with"
      Stack: spacing="12px" > 
        Button: variant="secondary", block=true, size="large", icon="google", text="Continue with Google"
        Button: variant="secondary", block=true, size="large", icon="github", text="Continue with GitHub"
      >
    >
    Stack: spacing="24px", width="100%" > 
      Divider: text="Or sign in with email"
      FormSection: > 
        FormGroup: > 
          FormField: email, name="email", label="Email Address", placeholder="you@example.com", required=true
        >
        FormGroup: > 
          FormField: password, name="password", label="Password", placeholder="Enter your password", required=true, showToggle=true
        >
        Flex: direction="row", justify="space-between", align="center" > 
          FormField: checkbox, name="remember", label="Remember me"
          Link: href="/forgot-password", text="Forgot password?"
        >
        Button: variant="primary", block=true, size="large", text="Sign In", type="submit"
      >
    >
    Stack: direction="horizontal", justify="center", spacing="4px" > 
      Text: content="Don't have an account?"
      Link: href="/register", text="Sign up"
    >
 >
```

#### Registration Template
```
Container: maxWidth="480px", centered=true, padding="40px 24px" > 
  Stack: spacing="32px", align="center" > 
    Logo: size="medium", variant="full", link="/"
    Stack: spacing="8px", align="center" > 
      Heading: level=1, text="Create Your Account"
      Text: variant="subtitle", content="Join us to get started today"
    >
    Stack: spacing="16px", width="100%" > 
      Divider: text="Sign up with"
      Stack: spacing="12px" > 
        Button: variant="secondary", block=true, size="large", icon="google", text="Continue with Google"
        Button: variant="secondary", block=true, size="large", icon="github", text="Continue with GitHub"
      >
    >
    Stack: spacing="24px", width="100%" > 
      Divider: text="Or register with email"
      FormSection: title="Personal Information" > 
        FormRow: columns=2, gap="16px", responsive=true > 
          FormColumn: span=1 > 
            FormField: text, name="firstName", label="First Name", placeholder="John", required=true
          >
          FormColumn: span=1 > 
            FormField: text, name="lastName", label="Last Name", placeholder="Doe", required=true
          >
        >
        FormField: email, name="email", label="Email Address", placeholder="john.doe@example.com", required=true
        FormGroup: spacing="16px" > 
          FormField: password, name="password", label="Password", placeholder="Create a strong password", required=true, showToggle=true, strength=true
          FormField: password, name="confirmPassword", label="Confirm Password", placeholder="Re-enter your password", required=true, showToggle=true
        >
        Stack: spacing="12px" > 
          FormField: checkbox, name="terms", required=true, label="I agree to the Terms of Service and Privacy Policy"
          FormField: checkbox, name="newsletter", label="Send me updates about new features and promotions"
        >
        Button: variant="primary", block=true, size="large", text="Create Account", type="submit"
      >
    >
    Stack: direction="horizontal", justify="center", spacing="4px" > 
      Text: content="Already have an account?"
      Link: href="/signin", text="Sign in"
    >
  >
```

### 2. Dashboard Templates

#### Provider Dashboard
```
Container: maxWidth="1200px", padding="24px" > 
  Flex: direction="row", justify="space-between", align="center" > 
    Heading: level=1, text="Provider Dashboard"
    Button: variant="primary", text="Add Service"
  >
  Grid: columns={desktop: 4, tablet: 2, mobile: 1}, gap="16px" > 
    StatCard: label="Total Bookings", value=124, trend="up", icon="booking"
    StatCard: label="Revenue", value="$12,400", trend="up", icon="revenue"
    StatCard: label="Upcoming", value=8, trend="none", icon="calendar"
    StatCard: label="Reviews", value=4.8, trend="up", icon="review"
  >
  Flex: direction="row", justify="space-between", align="center" > 
    FilterBar: filters=["This Week", "This Month", "Custom Range"]
    SearchBox: placeholder="Search services..."
  >
  Tabs: items=["All Services", "Active", "Draft"], activeTab="All Services" > 
    Table: 
      columns=["Service", "Duration", "Price", "Bookings", "Status", "Actions"],
      rows=[
        {service: "Haircut", duration: "30 min", price: "$25", bookings: 24, status: "Active"},
        {service: "Beard Trim", duration: "15 min", price: "$15", bookings: 18, status: "Active"},
        {service: "Hair Coloring", duration: "2 hours", price: "$80", bookings: 6, status: "Draft"}
      ]
  >
```

#### Customer Dashboard
```
Container: maxWidth="1200px", padding="24px" > 
  Heading: level=1, text="My Bookings"
  Flex: direction="row", justify="space-between", align="center" > 
    FilterBar: filters=["Upcoming", "Past", "Cancelled"]
    SearchBox: placeholder="Search bookings..."
  >
  List: variant="default" > 
    BookingCard: 
      service="Haircut", 
      provider="John's Barber Shop", 
      date="Tomorrow, 2:00 PM", 
      status="Confirmed",
      actions=["Reschedule", "Cancel"]
    BookingCard: 
      service="Massage", 
      provider="Spa Retreat", 
      date="Sep 15, 3:00 PM", 
      status="Completed",
      actions=["Review", "Book Again"]
  >
```

### 3. Service Management Templates

#### Service Listing
```
Container: maxWidth="1200px", padding="24px" > 
  Flex: direction="row", justify="space-between", align="center" > 
    Heading: level=1, text="My Services"
    Button: variant="primary", text="Add Service"
  >
 Grid: columns={desktop: 3, tablet: 2, mobile: 1}, gap="24px" > 
    ServiceCard: 
      title="Haircut", 
      description="Professional haircut with styling", 
      duration="30 min", 
      price="$25",
      image="/images/haircut.jpg",
      actions=["Edit", "Deactivate"]
    ServiceCard: 
      title="Beard Trim", 
      description="Precision beard trimming and styling", 
      duration="15 min", 
      price="$15",
      image="/images/beard-trim.jpg",
      actions=["Edit", "Deactivate"]
  >
```

#### Service Creation/Editing
```
Container: maxWidth="800px", padding="24px" > 
  Heading: level=1, text="Create Service"
  FormWizard: steps=["Basic Info", "Pricing", "Availability", "Review"], currentStep=1 > 
    FormStep: title="Basic Information" > 
      FormSection: > 
        FormField: text, name="serviceName", label="Service Name", placeholder="e.g., Haircut", required=true
        FormField: textarea, name="description", label="Description", placeholder="Describe your service...", rows=4
        FormField: select, name="category", label="Category", options=["Hair", "Beard", "Spa", "Nails"], placeholder="Select a category"
        FormField: image, name="serviceImage", label="Service Image", accept="image/*"
      >
    >
    FormStep: title="Pricing" > 
      FormSection: > 
        FormField: number, name="duration", label="Duration (minutes)", min=15, step=15, value=30
        FormField: currency, name="price", label="Price", currency="USD", value=25
        FormField: checkbox, name="variablePricing", label="Variable pricing based on client"
      >
    FormStep: title="Availability" > 
      FormSection: > 
        FormField: checkbox, name="availableOnline", label="Available for online booking", checked=true
        FormField: range, name="bookingWindow", label="Booking window", min=0, max=30, value=[0, 7], tooltips=true
        FormField: checkbox, name="simultaneousBooking", label="Can be booked simultaneously with other services"
      >
    >
    FormStep: title="Review" > 
      Stack: spacing="16px" > 
        Heading: level=3, text="Service Preview"
        ServiceCard: 
          title="[Service Name]", 
          description="[Description]", 
          duration="[Duration]", 
          price="[Price]"
        Flex: direction="row", justify="space-between" > 
          Button: variant="secondary", text="Back"
          Button: variant="primary", text="Publish Service"
        >
      >
    >
  >
```

### 4. Booking Templates

#### Booking Creation
```
Container: maxWidth="800px", padding="24px" > 
  Heading: level=1, text="Book Appointment"
 Flex: direction="row", gap="24px" > 
    Flex: direction="column", span=7 > 
      FormSection: title="Select Service and Time" > 
        FormField: select, name="service", label="Service", options=["Haircut - $25 (30 min)", "Beard Trim - $15 (15 min)"], placeholder="Choose a service"
        FormField: date, name="date", label="Date", min="today"
        FormField: time, name="time", label="Time", format="12h", step=900
        FormField: textarea, name="notes", label="Special Requests", placeholder="Any specific requests or notes?"
      >
      FormSection: title="Your Information" > 
        FormRow: columns=2, gap="16px" > 
          FormColumn: span=1 > 
            FormField: text, name="firstName", label="First Name", placeholder="John", required=true
          >
          FormColumn: span=1 > 
            FormField: text, name="lastName", label="Last Name", placeholder="Doe", required=true
          >
        >
        FormField: email, name="email", label="Email", placeholder="you@example.com", required=true
        FormField: tel, name="phone", label="Phone", placeholder="(123) 456-7890", required=true
      >
    >
    Flex: direction="column", span=5 > 
      Card: variant="elevated" > 
        Heading: level=3, text="Booking Summary"
        Divider: 
        Stack: spacing="12px" > 
          Text: content="Haircut"
          Text: content="Sep 12, 2025 at 2:0 PM"
          Text: content="John's Barber Shop"
          Divider: 
          Flex: direction="row", justify="space-between" > 
            Text: content="Service Fee"
            Text: content="$25.00"
          >
          Flex: direction="row", justify="space-between" > 
            Text: content="Booking Fee"
            Text: content="$2.50"
          >
          Divider: 
          Flex: direction="row", justify="space-between" > 
            Text: content="Total"
            Text: content="$27.50"
          >
        >
        Button: variant="primary", block=true, text="Confirm Booking"
      >
    >
  >
```

#### Booking Confirmation
```
Container: maxWidth="600px", centered=true, padding="40px 24px" > 
  Stack: spacing="24px", align="center" > 
    Icon: name="check-circle", size="48px", color="colors.secondary.success"
    Stack: spacing="8px", align="center" > 
      Heading: level=1, text="Booking Confirmed!"
      Text: variant="body", content="Your appointment has been successfully booked."
    >
    Card: variant="outlined" > 
      Stack: spacing="16px" > 
        Heading: level=3, text="Appointment Details"
        Stack: spacing="8px" > 
          Text: content="Service: Haircut"
          Text: content="Date: Sep 12, 2025"
          Text: content="Time: 2:00 PM"
          Text: content="Provider: John's Barber Shop"
          Text: content="Booking ID: #BK-20250912-001"
        >
      >
    >
    Stack: spacing="16px" > 
      Button: variant="primary", block=true, text="Add to Calendar"
      Button: variant="secondary", block=true, text="View All Bookings"
    >
  >
```

## Template Validation

### Syntax Validation
Templates must pass syntax validation to ensure:
- Proper component nesting
- Valid property names and values
- Correct use of operators and delimiters

### Design Token Validation
Templates must use valid design tokens:
- Color tokens from the design system
- Typography tokens for text elements
- Spacing tokens for layout components

### Component Validation
Templates must use valid components:
- Components exist in the component library
- Required properties are provided
- Property values match expected types

## Template Reusability

### Parameterization
Templates can be parameterized for reuse:

```
UserProfileTemplate: userId, editable=false, showActions=true
```

### Composition
Templates can be composed from smaller template fragments:

```
HeaderTemplate + NavigationTemplate + MainContentTemplate + FooterTemplate
```

### Inheritance
Templates can inherit from base templates:

```
BaseFormTemplate: 
  Container: maxWidth="600px" > 
    FormSection: > 
      // Common form elements
    >

ServiceFormTemplate extends BaseFormTemplate:
  // Additional service-specific elements
```

## Template Documentation

### Template Metadata
Each template should include metadata:
- Template name and description
- Author and creation date
- Version and change history
- Usage guidelines and examples

### Template Examples
Provide examples of template usage:
- Different parameter combinations
- Integration with other templates
- Responsive behavior examples

### Template Constraints
Document template constraints:
- Required parent components
- Supported child components
- Design system compliance requirements

## Template Maintenance

### Version Control
Templates should be version controlled:
- Track changes and updates
- Maintain backward compatibility
- Document breaking changes

### Testing
Templates should be tested:
- Syntax validation
- Component integration
- Responsive behavior
- Accessibility compliance

### Updates
Templates should be regularly updated:
- Reflect design system changes
- Incorporate user feedback
- Optimize for performance