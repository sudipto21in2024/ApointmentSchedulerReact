import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputConfig {
  type?: InputType;
  variant?: InputVariant;
  size?: InputSize;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
  maxlength?: number;
  minlength?: number;
  pattern?: string;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      <input
        #input
        [type]="config.type || 'text'"
        [value]="value"
        [placeholder]="config.placeholder || ''"
        [disabled]="config.disabled"
        [readOnly]="config.readonly"
        [required]="config.required"
        [autocomplete]="config.autocomplete"
        [maxLength]="config.maxlength"
        [minLength]="config.minlength"
        [pattern]="config.pattern"
        [class]="getInputClasses()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
    </div>
  `,
  styles: [`
    .input-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    input {
      width: 100%;
      font-family: var(--font-family, 'Inter', sans-serif);
      border-radius: var(--border-radius-input, 6px);
      transition: var(--transition-normal, 0.2s ease);
      outline: none;
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      background-color: var(--color-neutral-white, #ffffff);
    }

    input:focus {
      border-color: var(--color-primary-main, #2563EB);
      box-shadow: var(--focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.3));
    }

    input:disabled {
      background-color: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray500, #6b7280);
      cursor: not-allowed;
    }

    input:readonly {
      background-color: var(--color-neutral-gray50, #f9fafb);
      cursor: default;
    }

    input::placeholder {
      color: var(--color-neutral-gray500, #6b7280);
    }

    /* Variants */
    .input--filled {
      background-color: var(--color-neutral-gray50, #f9fafb);
      border-color: transparent;
    }

    .input--filled:focus {
      background-color: var(--color-neutral-white, #ffffff);
      border-color: var(--color-primary-main, #2563EB);
    }

    .input--outlined {
      background-color: transparent;
      border-color: var(--color-neutral-gray300, #d1d5db);
    }

    /* Sizes */
    .input--sm {
      height: 32px;
      padding: 0 var(--spacing-sm, 8px);
      font-size: var(--font-size-sm, 14px);
    }

    .input--md {
      height: 40px;
      padding: 0 var(--spacing-md, 16px);
      font-size: var(--font-size-base, 14px);
    }

    .input--lg {
      height: 48px;
      padding: 0 var(--spacing-lg, 24px);
      font-size: var(--font-size-base, 16px);
    }

    /* Error state */
    .input--error {
      border-color: var(--color-secondary-danger, #ef4444);
    }

    .input--error:focus {
      border-color: var(--color-secondary-danger, #ef4444);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
    }

    /* Success state */
    .input--success {
      border-color: var(--color-secondary-success, #10b981);
    }

    .input--success:focus {
      border-color: var(--color-secondary-success, #10b981);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .input--lg {
        height: 44px;
        padding: 0 var(--spacing-md, 16px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  @Input() config: InputConfig = {
    type: 'text',
    variant: 'default',
    size: 'md',
    placeholder: '',
    disabled: false,
    readonly: false,
    required: false
  };

  @Input() value: string = '';
  @Input() error: boolean = false;
  @Input() success: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();

  private onChange = (value: any) => {};
  private onTouched = () => {};

  getInputClasses(): string {
    const classes = ['input'];

    // Variant
    classes.push(`input--${this.config.variant || 'default'}`);

    // Size
    classes.push(`input--${this.config.size || 'md'}`);

    // States
    if (this.error) classes.push('input--error');
    if (this.success) classes.push('input--success');

    return classes.join(' ');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
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
}