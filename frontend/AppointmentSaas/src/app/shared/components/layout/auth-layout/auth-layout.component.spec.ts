import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.showHeader).toBe(false);
    expect(component.config.showFooter).toBe(false);
    expect(component.config.backgroundImage).toBeUndefined();
  });

  it('should show content card by default', () => {
    const contentCard = fixture.nativeElement.querySelector('.auth-layout__content-card');
    expect(contentCard).toBeTruthy();
  });

  it('should show header when showHeader is true', () => {
    component.config.showHeader = true;
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.auth-layout__header');
    expect(header).toBeTruthy();
  });

  it('should hide header by default', () => {
    const header = fixture.nativeElement.querySelector('.auth-layout__header');
    expect(header).toBeFalsy();
  });

  it('should show footer when showFooter is true', () => {
    component.config.showFooter = true;
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.auth-layout__footer');
    expect(footer).toBeTruthy();
  });

  it('should hide footer by default', () => {
    const footer = fixture.nativeElement.querySelector('.auth-layout__footer');
    expect(footer).toBeFalsy();
  });

  it('should apply background image when provided', () => {
    component.config.backgroundImage = '/assets/images/auth-bg.jpg';
    fixture.detectChanges();
    const layout = fixture.nativeElement.querySelector('.auth-layout');
    expect(layout.style.backgroundImage).toContain('/assets/images/auth-bg.jpg');
  });

  it('should have proper layout structure', () => {
    const layout = fixture.nativeElement.querySelector('.auth-layout');
    const main = fixture.nativeElement.querySelector('.auth-layout__main');
    const contentCard = fixture.nativeElement.querySelector('.auth-layout__content-card');

    expect(layout).toBeTruthy();
    expect(main).toBeTruthy();
    expect(contentCard).toBeTruthy();
  });
});