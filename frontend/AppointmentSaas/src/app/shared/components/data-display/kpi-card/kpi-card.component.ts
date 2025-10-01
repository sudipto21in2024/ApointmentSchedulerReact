import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiData {
  value: number | string;
  label: string;
  previousValue?: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface KpiCardConfig {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  showTrend?: boolean;
  showIcon?: boolean;
  showSparkline?: boolean;
  clickable?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="kpi-card"
      [class]="'kpi-card--' + config.size"
      [class]="'kpi-card--' + config.variant"
      [class]="'kpi-card--' + data.color"
      [class.kpi-card--clickable]="config.clickable"
      [class.kpi-card--loading]="config.loading"
      (click)="config.clickable && onCardClick()"
    >
      <!-- Loading State -->
      <div *ngIf="config.loading" class="kpi-card__loading">
        <div class="kpi-card__loading-shimmer"></div>
      </div>

      <!-- Card Content -->
      <div *ngIf="!config.loading" class="kpi-card__content">
        <!-- Icon -->
        <div *ngIf="config.showIcon !== false && data.icon" class="kpi-card__icon">
          <i [class]="data.icon" [class]="'kpi-card__icon--' + data.color"></i>
        </div>

        <!-- Main Value -->
        <div class="kpi-card__value-section">
          <div class="kpi-card__value">
            {{ formatValue(data.value) }}
            <span *ngIf="data.unit" class="kpi-card__unit">{{ data.unit }}</span>
          </div>

          <!-- Label -->
          <div class="kpi-card__label">{{ data.label }}</div>
        </div>

        <!-- Trend Indicator -->
        <div *ngIf="config.showTrend !== false && data.trend && data.trendValue !== undefined" class="kpi-card__trend">
          <div class="kpi-card__trend-indicator" [class]="'kpi-card__trend--' + data.trend">
            <svg class="kpi-card__trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                *ngIf="data.trend === 'up'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
              <path
                *ngIf="data.trend === 'down'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
          <div class="kpi-card__trend-value">
            <span class="kpi-card__trend-number">{{ formatTrendValue(data.trendValue) }}</span>
            <span class="kpi-card__trend-label">vs previous</span>
          </div>
        </div>

        <!-- Sparkline Chart -->
        <div *ngIf="config.showSparkline && sparklineData" class="kpi-card__sparkline">
          <svg class="kpi-card__sparkline-svg" viewBox="0 0 100 30">
            <polyline
              class="kpi-card__sparkline-line"
              [class]="'kpi-card__sparkline-line--' + data.color"
              fill="none"
              stroke-width="2"
              [attr.points]="generateSparklinePoints()"
            />
          </svg>
        </div>
      </div>

      <!-- Click Indicator -->
      <div *ngIf="config.clickable" class="kpi-card__click-indicator">
        <svg class="kpi-card__click-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      position: relative;
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-lg, 12px);
      padding: var(--spacing-lg, 24px);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      transition: var(--transition-normal, 0.2s ease);
      overflow: hidden;
    }

    .kpi-card:hover {
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
      transform: translateY(-2px);
    }

    .kpi-card--clickable {
      cursor: pointer;
    }

    .kpi-card--clickable:hover {
      border-color: var(--color-primary-300, #93c5fd);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
    }

    .kpi-card--loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-neutral-white, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-card__loading-shimmer {
      width: 60%;
      height: 20px;
      background: linear-gradient(
        90deg,
        var(--color-neutral-gray200, #e5e7eb) 25%,
        var(--color-neutral-gray100, #f3f4f6) 50%,
        var(--color-neutral-gray200, #e5e7eb) 75%
      );
      background-size: 200% 100%;
      border-radius: var(--border-radius-sm, 4px);
      animation: kpi-shimmer 1.5s infinite;
    }

    @keyframes kpi-shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .kpi-card__content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md, 16px);
    }

    .kpi-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-lg, 12px);
      background: var(--color-neutral-gray50, #f9fafb);
      flex-shrink: 0;
    }

    .kpi-card__icon i {
      font-size: 24px;
      color: var(--color-neutral-gray600, #4b5563);
    }

    .kpi-card__icon--primary i {
      color: var(--color-primary-600, #2563eb);
    }

    .kpi-card__icon--success i {
      color: var(--color-success-600, #059669);
    }

    .kpi-card__icon--warning i {
      color: var(--color-warning-600, #d97706);
    }

    .kpi-card__icon--error i {
      color: var(--color-error-600, #dc2626);
    }

    .kpi-card__icon--info i {
      color: var(--color-info-600, #0891b2);
    }

    .kpi-card__value-section {
      flex: 1;
      min-width: 0;
    }

    .kpi-card__value {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-xs, 4px);
      font-size: var(--font-size-3xl, 30px);
      font-weight: var(--font-weight-bold, 700);
      color: var(--color-neutral-gray900, #111827);
      line-height: 1.2;
      margin-bottom: var(--spacing-xs, 4px);
    }

    .kpi-card__unit {
      font-size: var(--font-size-lg, 18px);
      color: var(--color-neutral-gray600, #4b5563);
      font-weight: var(--font-weight-medium, 500);
    }

    .kpi-card__label {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1.3;
    }

    .kpi-card__trend {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
    }

    .kpi-card__trend-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-full, 9999px);
    }

    .kpi-card__trend--up {
      background: var(--color-success-100, #dcfce7);
    }

    .kpi-card__trend--down {
      background: var(--color-error-100, #fee2e2);
    }

    .kpi-card__trend--neutral {
      background: var(--color-neutral-100, #f3f4f6);
    }

    .kpi-card__trend-icon {
      width: 16px;
      height: 16px;
    }

    .kpi-card__trend--up .kpi-card__trend-icon {
      color: var(--color-success-600, #059669);
    }

    .kpi-card__trend--down .kpi-card__trend-icon {
      color: var(--color-error-600, #dc2626);
    }

    .kpi-card__trend--neutral .kpi-card__trend-icon {
      color: var(--color-neutral-600, #4b5563);
    }

    .kpi-card__trend-value {
      text-align: right;
    }

    .kpi-card__trend-number {
      display: block;
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-semibold, 600);
      line-height: 1.2;
    }

    .kpi-card__trend--up .kpi-card__trend-number {
      color: var(--color-success-700, #047857);
    }

    .kpi-card__trend--down .kpi-card__trend-number {
      color: var(--color-error-700, #b91c1c);
    }

    .kpi-card__trend--neutral .kpi-card__trend-number {
      color: var(--color-neutral-700, #374151);
    }

    .kpi-card__trend-label {
      display: block;
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray500, #6b7280);
      line-height: 1.2;
    }

    .kpi-card__sparkline {
      width: 80px;
      height: 30px;
      flex-shrink: 0;
    }

    .kpi-card__sparkline-svg {
      width: 100%;
      height: 100%;
    }

    .kpi-card__sparkline-line {
      stroke-width: 2;
      fill: none;
    }

    .kpi-card__sparkline-line--primary {
      stroke: var(--color-primary-500, #3b82f6);
    }

    .kpi-card__sparkline-line--success {
      stroke: var(--color-success-500, #10b981);
    }

    .kpi-card__sparkline-line--warning {
      stroke: var(--color-warning-500, #f59e0b);
    }

    .kpi-card__sparkline-line--error {
      stroke: var(--color-error-500, #ef4444);
    }

    .kpi-card__sparkline-line--info {
      stroke: var(--color-info-500, #06b6d4);
    }

    .kpi-card__click-indicator {
      position: absolute;
      top: var(--spacing-sm, 8px);
      right: var(--spacing-sm, 8px);
      opacity: 0;
      transition: var(--transition-normal, 0.2s ease);
    }

    .kpi-card--clickable:hover .kpi-card__click-indicator {
      opacity: 1;
    }

    .kpi-card__click-icon {
      width: 16px;
      height: 16px;
      color: var(--color-neutral-gray400, #9ca3af);
    }

    /* Size Variants */
    .kpi-card--sm {
      padding: var(--spacing-md, 16px);
    }

    .kpi-card--sm .kpi-card__icon {
      width: 40px;
      height: 40px;
    }

    .kpi-card--sm .kpi-card__icon i {
      font-size: 20px;
    }

    .kpi-card--sm .kpi-card__value {
      font-size: var(--font-size-2xl, 24px);
    }

    .kpi-card--lg {
      padding: var(--spacing-xl, 32px);
    }

    .kpi-card--lg .kpi-card__icon {
      width: 64px;
      height: 64px;
    }

    .kpi-card--lg .kpi-card__icon i {
      font-size: 32px;
    }

    .kpi-card--lg .kpi-card__value {
      font-size: var(--font-size-4xl, 36px);
    }

    /* Variant Styles */
    .kpi-card--outlined {
      background: transparent;
      border: 2px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .kpi-card--filled {
      background: var(--color-neutral-gray50, #f9fafb);
      border-color: var(--color-neutral-gray300, #d1d5db);
    }

    /* Color Variants */
    .kpi-card--primary {
      border-color: var(--color-primary-200, #bfdbfe);
      background: var(--color-primary-50, #eff6ff);
    }

    .kpi-card--success {
      border-color: var(--color-success-200, #bbf7d0);
      background: var(--color-success-50, #ecfdf5);
    }

    .kpi-card--warning {
      border-color: var(--color-warning-200, #fed7aa);
      background: var(--color-warning-50, #fffbeb);
    }

    .kpi-card--error {
      border-color: var(--color-error-200, #fecaca);
      background: var(--color-error-50, #fef2f2);
    }

    .kpi-card--info {
      border-color: var(--color-info-200, #bae6fd);
      background: var(--color-info-50, #f0f9ff);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .kpi-card {
        padding: var(--spacing-md, 16px);
      }

      .kpi-card__content {
        gap: var(--spacing-sm, 8px);
      }

      .kpi-card__value {
        font-size: var(--font-size-2xl, 24px);
      }

      .kpi-card__trend {
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs, 4px);
      }

      .kpi-card__sparkline {
        width: 60px;
      }
    }

    @media (max-width: 480px) {
      .kpi-card__content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm, 8px);
      }

      .kpi-card__trend {
        align-items: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  @Input() config: KpiCardConfig = {
    size: 'md',
    variant: 'default',
    showTrend: true,
    showIcon: true,
    showSparkline: false,
    clickable: false,
    loading: false
  };

  @Input() data!: KpiData;
  @Input() sparklineData?: number[];

  formatValue(value: number | string): string {
    if (typeof value === 'string') return value;

    switch (this.data.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);

      case 'percentage':
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(value / 100);

      case 'duration':
        return this.formatDuration(value);

      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1
        }).format(value);
    }
  }

  formatTrendValue(value: number): string {
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(absValue);

    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  generateSparklinePoints(): string {
    if (!this.sparklineData || this.sparklineData.length === 0) {
      return '';
    }

    const max = Math.max(...this.sparklineData);
    const min = Math.min(...this.sparklineData);
    const range = max - min || 1;

    const points = this.sparklineData.map((value, index) => {
      const x = (index / (this.sparklineData!.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 25; // Leave some padding
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  onCardClick(): void {
    // This can be extended to emit an event for parent components
    console.log('KPI Card clicked:', this.data.label);
  }
}