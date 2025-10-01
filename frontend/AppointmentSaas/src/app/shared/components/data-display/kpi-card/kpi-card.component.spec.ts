import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent, KpiData } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  const mockKpiData: KpiData = {
    value: 12345,
    label: 'Total Revenue',
    previousValue: 11000,
    unit: '$',
    format: 'currency',
    trend: 'up',
    trendValue: 12.5,
    icon: 'fas fa-dollar-sign',
    color: 'success'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    component.data = mockKpiData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.size).toBe('md');
    expect(component.config.variant).toBe('default');
    expect(component.config.showTrend).toBe(true);
    expect(component.config.showIcon).toBe(true);
    expect(component.config.showSparkline).toBe(false);
    expect(component.config.clickable).toBe(false);
    expect(component.config.loading).toBe(false);
  });

  it('should display KPI value', () => {
    const value = fixture.nativeElement.querySelector('.kpi-card__value');
    expect(value).toBeTruthy();
    expect(value.textContent.trim()).toContain('$12,345');
  });

  it('should display KPI label', () => {
    const label = fixture.nativeElement.querySelector('.kpi-card__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Total Revenue');
  });

  it('should display icon when provided', () => {
    const icon = fixture.nativeElement.querySelector('.kpi-card__icon');
    expect(icon).toBeTruthy();
    expect(icon.querySelector('i')).toBeTruthy();
  });

  it('should hide icon when showIcon is false', () => {
    component.config.showIcon = false;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.kpi-card__icon');
    expect(icon).toBeFalsy();
  });

  it('should display trend indicator when enabled', () => {
    const trend = fixture.nativeElement.querySelector('.kpi-card__trend');
    expect(trend).toBeTruthy();
  });

  it('should hide trend when showTrend is false', () => {
    component.config.showTrend = false;
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.kpi-card__trend');
    expect(trend).toBeFalsy();
  });

  it('should show correct trend direction', () => {
    const trendIndicator = fixture.nativeElement.querySelector('.kpi-card__trend');
    expect(trendIndicator).toBeTruthy();
    expect(trendIndicator.classList.contains('kpi-card__trend--up')).toBe(true);
  });

  it('should display trend value', () => {
    const trendNumber = fixture.nativeElement.querySelector('.kpi-card__trend-number');
    expect(trendNumber).toBeTruthy();
    expect(trendNumber.textContent.trim()).toBe('+12.5');
  });

  it('should show loading state', () => {
    component.config.loading = true;
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('.kpi-card__loading');
    expect(loading).toBeTruthy();
  });

  it('should hide content when loading', () => {
    component.config.loading = true;
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.kpi-card__content');
    expect(content).toBeFalsy();
  });

  it('should show click indicator when clickable', () => {
    component.config.clickable = true;
    fixture.detectChanges();

    const clickIndicator = fixture.nativeElement.querySelector('.kpi-card__click-indicator');
    expect(clickIndicator).toBeTruthy();
  });

  it('should hide click indicator when not clickable', () => {
    const clickIndicator = fixture.nativeElement.querySelector('.kpi-card__click-indicator');
    expect(clickIndicator).toBeFalsy();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatValue(12345);
    expect(formatted).toBe('$12,345');
  });

  it('should format percentage correctly', () => {
    component.data.format = 'percentage';
    component.data.value = 25.5;
    const formatted = component.formatValue(25.5);
    expect(formatted).toBe('25.5%');
  });

  it('should format duration correctly', () => {
    component.data.format = 'duration';
    const formatted = component.formatValue(125);
    expect(formatted).toBe('2h 5m');
  });

  it('should format regular number correctly', () => {
    component.data.format = undefined;
    const formatted = component.formatValue(12345.67);
    expect(formatted).toBe('12,345.7');
  });

  it('should format trend value correctly', () => {
    expect(component.formatTrendValue(12.5)).toBe('+12.5');
    expect(component.formatTrendValue(-5.2)).toBe('-5.2');
    expect(component.formatTrendValue(0)).toBe('+0.0');
  });

  it('should generate sparkline points', () => {
    component.sparklineData = [10, 20, 15, 25, 30];
    const points = component.generateSparklinePoints();
    expect(points).toContain('0,');
    expect(points).toContain('100,');
  });

  it('should handle empty sparkline data', () => {
    component.sparklineData = [];
    const points = component.generateSparklinePoints();
    expect(points).toBe('');
  });

  it('should apply size variants', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      component.config.size = size;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.kpi-card');
      expect(card.classList.contains(`kpi-card--${size}`)).toBe(true);
    });
  });

  it('should apply variant styles', () => {
    const variants: Array<'default' | 'outlined' | 'filled'> = ['default', 'outlined', 'filled'];

    variants.forEach(variant => {
      component.config.variant = variant;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.kpi-card');
      expect(card.classList.contains(`kpi-card--${variant}`)).toBe(true);
    });
  });

  it('should apply color variants', () => {
    const colors: Array<'primary' | 'success' | 'warning' | 'error' | 'info'> = [
      'primary', 'success', 'warning', 'error', 'info'
    ];

    colors.forEach(color => {
      component.data.color = color;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.kpi-card');
      expect(card.classList.contains(`kpi-card--${color}`)).toBe(true);
    });
  });

  it('should handle card click when clickable', () => {
    spyOn(console, 'log');
    component.config.clickable = true;
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.kpi-card');
    card.click();

    expect(console.log).toHaveBeenCalledWith('KPI Card clicked:', 'Total Revenue');
  });

  it('should handle string values', () => {
    component.data.value = 'Active';
    component.data.format = undefined;
    const formatted = component.formatValue('Active');
    expect(formatted).toBe('Active');
  });

  it('should have proper component structure', () => {
    const card = fixture.nativeElement.querySelector('.kpi-card');
    const content = fixture.nativeElement.querySelector('.kpi-card__content');
    const value = fixture.nativeElement.querySelector('.kpi-card__value');
    const label = fixture.nativeElement.querySelector('.kpi-card__label');

    expect(card).toBeTruthy();
    expect(content).toBeTruthy();
    expect(value).toBeTruthy();
    expect(label).toBeTruthy();
  });
});