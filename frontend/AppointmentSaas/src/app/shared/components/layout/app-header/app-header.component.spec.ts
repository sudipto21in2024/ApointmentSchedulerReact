import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.showBreadcrumbs).toBe(true);
    expect(component.config.showUserMenu).toBe(true);
    expect(component.config.showNotifications).toBe(true);
  });

  it('should have default user properties', () => {
    expect(component.userName).toBe('User');
    expect(component.userRole).toBe('User');
    expect(component.userAvatar).toBeUndefined();
    expect(component.notificationCount).toBe(0);
  });

  it('should show breadcrumbs when configured and provided', () => {
    component.breadcrumbs = [
      { label: 'Home', route: '/home' },
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Current' }
    ];
    fixture.detectChanges();
    const breadcrumbs = fixture.nativeElement.querySelector('.app-header__breadcrumbs');
    expect(breadcrumbs).toBeTruthy();
  });

  it('should hide breadcrumbs when showBreadcrumbs is false', () => {
    component.config.showBreadcrumbs = false;
    component.breadcrumbs = [{ label: 'Test' }];
    fixture.detectChanges();
    const breadcrumbs = fixture.nativeElement.querySelector('.app-header__breadcrumbs');
    expect(breadcrumbs).toBeFalsy();
  });

  it('should show user menu by default', () => {
    const userMenu = fixture.nativeElement.querySelector('.app-header__user-menu');
    expect(userMenu).toBeTruthy();
  });

  it('should hide user menu when showUserMenu is false', () => {
    component.config.showUserMenu = false;
    fixture.detectChanges();
    const userMenu = fixture.nativeElement.querySelector('.app-header__user-menu');
    expect(userMenu).toBeFalsy();
  });

  it('should show notifications by default', () => {
    const notifications = fixture.nativeElement.querySelector('.app-header__notifications');
    expect(notifications).toBeTruthy();
  });

  it('should hide notifications when showNotifications is false', () => {
    component.config.showNotifications = false;
    fixture.detectChanges();
    const notifications = fixture.nativeElement.querySelector('.app-header__notifications');
    expect(notifications).toBeFalsy();
  });

  it('should display user initials when no avatar provided', () => {
    component.userName = 'John Doe';
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.app-header__user-initials');
    expect(initials).toBeTruthy();
    expect(initials.textContent.trim()).toBe('JD');
  });

  it('should display user avatar when provided', () => {
    component.userAvatar = '/assets/avatar.jpg';
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.app-header__user-image');
    expect(avatar).toBeTruthy();
    expect(avatar.src).toContain('/assets/avatar.jpg');
  });

  it('should show notification badge when count > 0', () => {
    component.notificationCount = 5;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.app-header__notification-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('5');
  });

  it('should show 99+ when notification count exceeds 99', () => {
    component.notificationCount = 150;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.app-header__notification-badge');
    expect(badge.textContent.trim()).toBe('99+');
  });

  it('should emit mobileMenuClick when mobile menu button is clicked', () => {
    spyOn(component.mobileMenuClick, 'emit');
    component.config.showUserMenu = true;
    fixture.detectChanges();

    const mobileMenuButton = fixture.nativeElement.querySelector('.app-header__mobile-menu');
    mobileMenuButton.click();

    expect(component.mobileMenuClick.emit).toHaveBeenCalled();
  });

  it('should emit notificationsClick when notifications button is clicked', () => {
    spyOn(component.notificationsClick, 'emit');
    fixture.detectChanges();

    const notificationsButton = fixture.nativeElement.querySelector('.app-header__notifications');
    notificationsButton.click();

    expect(component.notificationsClick.emit).toHaveBeenCalled();
  });

  it('should emit userMenuClick when user menu is clicked', () => {
    spyOn(component.userMenuClick, 'emit');
    fixture.detectChanges();

    const userMenu = fixture.nativeElement.querySelector('.app-header__user-menu');
    userMenu.click();

    expect(component.userMenuClick.emit).toHaveBeenCalled();
  });

  it('should have proper header structure', () => {
    const header = fixture.nativeElement.querySelector('.app-header');
    const content = fixture.nativeElement.querySelector('.app-header__content');
    const left = fixture.nativeElement.querySelector('.app-header__left');
    const right = fixture.nativeElement.querySelector('.app-header__right');

    expect(header).toBeTruthy();
    expect(content).toBeTruthy();
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();
  });
});