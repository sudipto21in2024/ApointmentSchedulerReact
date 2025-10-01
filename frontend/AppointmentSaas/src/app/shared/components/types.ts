// Shared Component Types and Interfaces

// Base component configuration
export interface ComponentConfig {
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
}

// Layout Types
export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

// Form Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormFieldConfig {
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: string[];
}

// Data Display Types
export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'action';
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  template?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
}

// Feature Component Types
export interface ServiceCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  category: string;
  providerName: string;
}

export interface PricingPlanData {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annually';
  features: string[];
  popular?: boolean;
  maxServices?: number;
  maxSlots?: number;
  maxUsers?: number;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

// Event Types
export interface ComponentAction {
  type: string;
  payload?: any;
}

export interface SelectionChange {
  selected: any[];
  unselected?: any[];
}

// State Types
export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface DataState<T> {
  data: T;
  loading: boolean;
  error?: string;
}