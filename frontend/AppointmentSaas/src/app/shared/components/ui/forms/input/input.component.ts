import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule for potential error icon

/**
 * Reusable input component with form control integration and validation display.
 *
 * @example
 * ```html
 * <app-input label="Username" placeholder="Enter your username" [control]="usernameControl" errorMessage="Username is required."></app-input>
 * ```
 *
 * @property {string} label - The label for the input field.
 * @property {string} placeholder - The placeholder text for the input field.
 * @property {string} type - The HTML input type (e.g., 'text', 'password', 'email'). Defaults to 'text'.
 * @property {FormControl} control - The Angular FormControl instance to bind to.
 * @property {string} errorMessage - The error message to display when the control is invalid.
 * @property {boolean} disabled - Whether the input field is disabled. Defaults to 'false'.
 */

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() control: FormControl = new FormControl();
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;

  value: any = '';
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouch();
  }

  get hasError(): boolean {
    return this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }
}