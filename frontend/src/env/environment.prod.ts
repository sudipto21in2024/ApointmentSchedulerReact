// Production environment configuration
export const environment = {
  production: true,
  apiUrl: 'https://api.appointmentbookingsystem.com',
  appUrl: 'https://appointmentbookingsystem.com',
  enableDevTools: false,
  enableLogging: false,
  maxFileSize: 5 * 1024 * 1024, // 5MB for production
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  sessionTimeout: 60 * 60 * 1000, // 1 hour for production
  features: {
    enableNotifications: true,
    enableAnalytics: true,
    enableReviews: true,
    enableMultiTenant: true,
  },
  payment: {
    stripePublishableKey: 'pk_live_production_stripe_key',
    paypalClientId: 'paypal_production_client_id',
  },
  analytics: {
    googleAnalyticsId: 'GA_PRODUCTION_ID',
    mixpanelToken: 'mixpanel_production_token',
  },
  sentry: {
    dsn: 'sentry_production_dsn',
    environment: 'production',
  },
  recaptcha: {
    siteKey: 'recaptcha_production_site_key',
  },
}