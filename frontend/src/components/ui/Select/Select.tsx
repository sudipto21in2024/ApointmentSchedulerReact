import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';

/**
 * Select component props interface
 */
export interface SelectProps {
  /** Select options */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Selected value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether select is disabled */
  disabled?: boolean;
  /** Whether select is in loading state */
  loading?: boolean;
  /** Whether select is in error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Whether select is required */
  required?: boolean;
  /** Select size */
  size?: 'sm' | 'md' | 'lg';
  /** Select variant */
  variant?: 'default' | 'outline' | 'filled';
  /** Whether to show search functionality */
  searchable?: boolean;
  /** Whether to allow multiple selection */
  multiple?: boolean;
  /** Whether to allow clearing the selection */
  clearable?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Change event handler */
  onChange?: (value: string | string[]) => void;
  /** Focus event handler */
  onFocus?: () => void;
  /** Blur event handler */
  onBlur?: () => void;
  /** Search change handler (for searchable select) */
  onSearch?: (query: string) => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Select Component - A flexible dropdown select component
 *
 * Features:
 * - Single and multiple selection modes
 * - Searchable options
 * - Clearable selection
 * - Loading and error states
 * - Keyboard navigation
 * - Accessible design
 * - Customizable styling
 *
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   placeholder="Choose an option"
 * />
 *
 * // Searchable select
 * <Select
 *   options={options}
 *   searchable
 *   onSearch={handleSearch}
 *   placeholder="Search options..."
 * />
 *
 * // Multiple select
 * <Select
 *   options={options}
 *   multiple
 *   value={selectedValues}
 *   onChange={setSelectedValues}
 *   placeholder="Select multiple options"
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option',
  disabled = false,
  loading = false,
  error = false,
  errorMessage,
  required = false,
  size = 'md',
  variant = 'default',
  searchable = false,
  multiple = false,
  clearable = false,
  className,
  onChange,
  onFocus,
  onBlur,
  onSearch,
  'data-testid': testId,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on search query
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Get display value for single select
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      const selectedLabels = value
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean);
      return selectedLabels.length > 0 ? `${selectedLabels.length} selected` : placeholder;
    }

    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption?.label || placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.('');
    }
  };

  // Handle input change for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case ' ':
        e.preventDefault();
        setIsOpen(true);
        break;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    default: 'border-gray-300 bg-white',
    outline: 'border-gray-300 bg-transparent',
    filled: 'border-transparent bg-gray-100'
  };

  return (
    <div className={cn('relative', className)} ref={selectRef} data-testid={testId} {...props}>
      {/* Main select button */}
      <button
        type="button"
        className={cn(
          'relative w-full rounded-md border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          error && 'border-red-500 focus:ring-red-500',
          isOpen && 'ring-2 ring-primary-main ring-offset-2',
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {searchable && isOpen ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn(
                'block truncate',
                (multiple ? Array.isArray(value) && value.length === 0 : !value) && 'text-gray-500'
              )}>
                {getDisplayValue()}
              </span>
            )}
          </div>

          <div className="flex items-center ml-2">
            {clearable && (multiple ? Array.isArray(value) && value.length > 0 : value) && !loading && (
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-full mr-1"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {loading ? (
              <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform',
                  isOpen && 'transform rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul role="listbox" ref={listRef} className="py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                {searchable && searchQuery ? 'No results found' : 'No options available'}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    highlightedIndex === index && 'bg-primary-main text-white',
                    !option.disabled && highlightedIndex !== index && 'hover:bg-gray-50',
                    option.disabled && 'text-gray-400 cursor-not-allowed',
                    (multiple
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value
                    ) && 'bg-primary-main bg-opacity-10 text-primary-main'
                  )}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  role="option"
                  aria-selected={multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value
                  }
                >
                  <div className="flex items-center">
                    {multiple && (
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={Array.isArray(value) && value.includes(option.value)}
                        onChange={() => {}}
                        disabled={option.disabled}
                      />
                    )}
                    <span className={option.disabled ? 'text-gray-400' : 'text-gray-900'}>
                      {option.label}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Error message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Select;