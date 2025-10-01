import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from '../../types';

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  height?: number;
  colors?: string[];
  animation?: boolean;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <!-- Chart Header -->
      <div *ngIf="title || subtitle" class="chart__header">
        <h3 *ngIf="title" class="chart__title">{{ title }}</h3>
        <p *ngIf="subtitle" class="chart__subtitle">{{ subtitle }}</p>
      </div>

      <!-- Chart Canvas -->
      <div class="chart__wrapper" [style.height.px]="config.height || 300">
        <canvas
          #chartCanvas
          class="chart__canvas"
          [attr.width]="width"
          [attr.height]="height"
        ></canvas>

        <!-- Loading State -->
        <div *ngIf="loading" class="chart__loading">
          <div class="chart__loading-spinner"></div>
          <span>Loading chart...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="chart__error">
          <svg class="chart__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span class="chart__error-text">{{ error }}</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && (!data || data.datasets.length === 0)" class="chart__empty">
          <svg class="chart__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="chart__empty-text">{{ emptyMessage || 'No data to display' }}</span>
        </div>
      </div>

      <!-- Chart Footer -->
      <div *ngIf="footer" class="chart__footer">
        <span class="chart__footer-text">{{ footer }}</span>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-md, 8px);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      padding: var(--spacing-lg, 24px);
    }

    .chart__header {
      margin-bottom: var(--spacing-lg, 24px);
      text-align: center;
    }

    .chart__title {
      margin: 0 0 var(--spacing-xs, 4px) 0;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
    }

    .chart__subtitle {
      margin: 0;
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
    }

    .chart__wrapper {
      position: relative;
      width: 100%;
    }

    .chart__canvas {
      display: block;
      max-width: 100%;
      height: auto;
    }

    .chart__loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      background: rgba(255, 255, 255, 0.9);
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
    }

    .chart__loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-neutral-gray200, #e5e7eb);
      border-top: 3px solid var(--color-primary-500, #3b82f6);
      border-radius: var(--border-radius-full, 9999px);
      animation: chart-spin 1s linear infinite;
    }

    @keyframes chart-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .chart__error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      background: var(--color-neutral-white, #ffffff);
      color: var(--color-error-600, #dc2626);
    }

    .chart__error-icon {
      width: 48px;
      height: 48px;
    }

    .chart__error-text {
      font-size: var(--font-size-sm, 14px);
      text-align: center;
      max-width: 200px;
    }

    .chart__empty {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      background: var(--color-neutral-white, #ffffff);
      color: var(--color-neutral-gray500, #6b7280);
    }

    .chart__empty-icon {
      width: 48px;
      height: 48px;
    }

    .chart__empty-text {
      font-size: var(--font-size-sm, 14px);
      text-align: center;
      max-width: 200px;
    }

    .chart__footer {
      margin-top: var(--spacing-md, 16px);
      text-align: center;
    }

    .chart__footer-text {
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray500, #6b7280);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .chart-container {
        padding: var(--spacing-md, 16px);
      }

      .chart__header {
        margin-bottom: var(--spacing-md, 16px);
      }

      .chart__title {
        font-size: var(--font-size-base, 16px);
      }

      .chart__subtitle {
        font-size: var(--font-size-xs, 12px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() config: ChartConfig = {
    type: 'line',
    responsive: true,
    maintainAspectRatio: false,
    showLegend: true,
    showTooltip: true,
    showGrid: true,
    height: 300,
    animation: true
  };

  @Input() data!: ChartData;
  @Input() options?: ChartOptions;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() footer?: string;
  @Input() emptyMessage?: string;
  @Input() loading = false;
  @Input() error?: string;

  private chart: any;
  private resizeObserver?: ResizeObserver;

  width = 400;
  height = 300;

  ngAfterViewInit(): void {
    this.initializeChart();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
    if (changes['config'] && !changes['config'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initializeChart(): void {
    if (!this.data || !this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Set canvas size
    this.updateCanvasSize();

    // Create chart configuration
    const chartConfig = this.createChartConfig();

    // Import Chart.js dynamically (in a real app, you'd install it via npm)
    this.createChart(ctx, chartConfig);
  }

  private createChartConfig() {
    const defaultColors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(6, 182, 212, 0.8)',    // Cyan
      'rgba(234, 179, 8, 0.8)',    // Lime
    ];

    const colors = this.config.colors || defaultColors;

    return {
      type: this.config.type,
      data: {
        labels: this.data.labels,
        datasets: this.data.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || colors[index % colors.length],
          borderColor: dataset.borderColor || colors[index % colors.length].replace('0.8', '1'),
          borderWidth: dataset.borderWidth || 2,
          fill: this.config.type === 'area' ? 'start' : false,
        }))
      },
      options: {
        responsive: this.config.responsive,
        maintainAspectRatio: this.config.maintainAspectRatio,
        animation: this.config.animation ? {
          duration: 1000,
          easing: 'easeInOutQuart'
        } : false,
        plugins: {
          legend: {
            display: this.config.showLegend,
            position: 'top',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            enabled: this.config.showTooltip,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (context: any) => {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: this.config.type === 'pie' || this.config.type === 'doughnut' ? {} : {
          x: {
            display: true,
            grid: {
              display: this.config.showGrid,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: {
                size: 12
              }
            }
          },
          y: {
            display: true,
            grid: {
              display: this.config.showGrid,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: 'rgba(0, 0, 0, 0.7)',
              font: {
                size: 12
              }
            }
          }
        },
        ...this.options
      }
    };
  }

  private createChart(ctx: CanvasRenderingContext2D, config: any): void {
    // Note: In a real implementation, you would use Chart.js
    // For this demo, we'll create a simple canvas chart
    this.drawSimpleChart(ctx, config);
  }

  private drawSimpleChart(ctx: CanvasRenderingContext2D, config: any): void {
    const { width, height } = ctx.canvas;
    const { datasets, labels } = config.data;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!datasets || datasets.length === 0) return;

    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Draw chart based on type
    switch (config.type) {
      case 'line':
      case 'area':
        this.drawLineChart(ctx, datasets, labels, padding, chartWidth, chartHeight);
        break;
      case 'bar':
        this.drawBarChart(ctx, datasets, labels, padding, chartWidth, chartHeight);
        break;
      case 'pie':
      case 'doughnut':
        this.drawPieChart(ctx, datasets, padding, chartWidth, chartHeight);
        break;
      default:
        this.drawLineChart(ctx, datasets, labels, padding, chartWidth, chartHeight);
    }
  }

  private drawLineChart(
    ctx: CanvasRenderingContext2D,
    datasets: any[],
    labels: string[],
    padding: number,
    chartWidth: number,
    chartHeight: number
  ): void {
    // Simple line chart implementation
    ctx.save();

    // Draw axes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();

    // Draw datasets
    datasets.forEach((dataset, datasetIndex) => {
      if (!dataset.data || dataset.data.length === 0) return;

      const color = dataset.borderColor || `hsl(${datasetIndex * 60}, 70%, 50%)`;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      const stepX = chartWidth / (labels.length - 1 || 1);
      const maxY = Math.max(...dataset.data);

      ctx.beginPath();
      dataset.data.forEach((value: number, index: number) => {
        const x = padding + (index * stepX);
        const y = padding + chartHeight - ((value / maxY) * chartHeight);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points
      ctx.fillStyle = color;
      dataset.data.forEach((value: number, index: number) => {
        const x = padding + (index * stepX);
        const y = padding + chartHeight - ((value / maxY) * chartHeight);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  }

  private drawBarChart(
    ctx: CanvasRenderingContext2D,
    datasets: any[],
    labels: string[],
    padding: number,
    chartWidth: number,
    chartHeight: number
  ): void {
    // Simple bar chart implementation
    ctx.save();

    const barWidth = chartWidth / labels.length / datasets.length;
    const maxY = Math.max(...datasets.flatMap(d => d.data));

    datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.backgroundColor || `hsl(${datasetIndex * 60}, 70%, 50%)`;

      dataset.data.forEach((value: number, index: number) => {
        const x = padding + (index * datasets.length * barWidth) + (datasetIndex * barWidth);
        const y = padding + chartHeight - ((value / maxY) * chartHeight);
        const height = (value / maxY) * chartHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 2, height);
      });
    });

    ctx.restore();
  }

  private drawPieChart(
    ctx: CanvasRenderingContext2D,
    datasets: any[],
    padding: number,
    chartWidth: number,
    chartHeight: number
  ): void {
    // Simple pie chart implementation
    ctx.save();

    const centerX = padding + chartWidth / 2;
    const centerY = padding + chartHeight / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;

    if (datasets[0] && datasets[0].data) {
      const total = datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
      let currentAngle = 0;

      datasets[0].data.forEach((value: number, index: number) => {
        const sliceAngle = (value / total) * 2 * Math.PI;

        ctx.fillStyle = datasets[0].backgroundColor || `hsl(${index * 60}, 70%, 50%)`;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        currentAngle += sliceAngle;
      });
    }

    ctx.restore();
  }

  private updateCanvasSize(): void {
    const canvas = this.chartCanvas.nativeElement;
    const container = canvas.parentElement;

    if (container) {
      const rect = container.getBoundingClientRect();
      this.width = rect.width;
      this.height = this.config.height || 300;

      canvas.width = this.width;
      canvas.height = this.height;
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
        this.updateChart();
      });

      const container = this.chartCanvas.nativeElement.parentElement;
      if (container) {
        this.resizeObserver.observe(container);
      }
    }
  }

  private updateChart(): void {
    if (this.chart) {
      this.initializeChart();
    }
  }
}