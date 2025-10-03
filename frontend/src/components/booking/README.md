# Booking Management Components

## Overview

This directory contains all booking-related UI components for the appointment scheduling system. The components follow the design system specifications and provide a complete booking management solution.

## 📁 Component Structure

```
booking/
├── booking-list.component.tsx      # Main booking listing with filtering & sorting
├── booking-create.component.tsx    # Booking creation form
├── booking-create-new.component.tsx # Alternative booking creation (working version)
├── booking-details.component.tsx   # Booking details view with status tracking
├── slot-selector.component.tsx     # Time slot selection component
└── README.md                       # This documentation file
```

## 🎯 Components Overview

### 1. BookingList Component

**Purpose**: Displays and manages a list of bookings with advanced filtering, sorting, and bulk operations.

**Key Features**:
- Multiple view modes (list, grid, calendar)
- Advanced filtering by status, date range, service, customer
- Sorting by date, price, status, participant count
- Bulk operations (cancel, export)
- Pagination with customizable page sizes
- Real-time search functionality
- Responsive design with mobile support

**Usage**:
```tsx
import { BookingList } from './components/booking/booking-list.component';

<BookingList
  initialBookings={bookings}
  showFilters={true}
  showSearch={true}
  availableActions={['view', 'edit', 'cancel']}
  onBookingSelect={(booking) => navigateToDetails(booking.id)}
/>
```

### 2. BookingCreate Component

**Purpose**: Provides a comprehensive booking creation form with service selection and slot booking.

**Key Features**:
- Service selection with visual cards
- Date and time slot selection
- Participant count management
- Special requests and notes
- Form validation with error handling
- Integration with booking API
- Responsive form design

**Usage**:
```tsx
import { BookingCreate } from './components/booking/booking-create.component';

<BookingCreate
  services={availableServices}
  onSubmit={handleBookingSubmit}
  onCancel={() => setShowCreateForm(false)}
  onSuccess={(booking) => navigateToDetails(booking.id)}
/>
```

### 3. BookingDetails Component

**Purpose**: Displays comprehensive booking information with status tracking and management actions.

**Key Features**:
- Complete booking information display
- Real-time status tracking with visual indicators
- Customer and provider information
- Booking timeline and history
- Payment information and status
- Action buttons for booking management
- Cancellation and modification tracking

**Usage**:
```tsx
import { BookingDetails } from './components/booking/booking-details.component';

<BookingDetails
  booking={selectedBooking}
  showActions={true}
  availableActions={['edit', 'cancel', 'reschedule']}
  onBookingUpdate={handleBookingUpdate}
  onEdit={handleEditBooking}
/>
```

### 4. SlotSelector Component

**Purpose**: Advanced time slot selection with calendar integration and availability checking.

**Key Features**:
- Interactive calendar for date selection
- Time slot grid with availability indicators
- Real-time availability checking
- Business hours configuration
- Conflict detection and resolution
- Mobile-responsive design

**Usage**:
```tsx
import { SlotSelector } from './components/booking/slot-selector.component';

<SlotSelector
  serviceId={selectedServiceId}
  duration={serviceDuration}
  onSlotSelect={(date, slot) => handleSlotSelection(date, slot)}
  businessHours={{
    start: '09:00',
    end: '18:00',
    workingDays: [1, 2, 3, 4, 5, 6]
  }}
/>
```

## 🔧 Design System Compliance

### Layout Specifications

The components follow the specified layout patterns:

#### Layout 2: Main Application (Logged In)
- **Header**: Logo, company name, user profile, notifications drawer, breadcrumb
- **Sidebar**: Hierarchical menu groups, collapsible to icons, mobile hamburger menu
- **Main Content**: Dashboards, data grids, master-details forms

#### Layout 3: Static Content (Logged In)
- **Header**: Same as Layout 2
- **Sidebar**: Same as Layout 2
- **Content Card Area**: Static content pages like FAQs, contact info

### Form Architecture Rules

#### Multi-Step Form Implementation
- **Entity Grouping**: Separate cards with section headers for different entities
- **Step Organization**: Each step groups different entities
- **Column Layout**: Maximum two-column design with merged columns for larger fields

#### Master-Details Form Options
1. **Simple Navigation**: Navigate to add/edit form, return to grid on completion
2. **Popup Pattern**: Open popup for add/edit, reload grid on success/cancellation
3. **Slider Pattern**: Open configurable slider form from right side

### Component Design Guidelines

#### Entity Grouping Rules
- Group related fields into separate cards with section headers
- Use maximum two-column layout
- Merge columns for larger text fields (descriptions, notes)

#### Validation Message Placement
- Display validation text directly under field elements
- Highlight controls with CSS error state
- Show error icon with tooltip on hover

## 🛠️ Technical Implementation

### Architecture Patterns

#### Component Composition
```typescript
// Base component props (all components extend this)
interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Specific component props
interface BookingListProps extends BaseComponentProps {
  initialBookings?: Booking[];
  showFilters?: boolean;
  availableActions?: Array<'view' | 'edit' | 'cancel' | 'delete'>;
  onBookingSelect?: (booking: Booking) => void;
}
```

#### State Management
```typescript
// Centralized state interface
interface BookingListState {
  bookings: Booking[];
  loading: boolean;
  error: Error | null;
  filters: BookingFilters;
  selectedBookings: Set<string>;
  currentPage: number;
  viewMode: 'list' | 'grid' | 'calendar';
}
```

### API Integration

#### Service Layer Pattern
```typescript
// API service class
export class BookingApiService {
  async getUserBookings(userId: string, filters?: BookingFilters): Promise<BookingListResponse> {
    return this.client.get<BookingListResponse>(`/users/${userId}/bookings`, filters);
  }

  async createBooking(bookingData: BookingCreateData): Promise<Booking> {
    return this.client.post<Booking>('/bookings', bookingData);
  }

  async getAvailableSlots(serviceId: string, date: string): Promise<TimeSlot[]> {
    return this.client.get(`/services/${serviceId}/slots`, { date });
  }
}
```

### Error Handling Strategy

#### Component-Level Error Boundaries
```typescript
interface ErrorState {
  error: Error | null;
  loading: boolean;
  retry: () => void;
}

const renderErrorState = () => (
  <Card className="text-center py-12 border-red-200 bg-red-50">
    <CardContent>
      <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-red-900 mb-2">Error loading data</h3>
      <p className="text-red-700 mb-4">{error?.message}</p>
      <Button variant="primary" onClick={retry}>
        Try again
      </Button>
    </CardContent>
  </Card>
);
```

## 🧪 Testing Strategy

### Unit Tests Structure
```typescript
// Component unit tests
describe('BookingList', () => {
  it('should render bookings correctly', () => {
    render(<BookingList bookings={mockBookings} />);
    expect(screen.getByTestId('booking-list')).toBeInTheDocument();
  });

  it('should handle booking selection', () => {
    const onSelect = jest.fn();
    render(<BookingList onBookingSelect={onSelect} />);
    // Test selection logic
  });
});
```

### Integration Tests
```typescript
// API integration tests
describe('Booking API Integration', () => {
  it('should fetch bookings from API', async () => {
    const bookings = await bookingApi.getUserBookings('user-id');
    expect(bookings).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// Complete workflow tests
describe('Booking Workflow E2E', () => {
  it('should complete full booking process', () => {
    // Navigate to booking page
    // Select service
    // Choose time slot
    // Fill details
    // Confirm booking
    // Verify booking appears in list
  });
});
```

## 🔒 Security Considerations

### Authorization Checks
```typescript
// Permission-based action visibility
const canEditBooking = (booking: Booking, user: User) => {
  return booking.customerId === user.id || user.role === 'admin';
};

const availableActions = canEditBooking(booking, currentUser)
  ? ['view', 'edit', 'cancel']
  : ['view'];
```

### Input Validation
```typescript
// Client-side validation
const validateBookingData = (data: BookingCreateData) => {
  const errors: FormErrors = {};

  if (!data.serviceId) errors.serviceId = 'Service selection required';
  if (!data.scheduledAt) errors.scheduledAt = 'Date and time required';
  if (data.participantCount < 1) errors.participantCount = 'At least 1 participant required';

  return errors;
};
```

### Sensitive Data Protection
```typescript
// Mask sensitive information
const maskBookingId = (id: string) => `${id.slice(0, 4)}****${id.slice(-4)}`;
const maskCustomerInfo = (info: CustomerInfo) => ({
  ...info,
  phone: `****${info.phone.slice(-4)}`,
  email: `${info.email.slice(0, 2)}****${info.email.split('@')[1]}`
});
```

## 🌍 Internationalization Support

### i18n Implementation
```typescript
// Translation keys
const bookingTranslations = {
  en: {
    'booking.title': 'Create Booking',
    'booking.selectService': 'Select Service',
    'booking.chooseDate': 'Choose Date',
    'booking.participants': 'Participants',
    'booking.specialRequests': 'Special Requests'
  },
  es: {
    'booking.title': 'Crear Reservación',
    'booking.selectService': 'Seleccionar Servicio',
    'booking.chooseDate': 'Elegir Fecha',
    'booking.participants': 'Participantes',
    'booking.specialRequests': 'Solicitudes Especiales'
  }
};
```

### Date/Number Formatting
```typescript
// Locale-aware formatting
const formatDate = (date: string, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};
```

## 📱 Responsive Design

### Breakpoint Strategy
```typescript
// Mobile-first responsive classes
const responsiveClasses = {
  container: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  card: 'p-4 sm:p-6',
  button: 'w-full sm:w-auto',
  text: 'text-sm sm:text-base'
};
```

### Touch-Friendly Interface
```typescript
// Touch target sizes
const touchTargets = {
  button: 'min-h-[44px] px-4 py-2', // Minimum 44px touch target
  input: 'min-h-[44px] px-3 py-2',
  checkbox: 'w-6 h-6', // Larger checkboxes for mobile
};
```

## 🚀 Performance Optimizations

### Code Splitting
```typescript
// Dynamic imports for route-based splitting
const BookingDetails = lazy(() => import('./booking-details.component'));
const SlotSelector = lazy(() => import('./slot-selector.component'));
```

### Virtualization for Large Lists
```typescript
// Virtual scrolling for booking lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedBookingList = ({ bookings, height = 400 }) => (
  <List
    height={height}
    itemCount={bookings.length}
    itemSize={80}
    itemData={bookings}
  >
    {({ index, data }) => <BookingItem booking={data[index]} />}
  </List>
);
```

## 🔄 State Management

### Local State Pattern
```typescript
// useReducer for complex state
const bookingReducer = (state: BookingState, action: BookingAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};
```

### API State Management
```typescript
// React Query for server state
const useBookings = (filters: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingApi.getUserBookings(currentUser.id, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## 📋 Usage Examples

### Basic Booking List
```tsx
import { BookingList } from '@/components/booking/booking-list.component';

function BookingPage() {
  const { data: bookings, isLoading, error } = useBookings();

  return (
    <div className="container mx-auto p-6">
      <BookingList
        initialBookings={bookings}
        loading={isLoading}
        error={error}
        showFilters={true}
        showSearch={true}
        availableActions={['view', 'edit', 'cancel']}
        onBookingSelect={(booking) => navigateTo(`/bookings/${booking.id}`)}
      />
    </div>
  );
}
```

### Booking Creation with Modal
```tsx
import { BookingCreate } from '@/components/booking/booking-create.component';

function ServiceBooking({ service }: { service: Service }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowCreateModal(true)}>
        Book Service
      </Button>

      {showCreateModal && (
        <BookingCreate
          modal={true}
          modalTitle={`Book ${service.name}`}
          initialValues={{ serviceId: service.id }}
          onSubmit={handleBookingSubmit}
          onCancel={() => setShowCreateModal(false)}
          onSuccess={(booking) => {
            setShowCreateModal(false);
            navigateTo(`/bookings/${booking.id}`);
          }}
        />
      )}
    </>
  );
}
```

### Advanced Slot Selection
```tsx
import { SlotSelector } from '@/components/booking/slot-selector.component';

function BookingForm() {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  return (
    <form>
      <SlotSelector
        serviceId={formData.serviceId}
        duration={60}
        businessHours={{
          start: '09:00',
          end: '18:00',
          workingDays: [1, 2, 3, 4, 5, 6] // Mon-Sat
        }}
        onSlotSelect={(date, slot) => {
          setSelectedSlot(slot);
          setFormData(prev => ({
            ...prev,
            scheduledAt: slot.startTime
          }));
        }}
      />
    </form>
  );
}
```

## 🔧 Development Guidelines

### Adding New Components
1. Follow the existing file structure and naming conventions
2. Include comprehensive TypeScript interfaces
3. Add JSDoc documentation with usage examples
4. Implement proper error handling and loading states
5. Add accessibility features (ARIA labels, keyboard navigation)
6. Include responsive design considerations

### Code Style Guidelines
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow existing naming conventions
- Include error boundaries for component isolation
- Use the existing design system components

### Performance Considerations
- Implement proper memoization for expensive operations
- Use React.lazy for code splitting
- Optimize re-renders with useMemo and useCallback
- Implement virtualization for large lists

## 📚 Related Documentation

- [Design System Guide](../../docs/UI/Requirements.mmd)
- [API Documentation](../../docs/API/OpenAPI/appointment-openapi.yaml)
- [Component Testing Guide](../../../tests/README.md)
- [Security Guidelines](../../../docs/security.md)

## 🤝 Contributing

When contributing to booking components:

1. **Follow Existing Patterns**: Use the established component structure and naming conventions
2. **Add Tests**: Include unit tests for new functionality
3. **Update Documentation**: Keep this README updated with new components and features
4. **Consider Accessibility**: Ensure all components are accessible to users with disabilities
5. **Performance**: Optimize for performance, especially for list and grid components

## 📞 Support

For questions or issues with booking components:
- Check existing tests for usage examples
- Review the design system documentation
- Consult the API documentation for integration details
- Create an issue with detailed information about the problem