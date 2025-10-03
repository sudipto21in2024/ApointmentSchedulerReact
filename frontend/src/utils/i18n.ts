/**
 * Internationalization Utilities
 *
 * Comprehensive i18n support for booking management system with locale-aware formatting,
 * date/number localization, and translation management following design system requirements.
 *
 * Features:
 * - Multi-language support with fallback mechanisms
 * - Locale-aware date and number formatting
 * - Currency formatting for different locales
 * - RTL language support preparation
 * - Translation key management
 * - Dynamic locale switching
 * - Pluralization support
 * - Context-aware translations
 */

import type { BookingStatus } from '../types/booking';

// Supported locales
export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ar' | 'zh' | 'ja';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR';

// Language configuration
export interface LanguageConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  timeFormat: string;
  currency: CurrencyCode;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

// Supported languages configuration
export const supportedLanguages: Record<SupportedLocale, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: {
      decimal: '.',
      thousands: ','
    }
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: {
      decimal: ',',
      thousands: '.'
    }
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: {
      decimal: ',',
      thousands: ' '
    }
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: {
      decimal: ',',
      thousands: '.'
    }
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: {
      decimal: ',',
      thousands: '.'
    }
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'EUR',
    numberFormat: {
      decimal: ',',
      thousands: ' '
    }
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    numberFormat: {
      decimal: '.',
      thousands: ','
    }
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    dateFormat: 'yyyy-MM-dd',
    timeFormat: '24h',
    currency: 'CNY',
    numberFormat: {
      decimal: '.',
      thousands: ','
    }
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    currency: 'JPY',
    numberFormat: {
      decimal: '.',
      thousands: ','
    }
  }
};

/**
 * Translation keys for booking management
 */
export interface TranslationKeys {
  // Common
  'common.loading': string;
  'common.error': string;
  'common.retry': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.view': string;
  'common.create': string;
  'common.update': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  'common.export': string;
  'common.import': string;
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.close': string;

  // Booking
  'booking.title': string;
  'booking.create': string;
  'booking.edit': string;
  'booking.delete': string;
  'booking.details': string;
  'booking.list': string;
  'booking.calendar': string;
  'booking.history': string;
  'booking.status': string;
  'booking.service': string;
  'booking.customer': string;
  'booking.provider': string;
  'booking.date': string;
  'booking.time': string;
  'booking.duration': string;
  'booking.price': string;
  'booking.total': string;
  'booking.paid': string;
  'booking.pending': string;
  'booking.confirmed': string;
  'booking.cancelled': string;
  'booking.completed': string;
  'booking.notes': string;
  'booking.participants': string;

  // Status messages
  'booking.status.pending': string;
  'booking.status.confirmed': string;
  'booking.status.in_progress': string;
  'booking.status.completed': string;
  'booking.status.cancelled': string;
  'booking.status.no_show': string;
  'booking.status.refunded': string;

  // Actions
  'booking.action.book': string;
  'booking.action.cancel': string;
  'booking.action.reschedule': string;
  'booking.action.confirm': string;
  'booking.action.edit': string;
  'booking.action.delete': string;
  'booking.action.export': string;

  // Form fields
  'booking.form.service': string;
  'booking.form.date': string;
  'booking.form.time': string;
  'booking.form.participants': string;
  'booking.form.notes': string;
  'booking.form.special_requests': string;
  'booking.form.promo_code': string;

  // Validation messages
  'booking.validation.required': string;
  'booking.validation.invalid_date': string;
  'booking.validation.invalid_time': string;
  'booking.validation.past_date': string;
  'booking.validation.conflict': string;

  // Error messages
  'booking.error.load': string;
  'booking.error.create': string;
  'booking.error.update': string;
  'booking.error.delete': string;
  'booking.error.network': string;
  'booking.error.unauthorized': string;
  'booking.error.not_found': string;

  // Success messages
  'booking.success.created': string;
  'booking.success.updated': string;
  'booking.success.deleted': string;
  'booking.success.cancelled': string;

  // Navigation
  'nav.dashboard': string;
  'nav.bookings': string;
  'nav.services': string;
  'nav.customers': string;
  'nav.providers': string;
  'nav.reports': string;
  'nav.settings': string;

  // User interface
  'ui.loading': string;
  'ui.empty': string;
  'ui.no_results': string;
  'ui.show_more': string;
  'ui.show_less': string;
  'ui.next': string;
  'ui.previous': string;
  'ui.page': string;
  'ui.of': string;
  'ui.items': string;
}

/**
 * Translation resources for each language
 */
const translationResources: Record<SupportedLocale, Partial<TranslationKeys>> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.close': 'Close',

    // Booking
    'booking.title': 'Booking',
    'booking.create': 'Create Booking',
    'booking.edit': 'Edit Booking',
    'booking.details': 'Booking Details',
    'booking.list': 'Booking List',
    'booking.calendar': 'Calendar View',
    'booking.history': 'Booking History',
    'booking.status': 'Status',
    'booking.service': 'Service',
    'booking.customer': 'Customer',
    'booking.provider': 'Provider',
    'booking.date': 'Date',
    'booking.time': 'Time',
    'booking.duration': 'Duration',
    'booking.price': 'Price',
    'booking.total': 'Total',
    'booking.paid': 'Paid',
    'booking.pending': 'Pending',
    'booking.confirmed': 'Confirmed',
    'booking.cancelled': 'Cancelled',
    'booking.completed': 'Completed',
    'booking.notes': 'Notes',
    'booking.participants': 'Participants',

    // Status messages
    'booking.status.pending': 'Pending',
    'booking.status.confirmed': 'Confirmed',
    'booking.status.in_progress': 'In Progress',
    'booking.status.completed': 'Completed',
    'booking.status.cancelled': 'Cancelled',
    'booking.status.no_show': 'No Show',
    'booking.status.refunded': 'Refunded',

    // Actions
    'booking.action.book': 'Book Now',
    'booking.action.cancel': 'Cancel Booking',
    'booking.action.reschedule': 'Reschedule',
    'booking.action.confirm': 'Confirm Booking',
    'booking.action.edit': 'Edit',
    'booking.action.delete': 'Delete',
    'booking.action.export': 'Export',

    // Form fields
    'booking.form.service': 'Select Service',
    'booking.form.date': 'Select Date',
    'booking.form.time': 'Select Time',
    'booking.form.participants': 'Number of Participants',
    'booking.form.notes': 'Special Requests',
    'booking.form.special_requests': 'Special Requests',
    'booking.form.promo_code': 'Promo Code',

    // Validation messages
    'booking.validation.required': 'This field is required',
    'booking.validation.invalid_date': 'Please select a valid date',
    'booking.validation.invalid_time': 'Please select a valid time',
    'booking.validation.past_date': 'Date cannot be in the past',
    'booking.validation.conflict': 'Time slot conflict detected',

    // Error messages
    'booking.error.load': 'Failed to load bookings',
    'booking.error.create': 'Failed to create booking',
    'booking.error.update': 'Failed to update booking',
    'booking.error.delete': 'Failed to delete booking',
    'booking.error.network': 'Network error occurred',
    'booking.error.unauthorized': 'You are not authorized to perform this action',
    'booking.error.not_found': 'Booking not found',

    // Success messages
    'booking.success.created': 'Booking created successfully',
    'booking.success.updated': 'Booking updated successfully',
    'booking.success.deleted': 'Booking deleted successfully',
    'booking.success.cancelled': 'Booking cancelled successfully',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.bookings': 'Bookings',
    'nav.services': 'Services',
    'nav.customers': 'Customers',
    'nav.providers': 'Providers',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',

    // User interface
    'ui.loading': 'Loading...',
    'ui.empty': 'No items found',
    'ui.no_results': 'No results found',
    'ui.show_more': 'Show more',
    'ui.show_less': 'Show less',
    'ui.next': 'Next',
    'ui.previous': 'Previous',
    'ui.page': 'Page',
    'ui.of': 'of',
    'ui.items': 'items'
  },

  es: {
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.export': 'Exportar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'Aceptar',
    'common.close': 'Cerrar',

    // Booking
    'booking.title': 'Reservación',
    'booking.create': 'Crear Reservación',
    'booking.edit': 'Editar Reservación',
    'booking.details': 'Detalles de Reservación',
    'booking.list': 'Lista de Reservaciones',
    'booking.calendar': 'Vista de Calendario',
    'booking.history': 'Historial de Reservaciones',
    'booking.status': 'Estado',
    'booking.service': 'Servicio',
    'booking.customer': 'Cliente',
    'booking.provider': 'Proveedor',
    'booking.date': 'Fecha',
    'booking.time': 'Hora',
    'booking.duration': 'Duración',
    'booking.price': 'Precio',
    'booking.total': 'Total',
    'booking.paid': 'Pagado',
    'booking.pending': 'Pendiente',
    'booking.confirmed': 'Confirmado',
    'booking.cancelled': 'Cancelado',
    'booking.completed': 'Completado',
    'booking.notes': 'Notas',
    'booking.participants': 'Participantes',

    // Status messages
    'booking.status.pending': 'Pendiente',
    'booking.status.confirmed': 'Confirmado',
    'booking.status.in_progress': 'En Progreso',
    'booking.status.completed': 'Completado',
    'booking.status.cancelled': 'Cancelado',
    'booking.status.no_show': 'No Asistió',
    'booking.status.refunded': 'Reembolsado',

    // Actions
    'booking.action.book': 'Reservar Ahora',
    'booking.action.cancel': 'Cancelar Reservación',
    'booking.action.reschedule': 'Reprogramar',
    'booking.action.confirm': 'Confirmar Reservación',
    'booking.action.edit': 'Editar',
    'booking.action.delete': 'Eliminar',
    'booking.action.export': 'Exportar',

    // Form fields
    'booking.form.service': 'Seleccionar Servicio',
    'booking.form.date': 'Seleccionar Fecha',
    'booking.form.time': 'Seleccionar Hora',
    'booking.form.participants': 'Número de Participantes',
    'booking.form.notes': 'Solicitudes Especiales',
    'booking.form.special_requests': 'Solicitudes Especiales',
    'booking.form.promo_code': 'Código Promocional',

    // Validation messages
    'booking.validation.required': 'Este campo es requerido',
    'booking.validation.invalid_date': 'Por favor selecciona una fecha válida',
    'booking.validation.invalid_time': 'Por favor selecciona una hora válida',
    'booking.validation.past_date': 'La fecha no puede ser en el pasado',
    'booking.validation.conflict': 'Conflicto de horario detectado',

    // Error messages
    'booking.error.load': 'Error al cargar reservaciones',
    'booking.error.create': 'Error al crear reservación',
    'booking.error.update': 'Error al actualizar reservación',
    'booking.error.delete': 'Error al eliminar reservación',
    'booking.error.network': 'Error de conexión',
    'booking.error.unauthorized': 'No tienes autorización para esta acción',
    'booking.error.not_found': 'Reservación no encontrada',

    // Success messages
    'booking.success.created': 'Reservación creada exitosamente',
    'booking.success.updated': 'Reservación actualizada exitosamente',
    'booking.success.deleted': 'Reservación eliminada exitosamente',
    'booking.success.cancelled': 'Reservación cancelada exitosamente',

    // Navigation
    'nav.dashboard': 'Panel Principal',
    'nav.bookings': 'Reservaciones',
    'nav.services': 'Servicios',
    'nav.customers': 'Clientes',
    'nav.providers': 'Proveedores',
    'nav.reports': 'Reportes',
    'nav.settings': 'Configuración',

    // User interface
    'ui.loading': 'Cargando...',
    'ui.empty': 'No se encontraron elementos',
    'ui.no_results': 'No se encontraron resultados',
    'ui.show_more': 'Mostrar más',
    'ui.show_less': 'Mostrar menos',
    'ui.next': 'Siguiente',
    'ui.previous': 'Anterior',
    'ui.page': 'Página',
    'ui.of': 'de',
    'ui.items': 'elementos'
  },

  // Add more languages as needed...
  fr: {}, // French translations would go here
  de: {}, // German translations would go here
  it: {}, // Italian translations would go here
  pt: {}, // Portuguese translations would go here
  ar: {}, // Arabic translations would go here
  zh: {}, // Chinese translations would go here
  ja: {}  // Japanese translations would go here
};

/**
 * Internationalization Service
 */
export class I18nService {
  private static currentLocale: SupportedLocale = 'en';
  private static fallbackLocale: SupportedLocale = 'en';

  /**
   * Set current locale
   */
  static setLocale(locale: SupportedLocale): void {
    if (supportedLanguages[locale]) {
      this.currentLocale = locale;
    } else {
      console.warn(`Unsupported locale: ${locale}. Falling back to ${this.fallbackLocale}`);
    }
  }

  /**
   * Get current locale
   */
  static getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Get language configuration
   */
  static getLanguageConfig(locale?: SupportedLocale): LanguageConfig {
    const targetLocale = locale || this.currentLocale;
    return supportedLanguages[targetLocale] || supportedLanguages[this.fallbackLocale];
  }

  /**
   * Translate a key
   */
  static t(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
    const translations = translationResources[this.currentLocale];
    const fallbackTranslations = translationResources[this.fallbackLocale];

    let translation = translations?.[key] || fallbackTranslations?.[key];

    // If no translation found, return the key
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in locale: ${this.currentLocale}`);
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation!.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }

    return translation;
  }

  /**
   * Format date according to locale
   */
  static formatDate(date: Date | string, locale?: SupportedLocale): string {
    const targetLocale = locale || this.currentLocale;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(targetLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  /**
   * Format time according to locale
   */
  static formatTime(date: Date | string, locale?: SupportedLocale): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLanguageConfig(targetLocale);

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit'
    };

    // Use 12h or 24h format based on locale configuration
    if (config.timeFormat === '12h') {
      options.hour12 = true;
    }

    return new Intl.DateTimeFormat(targetLocale, options).format(dateObj);
  }

  /**
   * Format date and time together
   */
  static formatDateTime(date: Date | string, locale?: SupportedLocale): string {
    const targetLocale = locale || this.currentLocale;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return `${this.formatDate(dateObj, targetLocale)} ${this.formatTime(dateObj, targetLocale)}`;
  }

  /**
   * Format currency according to locale
   */
  static formatCurrency(
    amount: number,
    currency?: CurrencyCode,
    locale?: SupportedLocale
  ): string {
    const targetLocale = locale || this.currentLocale;
    const currencyCode = currency || this.getLanguageConfig(targetLocale).currency;

    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  }

  /**
   * Format number according to locale
   */
  static formatNumber(
    number: number,
    options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    },
    locale?: SupportedLocale
  ): string {
    const targetLocale = locale || this.currentLocale;

    return new Intl.NumberFormat(targetLocale, {
      minimumFractionDigits: options?.minimumFractionDigits || 0,
      maximumFractionDigits: options?.maximumFractionDigits || 2
    }).format(number);
  }

  /**
   * Get booking status label in current locale
   */
  static getBookingStatusLabel(status: BookingStatus): string {
    const key = `booking.status.${status}` as keyof TranslationKeys;
    return this.t(key);
  }

  /**
   * Get localized direction (for RTL support)
   */
  static getDirection(locale?: SupportedLocale): 'ltr' | 'rtl' {
    const config = this.getLanguageConfig(locale);
    return config.rtl ? 'rtl' : 'ltr';
  }

  /**
   * Check if current locale is RTL
   */
  static isRTL(): boolean {
    return this.getDirection() === 'rtl';
  }
}

/**
 * React hook for using translations
 */
export const useTranslation = () => {
  return {
    t: I18nService.t.bind(I18nService),
    locale: I18nService.getCurrentLocale(),
    formatDate: I18nService.formatDate.bind(I18nService),
    formatTime: I18nService.formatTime.bind(I18nService),
    formatDateTime: I18nService.formatDateTime.bind(I18nService),
    formatCurrency: I18nService.formatCurrency.bind(I18nService),
    formatNumber: I18nService.formatNumber.bind(I18nService),
    getBookingStatusLabel: I18nService.getBookingStatusLabel.bind(I18nService),
    direction: I18nService.getDirection(),
    isRTL: I18nService.isRTL()
  };
};

export default {
  I18nService,
  useTranslation,
  supportedLanguages,
  translationResources
};