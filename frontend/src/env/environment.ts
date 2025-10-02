// Development environment configuration
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  appUrl: 'http://localhost:5173',
  enableDevTools: true,
  enableLogging: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  features: {
    enableNotifications: true,
    enableAnalytics: true,
    enableReviews: true,
    enableMultiTenant: true,
  },
  payment: {
    stripePublishableKey: 'pk_test_development_key',
    paypalClientId: 'paypal_development_client_id',
  },
  analytics: {
    googleAnalyticsId: 'GA_DEVELOPMENT_ID',
    mixpanelToken: 'mixpanel_development_token',
  },
  sentry: {
    dsn: 'sentry_development_dsn',
    environment: 'development',
  },
  recaptcha: {
    siteKey: 'recaptcha_development_site_key',
  },
}