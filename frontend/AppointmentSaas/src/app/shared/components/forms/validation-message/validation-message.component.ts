import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

export type ValidationMessageType = 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="shouldShowMessage()"
      class="validation-message"
      [class]="getMessageClasses()"
      [attr.role]="type === 'error' ? 'alert' : null"
      [attr.aria-live]="type === 'error' ? 'polite' : null"
    >
      <span *ngIf="icon" class="validation-message__icon" [innerHTML]="icon"></span>
      <span class="validation-message__text">{{ message }}</span>
    </div>
  `,
  styles: [`
    .validation-message {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-xs, 4px);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-regular, 400);
      line-height: 1.4;
      margin-top: var(--spacing-xs, 4px);
      transition: var(--transition-normal, 0.2s ease);
    }

    .validation-message__icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: inline-block;
    }

    .validation-message__text {
      flex: 1;
    }

    /* Error message */
    .validation-message--error {
      color: var(--color-secondary-danger, #ef4444);
    }

    .validation-message--error .validation-message__icon {
      color: var(--color-secondary-danger, #ef4444);
    }

    /* Success message */
    .validation-message--success {
      color: var(--color-secondary-success, #10b981);
    }

    .validation-message--success .validation-message__icon {
      color: var(--color-secondary-success, #10b981);
    }

    /* Warning message */
    .validation-message--warning {
      color: var(--color-secondary-warning, #f59e0b);
    }

    .validation-message--warning .validation-message__icon {
      color: var(--color-secondary-warning, #f59e0b);
    }

    /* Info message */
    .validation-message--info {
      color: var(--color-secondary-info, #3b82f6);
    }

    .validation-message--info .validation-message__icon {
      color: var(--color-secondary-info, #3b82f6);
    }

    /* Animation for appearance */
    .validation-message {
      animation: slideInUp 0.2s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .validation-message {
        font-size: var(--font-size-xs, 12px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationMessageComponent {
  @Input() control?: AbstractControl | null;
  @Input() message?: string;
  @Input() type: ValidationMessageType = 'error';
  @Input() icon?: string;
  @Input() showOnTouched: boolean = true;
  @Input() showOnDirty: boolean = true;

  shouldShowMessage(): boolean {
    if (!this.control && !this.message) {
      return false;
    }

    // If custom message is provided, always show it
    if (this.message) {
      return true;
    }

    // If no control, don't show
    if (!this.control) {
      return false;
    }

    // Check if control has errors
    const hasErrors = this.control.errors && Object.keys(this.control.errors).length > 0;

    if (!hasErrors) {
      return false;
    }

    // Check touched state
    if (this.showOnTouched && !this.control.touched) {
      return false;
    }

    // Check dirty state
    if (this.showOnDirty && !this.control.dirty) {
      return false;
    }

    return true;
  }

  getMessageClasses(): string {
    const classes = ['validation-message'];

    classes.push(`validation-message--${this.type}`);

    return classes.join(' ');
  }

  getDefaultIcon(): string {
    switch (this.type) {
      case 'error':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
      case 'success':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>`;
      case 'warning':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
      case 'info':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12,16 L12,12"></path>
          <path d="M12,8 L12.01,8"></path>
        </svg>`;
      default:
        return '';
    }
  }
}