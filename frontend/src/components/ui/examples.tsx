/**
 * UI Components Usage Examples and Documentation
 *
 * This file contains comprehensive examples demonstrating how to use
 * all the core UI components in various scenarios and use cases.
 *
 * @example
 * ```tsx
 * // Import components
 * import {
 *   Button,
 *   Input,
 *   Card,
 *   CardHeader,
 *   CardContent,
 *   CardFooter,
 *   Modal,
 *   ModalHeader,
 *   ModalContent,
 *   ModalFooter
 * } from '@/components/ui';
 * ```
 */

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './index';

/**
 * Button Component Examples
 */
export const ButtonExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Button Examples</h2>

      {/* Basic Buttons */}
      <div className="space-x-4">
        <Button>Default Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </div>

      {/* Button Sizes */}
      <div className="space-x-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>

      {/* Button States */}
      <div className="space-x-4">
        <Button variant="danger">Danger Button</Button>
        <Button variant="warning">Warning Button</Button>
        <Button variant="info">Info Button</Button>
        <Button disabled>Disabled Button</Button>
      </div>

      {/* Loading State */}
      <div className="space-x-4">
        <Button loading loadingText="Saving...">
          Save Changes
        </Button>
        <Button
          variant="secondary"
          loading={loading}
          loadingText="Processing..."
          onClick={handleLoadingClick}
        >
          Process
        </Button>
      </div>

      {/* With Icons */}
      <div className="space-x-4">
        <Button
          leftIcon={<PlusIcon />}
          rightIcon={<ArrowRightIcon />}
        >
          Add Item
        </Button>
        <Button
          variant="ghost"
          leftIcon={<MailIcon />}
        >
          Send Email
        </Button>
      </div>

      {/* Full Width */}
      <Button fullWidth>Full Width Button</Button>
    </div>
  );
};

/**
 * Input Component Examples
 */
export const InputExamples = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Input Examples</h2>

      {/* Basic Inputs */}
      <div className="space-y-4 max-w-md">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          leftIcon={<MailIcon />}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          leftIcon={<PhoneIcon />}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          showPasswordToggle
        />
      </div>

      {/* Input States */}
      <div className="space-y-4 max-w-md">
        <Input
          label="Success State"
          variant="success"
          value="Valid input"
          rightIcon={<CheckIcon />}
        />

        <Input
          label="Error State"
          variant="error"
          errorMessage="This field is required"
          value=""
        />

        <Input
          label="Warning State"
          variant="warning"
          value="Warning input"
          helpText="Please review this information"
        />
      </div>

      {/* Input Sizes */}
      <div className="space-y-4 max-w-md">
        <Input
          label="Small Input"
          size="sm"
          placeholder="Small input"
        />

        <Input
          label="Medium Input"
          size="md"
          placeholder="Medium input"
        />

        <Input
          label="Large Input"
          size="lg"
          placeholder="Large input"
        />
      </div>

      {/* Required Fields */}
      <div className="space-y-4 max-w-md">
        <Input
          label="Required Field"
          required
          placeholder="This field is required"
        />

        <Input
          label="Optional Field"
          placeholder="This field is optional"
          helpText="You can leave this empty"
        />
      </div>
    </div>
  );
};

/**
 * Card Component Examples
 */
export const CardExamples = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Card Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>
              A simple card with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>

        {/* Elevated Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>
              Card with shadow and hover effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card has an elevated appearance.</p>
          </CardContent>
        </Card>

        {/* Interactive Card */}
        <Card variant="outlined" interactive>
          <CardContent className="text-center">
            <h3 className="font-semibold">Clickable Card</h3>
            <p className="text-sm text-gray-600 mt-2">
              Click me to perform an action
            </p>
          </CardContent>
        </Card>

        {/* Card with Image */}
        <Card>
          <img
            src="/api/placeholder/300/200"
            alt="Card image"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <CardHeader>
            <CardTitle>Card with Image</CardTitle>
            <CardDescription>
              This card includes an image at the top
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content below the image.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Modal Component Examples
 */
export const ModalExamples = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeOpen, setIsLargeOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Modal Examples</h2>

      <div className="space-x-4">
        <Button onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>
        <Button variant="secondary" onClick={() => setIsLargeOpen(true)}>
          Open Large Modal
        </Button>
      </div>

      {/* Basic Modal */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <ModalTitle>Confirm Action</ModalTitle>
          <ModalDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger">
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Large Modal */}
      <Modal
        open={isLargeOpen}
        onClose={() => setIsLargeOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <ModalTitle>Settings</ModalTitle>
          <ModalDescription>
            Configure your application settings
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Setting 1" placeholder="Value 1" />
              <Input label="Setting 2" placeholder="Value 2" />
              <Input label="Setting 3" placeholder="Value 3" />
              <Input label="Setting 4" placeholder="Value 4" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="option1" />
              <label htmlFor="option1">Enable feature</label>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsLargeOpen(false)}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

/**
 * Complete Form Example
 */
export const CompleteFormExample = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('Form submitted successfully!');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Fill in your information to create a new account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                required
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                errorMessage={errors.firstName}
              />

              <Input
                label="Last Name"
                required
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                errorMessage={errors.lastName}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              leftIcon={<MailIcon />}
              errorMessage={errors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              leftIcon={<PhoneIcon />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange('password')}
              showPasswordToggle
              errorMessage={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              showPasswordToggle
              errorMessage={errors.confirmPassword}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="ghost">
              Back
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

/**
 * Icon Components (placeholders for demo purposes)
 */
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Main Examples Component
 * Combines all examples in a tabbed interface
 */
export const UIExamples = () => {
  const [activeTab, setActiveTab] = useState('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons', component: ButtonExamples },
    { id: 'inputs', label: 'Inputs', component: InputExamples },
    { id: 'cards', label: 'Cards', component: CardExamples },
    { id: 'modals', label: 'Modals', component: ModalExamples },
    { id: 'form', label: 'Complete Form', component: CompleteFormExample },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ButtonExamples;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-main text-primary-main"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default UIExamples;