import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonConfig {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="config.type || 'button'"
      class="btn"
      [class]="getButtonClasses()"
      [disabled]="config.disabled || config.loading"
      (click)="onClick.emit($event)"
    >
      <span *ngIf="config.loading" class="btn__spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      font-family: var(--font-family, 'Inter', sans-serif);
      font-weight: var(--font-weight-medium, 500);
      border-radius: var(--border-radius-button, 6px);
      transition: var(--transition-normal, 0.2s ease);
      cursor: pointer;
      text-decoration: none;
      border: none;
      outline: none;
      position: relative;
      overflow: hidden;
    }

    .btn:focus-visible {
      outline: 2px solid var(--color-primary-main, #2563EB);
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Variants */
    .btn--primary {
      background-color: var(--color-primary-main, #2563EB);
      color: white;
    }

    .btn--primary:hover:not(:disabled) {
      background-color: var(--color-primary-dark, #1D4ED8);
    }

    .btn--secondary {
      background-color: var(--color-neutral-gray100, #F3F4F6);
      color: var(--color-neutral-gray900, #111827);
    }

    .btn--secondary:hover:not(:disabled) {
      background-color: var(--color-neutral-gray200, #E5E7EB);
    }

    .btn--outline {
      background-color: transparent;
      color: var(--color-primary-main, #2563EB);
      border: 1px solid var(--color-primary-main, #2563EB);
    }

    .btn--outline:hover:not(:disabled) {
      background-color: var(--color-primary-main, #2563EB);
      color: white;
    }

    .btn--ghost {
      background-color: transparent;
      color: var(--color-primary-main, #2563EB);
    }

    .btn--ghost:hover:not(:disabled) {
      background-color: var(--color-primary-light, #DBEAFE);
    }

    .btn--link {
      background-color: transparent;
      color: var(--color-primary-main, #2563EB);
      text-decoration: underline;
      padding: 0;
      height: auto;
      min-height: auto;
    }

    .btn--link:hover:not(:disabled) {
      color: var(--color-primary-dark, #1D4ED8);
    }

    /* Sizes */
    .btn--sm {
      height: 32px;
      padding: 0 var(--spacing-md, 16px);
      font-size: var(--font-size-sm, 14px);
    }

    .btn--md {
      height: 40px;
      padding: 0 var(--spacing-lg, 24px);
      font-size: var(--font-size-base, 14px);
    }

    .btn--lg {
      height: 48px;
      padding: 0 var(--spacing-xl, 32px);
      font-size: var(--font-size-base, 16px);
    }

    /* Block */
    .btn--block {
      width: 100%;
    }

    /* Loading state */
    .btn__spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: btn-spin 1s linear infinite;
    }

    .btn--loading .btn__spinner {
      margin-right: var(--spacing-sm, 8px);
    }

    @keyframes btn-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .btn--lg {
        height: 44px;
        padding: 0 var(--spacing-lg, 24px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() config: ButtonConfig = {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
    type: 'button'
  };

  @Output() onClick = new EventEmitter<Event>();

  getButtonClasses(): string {
    const classes = ['btn'];

    // Variant
    classes.push(`btn--${this.config.variant || 'primary'}`);

    // Size
    classes.push(`btn--${this.config.size || 'md'}`);

    // Modifiers
    if (this.config.block) classes.push('btn--block');
    if (this.config.loading) classes.push('btn--loading');

    return classes.join(' ');
  }
}