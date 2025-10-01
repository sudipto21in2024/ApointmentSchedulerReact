import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbItem } from '../../types';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  const mockItems: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Services', route: '/services', icon: 'fas fa-cogs' },
    { label: 'Service Details', route: '/services/123' },
    { label: 'Current Page' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    component.items = mockItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.separator).toBe('/');
    expect(component.config.showHome).toBe(true);
    expect(component.config.maxItems).toBe(5);
    expect(component.config.size).toBe('md');
    expect(component.config.variant).toBe('default');
  });

  it('should display home breadcrumb when enabled', () => {
    const homeLink = fixture.nativeElement.querySelector('.breadcrumb__link--home');
    expect(homeLink).toBeTruthy();
  });

  it('should hide home breadcrumb when disabled', () => {
    component.config.showHome = false;
    fixture.detectChanges();

    const homeLink = fixture.nativeElement.querySelector('.breadcrumb__link--home');
    expect(homeLink).toBeFalsy();
  });

  it('should display all items when within maxItems limit', () => {
    component.config.maxItems = 10;
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('.breadcrumb__link');
    const current = fixture.nativeElement.querySelector('.breadcrumb__current');

    expect(links.length).toBe(4); // 3 route links + 1 home
    expect(current).toBeTruthy();
    expect(current.textContent.trim()).toBe('Current Page');
  });

  it('should show dropdown when items exceed maxItems', () => {
    component.config.maxItems = 3;
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.breadcrumb__dropdown');
    expect(dropdown).toBeTruthy();
  });

  it('should hide dropdown when items within maxItems limit', () => {
    component.config.maxItems = 10;
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('.breadcrumb__dropdown');
    expect(dropdown).toBeFalsy();
  });

  it('should display correct visible items when truncated', () => {
    component.config.maxItems = 3;
    fixture.detectChanges();

    const visibleItems = component.visibleItems;
    expect(visibleItems.length).toBe(3);
    expect(visibleItems[0].label).toBe('Dashboard');
    expect(visibleItems[2].label).toBe('Current Page');
  });

  it('should return correct hidden items', () => {
    component.config.maxItems = 3;
    fixture.detectChanges();

    const hiddenItems = component.hiddenItems;
    expect(hiddenItems.length).toBe(1);
    expect(hiddenItems[0].label).toBe('Services');
  });

  it('should toggle dropdown when button clicked', () => {
    component.config.maxItems = 3;
    fixture.detectChanges();

    expect(component.dropdownOpen).toBe(false);

    const dropdownBtn = fixture.nativeElement.querySelector('.breadcrumb__dropdown-btn');
    dropdownBtn.click();

    expect(component.dropdownOpen).toBe(true);

    dropdownBtn.click();
    expect(component.dropdownOpen).toBe(false);
  });

  it('should close dropdown when item clicked', () => {
    component.config.maxItems = 3;
    component.dropdownOpen = true;
    fixture.detectChanges();

    const dropdownItem = fixture.nativeElement.querySelector('.breadcrumb__dropdown-item');
    dropdownItem.click();

    expect(component.dropdownOpen).toBe(false);
  });

  it('should display icons when provided', () => {
    const icons = fixture.nativeElement.querySelectorAll('.breadcrumb__icon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should display custom separator', () => {
    component.config.separator = '>';
    fixture.detectChanges();

    const separator = fixture.nativeElement.querySelector('.breadcrumb__separator-text');
    expect(separator.textContent.trim()).toBe('>');
  });

  it('should apply size variants', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      component.config.size = size;
      fixture.detectChanges();

      const breadcrumb = fixture.nativeElement.querySelector('.breadcrumb');
      expect(breadcrumb.classList.contains(`breadcrumb--${size}`)).toBe(true);
    });
  });

  it('should apply variant styles', () => {
    component.config.variant = 'compact';
    fixture.detectChanges();

    const breadcrumb = fixture.nativeElement.querySelector('.breadcrumb');
    expect(breadcrumb.classList.contains('breadcrumb--compact')).toBe(true);
  });

  it('should show current page as non-link', () => {
    const current = fixture.nativeElement.querySelector('.breadcrumb__current');
    expect(current).toBeTruthy();
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.querySelector('a')).toBeFalsy(); // Should not be a link
  });

  it('should handle empty items array', () => {
    component.items = [];
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.breadcrumb__list');
    expect(list).toBeTruthy();
    expect(list.children.length).toBe(1); // Only home item
  });

  it('should handle single item', () => {
    component.items = [{ label: 'Single Page' }];
    fixture.detectChanges();

    const current = fixture.nativeElement.querySelector('.breadcrumb__current');
    expect(current).toBeTruthy();
    expect(current.textContent.trim()).toBe('Single Page');
  });

  it('should display home icon when enabled', () => {
    const homeIcon = fixture.nativeElement.querySelector('.breadcrumb__link--home svg');
    expect(homeIcon).toBeTruthy();
  });

  it('should hide home icon when disabled', () => {
    component.homeIcon = false;
    fixture.detectChanges();

    const homeIcon = fixture.nativeElement.querySelector('.breadcrumb__link--home svg');
    expect(homeIcon).toBeFalsy();
  });

  it('should have proper navigation structure', () => {
    const nav = fixture.nativeElement.querySelector('.breadcrumb');
    const list = fixture.nativeElement.querySelector('.breadcrumb__list');

    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb navigation');
    expect(list).toBeTruthy();
  });

  it('should handle dropdown menu visibility', () => {
    component.config.maxItems = 3;
    component.dropdownOpen = true;
    fixture.detectChanges();

    const dropdownMenu = fixture.nativeElement.querySelector('.breadcrumb__dropdown-menu');
    expect(dropdownMenu).toBeTruthy();
  });
});