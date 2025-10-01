import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';
import { ChartData } from '../../types';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const mockChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 59, 80, 81, 56, 72],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Profit',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    component.data = mockChartData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.type).toBe('line');
    expect(component.config.responsive).toBe(true);
    expect(component.config.maintainAspectRatio).toBe(false);
    expect(component.config.showLegend).toBe(true);
    expect(component.config.showTooltip).toBe(true);
    expect(component.config.showGrid).toBe(true);
    expect(component.config.height).toBe(300);
    expect(component.config.animation).toBe(true);
  });

  it('should display title when provided', () => {
    component.title = 'Revenue Analytics';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.chart__title');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Revenue Analytics');
  });

  it('should display subtitle when provided', () => {
    component.subtitle = 'Monthly performance metrics';
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.chart__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent.trim()).toBe('Monthly performance metrics');
  });

  it('should display footer when provided', () => {
    component.footer = 'Data updated daily';
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.chart__footer');
    expect(footer).toBeTruthy();
    expect(footer.textContent.trim()).toBe('Data updated daily');
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('.chart__loading');
    expect(loading).toBeTruthy();
    expect(loading.textContent.trim()).toBe('Loading chart...');
  });

  it('should show error state', () => {
    component.error = 'Failed to load chart data';
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.chart__error');
    const errorText = fixture.nativeElement.querySelector('.chart__error-text');

    expect(error).toBeTruthy();
    expect(errorText.textContent.trim()).toBe('Failed to load chart data');
  });

  it('should show empty state when no data', () => {
    component.data = { labels: [], datasets: [] };
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.chart__empty');
    expect(empty).toBeTruthy();
  });

  it('should display custom empty message', () => {
    component.data = { labels: [], datasets: [] };
    component.emptyMessage = 'No analytics data available';
    fixture.detectChanges();

    const emptyText = fixture.nativeElement.querySelector('.chart__empty-text');
    expect(emptyText.textContent.trim()).toBe('No analytics data available');
  });

  it('should hide canvas when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('.chart__canvas');
    expect(canvas).toBeFalsy();
  });

  it('should hide canvas when error', () => {
    component.error = 'Error occurred';
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('.chart__canvas');
    expect(canvas).toBeFalsy();
  });

  it('should hide canvas when no data', () => {
    component.data = { labels: [], datasets: [] };
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('.chart__canvas');
    expect(canvas).toBeFalsy();
  });

  it('should show canvas when data is available', () => {
    const canvas = fixture.nativeElement.querySelector('.chart__canvas');
    expect(canvas).toBeTruthy();
  });

  it('should update chart when data changes', () => {
    spyOn(component as any, 'updateChart');

    const newData = { ...mockChartData, labels: ['Jul', 'Aug', 'Sep'] };
    component.data = newData;
    component.ngOnChanges({
      data: {
        currentValue: newData,
        previousValue: mockChartData,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect((component as any).updateChart).toHaveBeenCalled();
  });

  it('should update chart when config changes', () => {
    spyOn(component as any, 'updateChart');

    const newConfig = { ...component.config, type: 'bar' as const };
    component.config = newConfig;
    component.ngOnChanges({
      config: {
        currentValue: newConfig,
        previousValue: component.config,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect((component as any).updateChart).toHaveBeenCalled();
  });

  it('should set canvas dimensions', () => {
    component.config.height = 400;
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.chart__wrapper');
    expect(wrapper.style.height).toBe('400px');
  });

  it('should handle different chart types', () => {
    const chartTypes: Array<'line' | 'bar' | 'pie' | 'doughnut' | 'area'> = [
      'line', 'bar', 'pie', 'doughnut', 'area'
    ];

    chartTypes.forEach(type => {
      component.config.type = type;
      fixture.detectChanges();

      // Component should handle type change without errors
      expect(component.config.type).toBe(type);
    });
  });

  it('should have proper component structure', () => {
    const container = fixture.nativeElement.querySelector('.chart-container');
    const wrapper = fixture.nativeElement.querySelector('.chart__wrapper');
    const canvas = fixture.nativeElement.querySelector('.chart__canvas');

    expect(container).toBeTruthy();
    expect(wrapper).toBeTruthy();
    expect(canvas).toBeTruthy();
  });

  it('should handle missing data gracefully', () => {
    component.data = { labels: [], datasets: [] };
    fixture.detectChanges();

    // Should not throw errors
    expect(component).toBeTruthy();
  });

  it('should handle empty datasets gracefully', () => {
    component.data = { labels: ['Jan', 'Feb'], datasets: [] };
    fixture.detectChanges();

    // Should not throw errors
    expect(component).toBeTruthy();
  });
});