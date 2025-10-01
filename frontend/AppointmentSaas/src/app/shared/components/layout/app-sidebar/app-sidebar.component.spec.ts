import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppSidebarComponent, SidebarMenuItem } from './app-sidebar.component';

describe('AppSidebarComponent', () => {
  let component: AppSidebarComponent;
  let fixture: ComponentFixture<AppSidebarComponent>;

  const mockMenuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/dashboard'
    },
    {
      label: 'Services',
      icon: 'fas fa-cogs',
      route: '/services',
      children: [
        { label: 'All Services', route: '/services' },
        { label: 'Categories', route: '/services/categories' }
      ]
    },
    {
      label: 'Bookings',
      icon: 'fas fa-calendar-check',
      route: '/bookings',
      badge: 5
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSidebarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.collapsible).toBe(true);
    expect(component.config.collapsed).toBe(false);
    expect(component.config.showMobileMenu).toBe(true);
    expect(component.config.mobileMenuOpen).toBe(false);
  });

  it('should have default properties', () => {
    expect(component.appName).toBe('Appointment SaaS');
    expect(component.userName).toBe('User');
    expect(component.userRole).toBe('User');
    expect(component.menuItems).toEqual([]);
  });

  it('should display app name when not collapsed', () => {
    component.config.collapsed = false;
    fixture.detectChanges();
    const appName = fixture.nativeElement.querySelector('.app-sidebar__app-name');
    expect(appName).toBeTruthy();
    expect(appName.textContent.trim()).toBe('Appointment SaaS');
  });

  it('should hide app name when collapsed', () => {
    component.config.collapsed = true;
    fixture.detectChanges();
    const appName = fixture.nativeElement.querySelector('.app-sidebar__app-name');
    expect(appName).toBeFalsy();
  });

  it('should show collapse button when collapsible is true', () => {
    component.config.collapsible = true;
    fixture.detectChanges();
    const collapseBtn = fixture.nativeElement.querySelector('.app-sidebar__collapse-btn');
    expect(collapseBtn).toBeTruthy();
  });

  it('should hide collapse button when collapsible is false', () => {
    component.config.collapsible = false;
    fixture.detectChanges();
    const collapseBtn = fixture.nativeElement.querySelector('.app-sidebar__collapse-btn');
    expect(collapseBtn).toBeFalsy();
  });

  it('should display menu items', () => {
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('.app-sidebar__menu-item');
    expect(menuItems.length).toBe(3);
  });

  it('should display menu item with children', () => {
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
    const menuToggle = fixture.nativeElement.querySelector('.app-sidebar__menu-toggle');
    expect(menuToggle).toBeTruthy();
  });

  it('should display menu item badge', () => {
    component.menuItems = mockMenuItems;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.app-sidebar__menu-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('5');
  });

  it('should toggle menu group expansion', () => {
    component.menuItems = mockMenuItems;
    const menuItem = component.menuItems[1]; // Services item with children
    expect(menuItem.expanded).toBeUndefined();

    component.toggleMenuGroup(1);
    expect(menuItem.expanded).toBe(true);

    component.toggleMenuGroup(1);
    expect(menuItem.expanded).toBe(false);
  });

  it('should emit toggleCollapse when collapse button is clicked', () => {
    spyOn(component.toggleCollapse, 'emit');
    fixture.detectChanges();

    const collapseBtn = fixture.nativeElement.querySelector('.app-sidebar__collapse-btn');
    collapseBtn.click();

    expect(component.toggleCollapse.emit).toHaveBeenCalled();
  });

  it('should emit mobileMenuClose when mobile menu close is called', () => {
    spyOn(component.mobileMenuClose, 'emit');
    component.onMobileMenuClose();
    expect(component.mobileMenuClose.emit).toHaveBeenCalled();
  });

  it('should generate correct app initials', () => {
    expect(component.getAppInitials()).toBe('AS');
    component.appName = 'My Application';
    expect(component.getAppInitials()).toBe('MA');
  });

  it('should generate correct user initials', () => {
    expect(component.getUserInitials()).toBe('US');
    component.userName = 'John Doe';
    expect(component.getUserInitials()).toBe('JD');
  });

  it('should apply collapsed class when collapsed', () => {
    component.config.collapsed = true;
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.app-sidebar');
    expect(sidebar.classList.contains('app-sidebar--collapsed')).toBe(true);
  });

  it('should have proper sidebar structure', () => {
    const sidebar = fixture.nativeElement.querySelector('.app-sidebar');
    const header = fixture.nativeElement.querySelector('.app-sidebar__header');
    const nav = fixture.nativeElement.querySelector('.app-sidebar__nav');
    const footer = fixture.nativeElement.querySelector('.app-sidebar__footer');

    expect(sidebar).toBeTruthy();
    expect(header).toBeTruthy();
    expect(nav).toBeTruthy();
    expect(footer).toBeTruthy();
  });
});