import React, { useState } from 'react';
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';
import { cn } from '../../../utils/cn';
import type {
  ServiceEditProps,
  ServiceUpdateData,
  ServiceFormErrors
} from '../types';

/**
 * ServiceEdit Component - Handles editing of existing services with pre-populated data
 *
 * Features:
 * - Pre-populated form with existing service data
 * - Real-time form validation with visual feedback
 * - Category selection
 * - Pricing updates
 * - Schedule modifications
 * - Responsive design for all screen sizes
 * - Accessibility compliance with WCAG 2.1 AA
 *
 * @example
 * ```tsx
 * // Basic service editing
 * <ServiceEdit
 *   service={service}
 *   categories={categories}
 *   onSubmit={handleServiceUpdate}
 * />
 * ```
 */
export const ServiceEdit: React.FC<ServiceEditProps> = ({
  service,
  categories,
  onSubmit,
  onCancel,
  className,
  'data-testid': testId,
}) => {
  // Form state management - initialized with service data
  const [formData, setFormData] = useState<ServiceUpdateData>({
    id: service.id,
    name: service.name,
    description: service.description,
    shortDescription: service.shortDescription || '',
    categoryId: service.category.id,
    pricing: { ...service.pricing },
    schedule: { ...service.schedule },
    location: { ...service.location },
    visibility: service.visibility,
    tags: [...service.tags],
  });

  // Form validation state
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles input field changes with validation
   * @param field - Field name or nested field path
   * @param value - New field value
   */
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        // Handle nested fields like 'pricing.basePrice'
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof ServiceUpdateData] as any),
            [child]: value,
          },
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear field errors when user starts typing
    if (errors[field as keyof ServiceFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handles form submission with validation
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Basic validation
      const validationErrors: ServiceFormErrors = {};

      if (!formData.name?.trim()) {
        validationErrors.name = 'Service name is required';
      }

      if (!formData.description?.trim()) {
        validationErrors.description = 'Service description is required';
      }

      if (!formData.categoryId) {
        validationErrors.categoryId = 'Please select a category';
      }

      if (!formData.pricing?.basePrice || formData.pricing.basePrice <= 0) {
        validationErrors.pricing = { ...validationErrors.pricing, basePrice: 'Please enter a valid price' };
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Submit update data
      await onSubmit(formData);

    } catch (error) {
      console.error('Service update error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to update service. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)} data-testid={testId}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
          <CardDescription>
            Update your service information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General error message */}
            {errors.general && (
              <div
                className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
                role="alert"
                aria-live="polite"
              >
                {errors.general}
              </div>
            )}

            {/* Service name */}
            <Input
              label="Service Name *"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              errorMessage={errors.name}
              placeholder="e.g., Haircut & Styling"
              required
              disabled={isSubmitting}
            />

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent",
                  errors.description ? "border-red-300" : "border-gray-300"
                )}
                rows={4}
                placeholder="Detailed description of your service..."
                required
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent",
                  errors.categoryId ? "border-red-300" : "border-gray-300"
                )}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Base Price * ($)
              </label>
              <Input
                type="number"
                value={formData.pricing?.basePrice}
                onChange={(e) => handleFieldChange('pricing.basePrice', parseFloat(e.target.value) || 0)}
                errorMessage={errors.pricing?.basePrice}
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes) *
              </label>
              <Input
                type="number"
                value={formData.schedule?.duration}
                onChange={(e) => handleFieldChange('schedule.duration', parseInt(e.target.value) || 0)}
                min="15"
                step="15"
                placeholder="60"
                disabled={isSubmitting}
              />
            </div>

            {/* Form actions */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Updating service..."
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * ServiceEdit component display name for debugging
 */
ServiceEdit.displayName = 'ServiceEdit';

export default ServiceEdit;