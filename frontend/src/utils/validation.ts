/**
 * Form validation utilities for authentication and other forms
 * Provides reusable validation functions and error handling
 */

/**
 * Interface for validation rule configuration
 */
export interface ValidationRule {
  /** Whether the field is required */
  required?: boolean;
  /** Minimum length for string fields */
  minLength?: number;
  /** Maximum length for string fields */
  maxLength?: number;
  /** Regular expression pattern for validation */
  pattern?: RegExp;
  /** Custom validation function */
  custom?: (value: string, formData?: Record<string, any>) => boolean | string;
  /** Custom error message */
  message?: string;
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  message?: string;
}

/**
 * Interface for form field validation configuration
 */
export interface FieldValidation {
  /** Field name/key */
  name: string;
  /** Field display label */
  label: string;
  /** Validation rules */
  rules: ValidationRule[];
}

/**
 * Validates an email address format
 * @param email - Email string to validate
 * @returns ValidationResult with validity and error message
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  return { isValid: true };
};

/**
 * Validates password strength requirements
 * @param password - Password string to validate
 * @returns ValidationResult with validity and error message
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  return { isValid: true };
};

/**
 * Validates password confirmation matches original password
 * @param password - Original password
 * @param confirmPassword - Password confirmation
 * @returns ValidationResult with validity and error message
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Please confirm your password'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match'
    };
  }

  return { isValid: true };
};

/**
 * Validates a name field (first name, last name)
 * @param name - Name string to validate
 * @param fieldLabel - Label for the field (e.g., "First name")
 * @returns ValidationResult with validity and error message
 */
export const validateName = (name: string, fieldLabel: string = 'Name'): ValidationResult => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      message: `${fieldLabel} is required`
    };
  }

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: `${fieldLabel} must be at least 2 characters`
    };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      message: `${fieldLabel} must be less than 50 characters`
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return {
      isValid: false,
      message: `${fieldLabel} can only contain letters, spaces, hyphens, and apostrophes`
    };
  }

  return { isValid: true };
};

/**
 * Validates a phone number format
 * @param phone - Phone number string to validate
 * @returns ValidationResult with validity and error message
 */
export const validatePhone = (phone: string): ValidationResult => {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return {
      isValid: false,
      message: 'Phone number is required'
    };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = trimmedPhone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      message: 'Phone number must be at least 10 digits'
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      message: 'Phone number must be less than 15 digits'
    };
  }

  return { isValid: true };
};

/**
 * Validates a generic required field
 * @param value - Value to validate
 * @param fieldLabel - Label for the field
 * @returns ValidationResult with validity and error message
 */
export const validateRequired = (value: string, fieldLabel: string = 'Field'): ValidationResult => {
  if (!value.trim()) {
    return {
      isValid: false,
      message: `${fieldLabel} is required`
    };
  }

  return { isValid: true };
};

/**
 * Validates a field against custom rules
 * @param value - Value to validate
 * @param rules - Array of validation rules
 * @returns ValidationResult with validity and error message
 */
export const validateField = (value: string, rules: ValidationRule[]): ValidationResult => {
  for (const rule of rules) {
    // Required validation
    if (rule.required && !value.trim()) {
      return {
        isValid: false,
        message: rule.message || 'This field is required'
      };
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !rule.required) {
      continue;
    }

    // Minimum length validation
    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        message: rule.message || `Must be at least ${rule.minLength} characters`
      };
    }

    // Maximum length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        message: rule.message || `Must be less than ${rule.maxLength} characters`
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        isValid: false,
        message: rule.message || 'Invalid format'
      };
    }

    // Custom validation function
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        return {
          isValid: false,
          message: typeof customResult === 'string'
            ? customResult
            : (rule.message || 'Invalid value')
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Validates an entire form against field configurations
 * @param formData - Object containing form field values
 * @param fieldConfigs - Array of field validation configurations
 * @returns Object with field-specific errors and overall validity
 */
export const validateForm = (
  formData: Record<string, any>,
  fieldConfigs: FieldValidation[]
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const fieldConfig of fieldConfigs) {
    const value = formData[fieldConfig.name] || '';
    const result = validateField(value, fieldConfig.rules);

    if (!result.isValid && result.message) {
      errors[fieldConfig.name] = result.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Gets password strength information
 * @param password - Password to analyze
 * @returns Object with strength level, label, and color
 */
export const getPasswordStrength = (password: string) => {
  if (password.length === 0) {
    return { level: 0, label: '', color: '' };
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  // Bonus for longer passwords
  if (password.length >= 16) score++;

  if (score <= 2) return { level: 1, label: 'Weak', color: 'text-red-600' };
  if (score <= 4) return { level: 2, label: 'Fair', color: 'text-yellow-600' };
  if (score <= 6) return { level: 3, label: 'Good', color: 'text-blue-600' };
  return { level: 4, label: 'Strong', color: 'text-green-600' };
};

/**
 * Formats validation errors for display
 * @param errors - Object containing field errors
 * @returns Array of formatted error messages
 */
export const formatValidationErrors = (errors: Record<string, string>): string[] => {
  return Object.values(errors);
};

/**
 * Clears specific field errors when user starts typing
 * @param fieldName - Name of the field being updated
 * @param currentErrors - Current error state
 * @returns Updated error state with field error cleared
 */
export const clearFieldError = (
  fieldName: string,
  currentErrors: Record<string, string>
): Record<string, string> => {
  const newErrors = { ...currentErrors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Common validation rules for reuse across forms
 */
export const commonValidationRules = {
  email: {
    required: true,
    custom: (value: string) => {
      const result = validateEmail(value);
      return result.isValid || result.message || false;
    }
  },

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      const result = validatePassword(value);
      return result.isValid || result.message || false;
    }
  },

  name: (fieldLabel: string) => ({
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      const result = validateName(value, fieldLabel);
      return result.isValid || result.message || false;
    }
  }),

  phone: {
    required: true,
    custom: (value: string) => {
      const result = validatePhone(value);
      return result.isValid || result.message || false;
    }
  },

  required: (fieldLabel: string) => ({
    required: true,
    custom: (value: string) => {
      const result = validateRequired(value, fieldLabel);
      return result.isValid || result.message || false;
    }
  })
} as const;

/**
 * Authentication-specific validation configurations
 */
export const authValidationConfigs = {
  login: [
    {
      name: 'email',
      label: 'Email',
      rules: [commonValidationRules.email]
    },
    {
      name: 'password',
      label: 'Password',
      rules: [{ required: true, minLength: 6 }]
    }
  ],

  register: [
    {
      name: 'firstName',
      label: 'First name',
      rules: [commonValidationRules.name('First name')]
    },
    {
      name: 'lastName',
      label: 'Last name',
      rules: [commonValidationRules.name('Last name')]
    },
    {
      name: 'email',
      label: 'Email',
      rules: [commonValidationRules.email]
    },
    {
      name: 'password',
      label: 'Password',
      rules: [commonValidationRules.password]
    },
    {
      name: 'confirmPassword',
      label: 'Confirm password',
      rules: [{
        required: true,
        custom: (value: string, formData?: any) => {
          if (!value) return 'Please confirm your password';
          if (formData?.password !== value) return 'Passwords do not match';
          return true;
        }
      }]
    },
    {
      name: 'role',
      label: 'Role',
      rules: [{ required: true }]
    },
    {
      name: 'agreeToTerms',
      label: 'Terms agreement',
      rules: [{ required: true }]
    }
  ],

  passwordReset: [
    {
      name: 'email',
      label: 'Email',
      rules: [commonValidationRules.email]
    }
  ]
} as const;

/**
 * Debounced validation function to avoid excessive validation calls
 * @param validateFn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced validation function
 */
export const debounceValidation = (
  validateFn: (...args: any[]) => ValidationResult,
  delay: number = 300
) => {
  let timeoutId: number;

  return (...args: any[]) => {
    clearTimeout(timeoutId);
    return new Promise<ValidationResult>((resolve) => {
      timeoutId = window.setTimeout(() => {
        const result = validateFn(...args);
        resolve(result);
      }, delay);
    });
  };
};

/**
 * Async validation function for server-side validation
 * @param value - Value to validate
 * @param validateFn - Async validation function
 * @param delay - Debounce delay
 * @returns Promise with validation result
 */
export const asyncValidateField = async (
  value: string,
  validateFn: (value: string) => Promise<ValidationResult>,
  delay: number = 300
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await validateFn(value);
        resolve(result);
      } catch (error) {
        resolve({
          isValid: false,
          message: 'Validation failed'
        });
      }
    }, delay);
  });
};

/**
 * Validates form data and returns formatted errors for display
 * @param formData - Form data object
 * @param config - Validation configuration
 * @returns Object with validation results
 */
export const validateAuthForm = (
  formData: Record<string, any>,
  config: FieldValidation[]
) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const field of config) {
    const value = formData[field.name] || '';
    const rules = field.rules.map(rule => {
      // Handle custom validation functions that need form data context
      if (typeof rule.custom === 'function') {
        const customResult = rule.custom(value, formData);
        if (customResult !== true) {
          return {
            isValid: false,
            message: typeof customResult === 'string' ? customResult : rule.message || 'Invalid'
          };
        }
      }

      // Handle other validation rules
      const result = validateField(value, [rule]);
      return result;
    });

    // Check if any rule failed
    const failedRule = rules.find(rule => !rule.isValid);
    if (failedRule && failedRule.message) {
      errors[field.name] = failedRule.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Type guard to check if a value is a validation error object
 * @param value - Value to check
 * @returns Boolean indicating if value is a ValidationResult
 */
export const isValidationResult = (value: any): value is ValidationResult => {
  return value && typeof value === 'object' && 'isValid' in value;
};

/**
 * Combines multiple validation results
 * @param results - Array of validation results
 * @returns Combined validation result
 */
export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  const errors = results.filter(result => !result.isValid).map(result => result.message);

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors[0] : undefined
  };
};

/**
 * Creates a validation summary for accessibility
 * @param errors - Object containing field errors
 * @returns Formatted error summary for screen readers
 */
export const createErrorSummary = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) {
    return '';
  }

  if (errorMessages.length === 1) {
    return `Error: ${errorMessages[0]}`;
  }

  return `Errors: ${errorMessages.join(', ')}`;
};

/**
 * Validation utility for real-time form validation feedback
 */
export const useFormValidation = () => {
  /**
   * Validates a single field and returns error state
   * @param value - Field value
   * @param rules - Validation rules
   * @returns Error message or empty string
   */
  const validateSingleField = (value: string, rules: ValidationRule[]): string => {
    const result = validateField(value, rules);
    return result.isValid ? '' : (result.message || '');
  };

  /**
   * Validates entire form and returns error object
   * @param formData - Form data
   * @param fieldConfigs - Field configurations
   * @returns Error object
   */
  const validateAllFields = (
    formData: Record<string, any>,
    fieldConfigs: FieldValidation[]
  ): Record<string, string> => {
    const result = validateForm(formData, fieldConfigs);
    return result.isValid ? {} : result.errors;
  };

  return {
    validateSingleField,
    validateAllFields,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateName,
    getPasswordStrength
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validatePhone,
  validateRequired,
  validateField,
  validateForm,
  getPasswordStrength,
  formatValidationErrors,
  clearFieldError,
  commonValidationRules,
  authValidationConfigs,
  debounceValidation,
  asyncValidateField,
  validateAuthForm,
  isValidationResult,
  combineValidationResults,
  createErrorSummary,
  useFormValidation
};