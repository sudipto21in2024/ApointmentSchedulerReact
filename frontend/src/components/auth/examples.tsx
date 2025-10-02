/**
 * Authentication Components Usage Examples and Documentation
 *
 * This file contains comprehensive examples demonstrating how to use
 * all the authentication components in various scenarios and use cases.
 */

import React, { useState } from 'react';
import { Login, Register, PasswordReset } from './index';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';

/**
 * Basic Authentication Flow Example
 */
export const BasicAuthFlow: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'reset'>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        {currentView === 'login' && (
          <Login />
        )}

        {currentView === 'register' && (
          <Register />
        )}

        {currentView === 'reset' && (
          <PasswordReset />
        )}

        {/* Navigation between auth views */}
        <div className="mt-4 text-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('login')}
          >
            Login
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('register')}
          >
            Register
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('reset')}
          >
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Styled Authentication Pages
 */
export const CustomAuthPages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-white">
          <div className="mx-auto max-w-md">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to AppointmentPro
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                The complete solution for managing your appointments and growing your business.
              </p>
            </div>

            <div className="mt-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-900">Easy Booking</h3>
                    <p className="text-sm text-blue-700">Simple and intuitive appointment scheduling</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-900">Real-time Updates</h3>
                    <p className="text-sm text-green-700">Instant notifications and live availability</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-purple-900">Secure & Private</h3>
                    <p className="text-sm text-purple-700">Enterprise-grade security for your data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Authentication Forms */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Authentication with Role-Based Registration
 */
export const RoleBasedRegistration: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'service_provider'>('customer');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Choose Your Account Type</CardTitle>
            <CardDescription className="text-center">
              Select the type of account that best fits your needs
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Option */}
              <Card
                variant={selectedRole === 'customer' ? 'elevated' : 'default'}
                interactive
                className="cursor-pointer"
                onClick={() => setSelectedRole('customer')}
              >
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Customer Account</h3>
                  <p className="text-sm text-gray-600">
                    Book appointments with service providers, manage your schedule, and track your appointment history.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Free Account
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Service Provider Option */}
              <Card
                variant={selectedRole === 'service_provider' ? 'elevated' : 'default'}
                interactive
                className="cursor-pointer"
                onClick={() => setSelectedRole('service_provider')}
              >
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Service Provider Account</h3>
                  <p className="text-sm text-gray-600">
                    Manage your business, schedule appointments, track clients, and grow your customer base.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Pro Features
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Form */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Selected Account Type:</strong> {
                  selectedRole === 'customer' ? 'Customer' : 'Service Provider'
                }
              </p>
            </div>
            <Register />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Authentication with Social Login
 */
export const SocialAuthExample: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'social'>('email');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Authentication method toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email & Password
              </button>
              <button
                onClick={() => setAuthMethod('social')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  authMethod === 'social'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Social Login
              </button>
            </div>

            {authMethod === 'email' ? (
              <Login />
            ) : (
              <div className="space-y-4">
                <Button
                  fullWidth
                  variant="ghost"
                  leftIcon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Continue with Google
                </Button>

                <Button
                  fullWidth
                  variant="ghost"
                  leftIcon={
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  }
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Continue with Facebook
                </Button>

                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => setAuthMethod('email')}
                  className="text-gray-600"
                >
                  Use Email & Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Complete Authentication Workflow with Protected Routes
 */
export const AuthWorkflowExample: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);


  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name} ({user.role})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Protected Content</CardTitle>
              <CardDescription>
                This content is only visible to authenticated users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>You have successfully logged in and can access protected resources.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="outlined">
                  <CardContent className="text-center p-4">
                    <h3 className="font-medium">Profile</h3>
                    <p className="text-sm text-gray-600">Manage your account</p>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent className="text-center p-4">
                    <h3 className="font-medium">Appointments</h3>
                    <p className="text-sm text-gray-600">View your bookings</p>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent className="text-center p-4">
                    <h3 className="font-medium">Settings</h3>
                    <p className="text-sm text-gray-600">Configure preferences</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Authentication System Demo
        </h1>
        <p className="mt-2 text-gray-600">
          Experience the complete authentication workflow
        </p>
      </div>

      <BasicAuthFlow />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Features Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Form validation with real-time feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Password strength indicator</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Role-based registration options</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Responsive design for all devices</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Accessibility compliance (WCAG 2.1 AA)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Error Handling Examples
 */
export const AuthErrorHandling: React.FC = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>Error Handling Demo</CardTitle>
            <CardDescription>
              Demonstrating various error states and recovery
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Login />
            </div>

            {/* Error state examples */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-medium">Error State Examples:</h3>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Simulate network error
                    console.log('Network error occurred');
                  }}
                >
                  Trigger Network Error
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Simulate validation error
                    console.log('Validation error occurred');
                  }}
                >
                  Trigger Validation Error
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Mobile-Responsive Authentication
 */
export const MobileAuthExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-center">Sign In</h1>
        </div>
      </div>

      {/* Mobile-friendly form */}
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <Login />

            {/* Mobile-specific features */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                >
                  Use Biometric Login
                </Button>

                <Button
                  fullWidth
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                >
                  Remember this device
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile help section */}
        <Card variant="outlined" className="mt-4 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Mobile Tips:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Use auto-fill for faster login</li>
                <li>• Enable biometric authentication</li>
                <li>• Stay logged in on trusted devices</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Main Authentication Examples Component
 */
export const AuthExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');

  const examples = [
    { id: 'basic', label: 'Basic Flow', component: BasicAuthFlow },
    { id: 'custom', label: 'Custom Styling', component: CustomAuthPages },
    { id: 'role-based', label: 'Role-Based Registration', component: RoleBasedRegistration },
    { id: 'social', label: 'Social Login', component: SocialAuthExample },
    { id: 'workflow', label: 'Complete Workflow', component: AuthWorkflowExample },
    { id: 'error-handling', label: 'Error Handling', component: AuthErrorHandling },
    { id: 'mobile', label: 'Mobile Experience', component: MobileAuthExample },
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || BasicAuthFlow;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {examples.map(example => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeExample === example.id
                    ? 'border-primary-main text-primary-main'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default AuthExamples;