import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export interface FormSelectConfig {
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined';
  allowCustom?: boolean;
  required?: boolean;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-select" [class.form-select--disabled]="config.disabled">
      <!-- Label -->
      <label *ngIf="label" class="form-select__label" [for]="inputId">
        {{ label }}
        <span *ngIf="config.required" class="form-select__required">*</span>
      </label>

      <!-- Select Container -->
      <div class="form-select__container" [class.form-select__container--focused]="isOpen">
        <!-- Selected Value Display -->
        <div
          class="form-select__value"
          [class.form-select__value--placeholder]="!hasSelection"
          (click)="toggleDropdown()"
        >
          <div class="form-select__value-content">
            <!-- Single Selection -->
            <div *ngIf="!config.multiple && selectedValue !== null && selectedValue !== undefined">
              <span *ngIf="getSelectedOption()?.icon" class="form-select__option-icon">
                <i [class]="getSelectedOption()?.icon"></i>
              </span>
              {{ getSelectedOption()?.label }}
            </div>

            <!-- Multiple Selection -->
            <div *ngIf="config.multiple && selectedValues.length > 0" class="form-select__multiple">
              <span class="form-select__multiple-badge" *ngFor="let value of selectedValues">
                {{ getOptionByValue(value)?.label }}
                <button
                  class="form-select__multiple-remove"
                  (click)="removeFromSelection(value); $event.stopPropagation()"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            </div>

            <!-- Placeholder -->
            <span *ngIf="!hasSelection" class="form-select__placeholder">
              {{ config.placeholder || 'Select an option...' }}
            </span>
          </div>

          <!-- Dropdown Arrow -->
          <svg
            class="form-select__arrow"
            [class.form-select__arrow--rotated]="isOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <!-- Dropdown -->
        <div
          *ngIf="isOpen"
          class="form-select__dropdown"
          [class.form-select__dropdown--above]="dropdownAbove"
        >
          <!-- Search Input -->
          <div *ngIf="config.searchable" class="form-select__search">
            <input
              #searchInput
              type="text"
              class="form-select__search-input"
              [placeholder]="'Search...'"
              [(ngModel)]="searchTerm"
              (input)="onSearchInput()"
            />
            <svg class="form-select__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <!-- Options List -->
          <div class="form-select__options" [class.form-select__options--loading]="config.loading">
            <!-- Loading State -->
            <div *ngIf="config.loading" class="form-select__loading">
              <div class="form-select__loading-spinner"></div>
              <span>Loading...</span>
            </div>

            <!-- No Options -->
            <div *ngIf="!config.loading && filteredOptions.length === 0" class="form-select__no-options">
              {{ searchTerm ? 'No options found.' : 'No options available.' }}
            </div>

            <!-- Options -->
            <div
              *ngFor="let option of filteredOptions; let i = index"
              class="form-select__option"
              [class.form-select__option--selected]="isSelected(option)"
              [class.form-select__option--disabled]="option.disabled"
              [class.form-select__option--focused]="focusedIndex === i"
              (click)="selectOption(option)"
              (mouseenter)="focusedIndex = i"
            >
              <div class="form-select__option-content">
                <span *ngIf="option.icon" class="form-select__option-icon">
                  <i [class]="option.icon"></i>
                </span>
                <div class="form-select__option-text">
                  <div class="form-select__option-label">{{ option.label }}</div>
                  <div *ngIf="option.description" class="form-select__option-description">
                    {{ option.description }}
                  </div>
                </div>
                <div class="form-select__option-check">
                  <svg *ngIf="isSelected(option)" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Value Input -->
          <div *ngIf="config.allowCustom && showCustomInput" class="form-select__custom">
            <input
              #customInput
              type="text"
              class="form-select__custom-input"
              [placeholder]="'Enter custom value...'"
              [(ngModel)]="customValue"
              (keydown.enter)="addCustomValue()"
              (keydown.escape)="showCustomInput = false"
              (blur)="addCustomValue()"
            />
            <button
              class="form-select__custom-add"
              (click)="addCustomValue()"
              type="button"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Helper Text -->
      <div *ngIf="helperText" class="form-select__helper">
        {{ helperText }}
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="form-select__error">
        <svg class="form-select__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .form-select {
      position: relative;
      width: 100%;
    }

    .form-select--disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .form-select__label {
      display: block;
      margin-bottom: var(--spacing-xs, 4px);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-neutral-gray700, #374151);
      line-height: 1.4;
    }

    .form-select__required {
      color: var(--color-error-500, #ef4444);
      margin-left: var(--spacing-xs, 4px);
    }

    .form-select__container {
      position: relative;
      width: 100%;
    }

    .form-select__container--focused {
      z-index: var(--z-dropdown, 1000);
    }

    .form-select__value {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-md, 8px);
      background: var(--color-neutral-white, #ffffff);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      min-height: 40px;
    }

    .form-select__value:hover {
      border-color: var(--color-neutral-gray400, #9ca3af);
    }

    .form-select__value--placeholder {
      color: var(--color-neutral-gray500, #6b7280);
    }

    .form-select__value-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      flex-wrap: wrap;
    }

    .form-select__multiple {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
    }

    .form-select__multiple-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      background: var(--color-primary-100, #dbeafe);
      color: var(--color-primary-800, #1e40af);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      border-radius: var(--border-radius-full, 9999px);
      border: 1px solid var(--color-primary-200, #bfdbfe);
    }

    .form-select__multiple-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: none;
      border: none;
      border-radius: var(--border-radius-full, 9999px);
      color: var(--color-primary-600, #2563eb);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .form-select__multiple-remove:hover {
      background: var(--color-primary-200, #bfdbfe);
    }

    .form-select__multiple-remove svg {
      width: 12px;
      height: 12px;
    }

    .form-select__placeholder {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray500, #6b7280);
    }

    .form-select__arrow {
      width: 20px;
      height: 20px;
      color: var(--color-neutral-gray400, #9ca3af);
      transition: var(--transition-normal, 0.2s ease);
      flex-shrink: 0;
    }

    .form-select__arrow--rotated {
      transform: rotate(180deg);
    }

    .form-select__dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-neutral-white, #ffffff);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-md, 8px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
      max-height: 200px;
      overflow-y: auto;
      z-index: var(--z-dropdown, 1000);
      margin-top: var(--spacing-xs, 4px);
    }

    .form-select__dropdown--above {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: var(--spacing-xs, 4px);
    }

    .form-select__search {
      position: relative;
      padding: var(--spacing-sm, 8px);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .form-select__search-input {
      width: 100%;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px) var(--spacing-sm, 8px) 40px;
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      background: var(--color-neutral-white, #ffffff);
    }

    .form-select__search-input:focus {
      outline: none;
      border-color: var(--color-primary-500, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .form-select__search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--color-neutral-gray400, #9ca3af);
    }

    .form-select__options {
      max-height: 160px;
      overflow-y: auto;
    }

    .form-select__options--loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg, 24px);
    }

    .form-select__loading {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
    }

    .form-select__loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--color-neutral-gray300, #d1d5db);
      border-top: 2px solid var(--color-primary-500, #3b82f6);
      border-radius: var(--border-radius-full, 9999px);
      animation: form-select-spin 1s linear infinite;
    }

    @keyframes form-select-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-select__no-options {
      padding: var(--spacing-lg, 24px);
      text-align: center;
      color: var(--color-neutral-gray500, #6b7280);
      font-size: var(--font-size-sm, 14px);
    }

    .form-select__option {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      border-bottom: 1px solid var(--color-neutral-gray100, #f3f4f6);
    }

    .form-select__option:last-child {
      border-bottom: none;
    }

    .form-select__option:hover {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .form-select__option--selected {
      background: var(--color-primary-50, #eff6ff);
      color: var(--color-primary-900, #1e3a8a);
    }

    .form-select__option--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .form-select__option--focused {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .form-select__option-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
    }

    .form-select__option-icon {
      display: flex;
      align-items: center;
      width: 16px;
      height: 16px;
      color: var(--color-neutral-gray600, #4b5563);
      flex-shrink: 0;
    }

    .form-select__option-text {
      flex: 1;
      min-width: 0;
    }

    .form-select__option-label {
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-neutral-gray900, #111827);
      line-height: 1.4;
    }

    .form-select__option-description {
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray600, #4b5563);
      line-height: 1.3;
      margin-top: 2px;
    }

    .form-select__option-check {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--color-primary-600, #2563eb);
      flex-shrink: 0;
    }

    .form-select__custom {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border-top: 1px solid var(--color-neutral-gray200, #e5e7eb);
      display: flex;
      gap: var(--spacing-sm, 8px);
    }

    .form-select__custom-input {
      flex: 1;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      background: var(--color-neutral-white, #ffffff);
    }

    .form-select__custom-input:focus {
      outline: none;
      border-color: var(--color-primary-500, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .form-select__custom-add {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      background: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
      border: none;
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .form-select__custom-add:hover {
      background: var(--color-primary-700, #1d4ed8);
    }

    .form-select__helper {
      margin-top: var(--spacing-xs, 4px);
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray600, #4b5563);
      line-height: 1.4;
    }

    .form-select__error {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      margin-top: var(--spacing-xs, 4px);
      font-size: var(--font-size-xs, 12px);
      color: var(--color-error-600, #dc2626);
      line-height: 1.4;
    }

    .form-select__error-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .form-select__dropdown {
        max-height: 150px;
      }

      .form-select__options {
        max-height: 120px;
      }

      .form-select__custom {
        flex-direction: column;
      }

      .form-select__custom-add {
        align-self: stretch;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent implements ControlValueAccessor {
  @Input() config: FormSelectConfig = {
    multiple: false,
    searchable: false,
    clearable: false,
    disabled: false,
    loading: false,
    size: 'md',
    variant: 'default',
    allowCustom: false,
    required: false
  };

  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() placeholder?: string;
  @Input() options: SelectOption[] = [];

  @Output() selectionChange = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();

  private onChange = (value: any) => {};
  private onTouched = () => {};

  isOpen = false;
  searchTerm = '';
  focusedIndex = -1;
  dropdownAbove = false;
  showCustomInput = false;
  customValue = '';
  selectedValue: any = null;
  selectedValues: any[] = [];

  get inputId(): string {
    return `form-select-${Math.random().toString(36).substr(2, 9)}`;
  }

  get hasSelection(): boolean {
    return this.config.multiple ? this.selectedValues.length > 0 : this.selectedValue !== null && this.selectedValue !== undefined;
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchTerm) {
      return this.options;
    }
    return this.options.filter(option =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit() {
    // Set placeholder from config if not provided as input
    if (!this.placeholder && this.config.placeholder) {
      this.placeholder = this.config.placeholder;
    }
  }

  writeValue(value: any): void {
    if (this.config.multiple) {
      this.selectedValues = Array.isArray(value) ? value : [];
    } else {
      this.selectedValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.config.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.config.disabled) return;

    this.isOpen = !this.isOpen;
    this.focusedIndex = -1;
    this.searchTerm = '';

    if (this.isOpen) {
      // Check if dropdown should be above
      setTimeout(() => {
        const dropdown = document.querySelector('.form-select__dropdown');
        if (dropdown) {
          const rect = dropdown.getBoundingClientRect();
          this.dropdownAbove = rect.bottom > window.innerHeight && rect.top > window.innerHeight - rect.height;
        }
      });
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.config.multiple) {
      const index = this.selectedValues.indexOf(option.value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
      } else {
        this.selectedValues.push(option.value);
      }
      this.onChange(this.selectedValues);
    } else {
      this.selectedValue = option.value;
      this.isOpen = false;
      this.onChange(this.selectedValue);
    }

    this.selectionChange.emit(this.config.multiple ? this.selectedValues : this.selectedValue);
    this.onTouched();
  }

  removeFromSelection(value: any): void {
    if (this.config.multiple) {
      const index = this.selectedValues.indexOf(value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
        this.onChange(this.selectedValues);
        this.selectionChange.emit(this.selectedValues);
      }
    }
  }

  isSelected(option: SelectOption): boolean {
    if (this.config.multiple) {
      return this.selectedValues.includes(option.value);
    } else {
      return this.selectedValue === option.value;
    }
  }

  getSelectedOption(): SelectOption | undefined {
    return this.options.find(option => option.value === this.selectedValue);
  }

  getOptionByValue(value: any): SelectOption | undefined {
    return this.options.find(option => option.value === value);
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchTerm);
  }

  addCustomValue(): void {
    if (this.customValue.trim()) {
      const customOption: SelectOption = {
        label: this.customValue.trim(),
        value: this.customValue.trim()
      };

      this.options.push(customOption);

      if (this.config.multiple) {
        this.selectedValues.push(customOption.value);
        this.onChange(this.selectedValues);
      } else {
        this.selectedValue = customOption.value;
        this.onChange(this.selectedValue);
      }

      this.selectionChange.emit(this.config.multiple ? this.selectedValues : this.selectedValue);
      this.showCustomInput = false;
      this.customValue = '';
    }
  }
}