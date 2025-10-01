import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardConfig {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.card--elevated]="config.variant === 'elevated'"
      [class.card--outlined]="config.variant === 'outlined'"
      [class.card--filled]="config.variant === 'filled'"
      [class.card--interactive]="config.interactive"
      [class.card--disabled]="config.disabled"
      [class.card--loading]="config.loading"
      [class.card--padding-none]="config.padding === 'none'"
      [class.card--padding-sm]="config.padding === 'sm'"
      [class.card--padding-md]="config.padding === 'md'"
      [class.card--padding-lg]="config.padding === 'lg'"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      position: relative;
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-card, 8px);
      transition: var(--transition-normal, 0.2s ease);
    }

    .card--elevated {
      box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.1));
    }

    .card--elevated:hover {
      box-shadow: var(--shadow-card-hover, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .card--outlined {
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
    }

    .card--filled {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .card--interactive {
      cursor: pointer;
    }

    .card--interactive:hover {
      transform: translateY(-1px);
    }

    .card--interactive:active {
      transform: translateY(0);
    }

    .card--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .card--loading {
      position: relative;
      overflow: hidden;
    }

    .card--loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: loading-shimmer 1.5s infinite;
    }

    .card--padding-none {
      padding: 0;
    }

    .card--padding-sm {
      padding: var(--spacing-sm, 8px);
    }

    .card--padding-md {
      padding: var(--spacing-md, 16px);
    }

    .card--padding-lg {
      padding: var(--spacing-lg, 24px);
    }

    @keyframes loading-shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .card--padding-md,
      .card--padding-lg {
        padding: var(--spacing-sm, 8px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() config: CardConfig = {
    variant: 'elevated',
    padding: 'md',
    interactive: false,
    disabled: false,
    loading: false
  };
}