import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.showSidebar).toBe(true);
    expect(component.config.showFooter).toBe(true);
    expect(component.config.sidebarCollapsed).toBe(false);
  });

  it('should show sidebar by default', () => {
    const sidebar = fixture.nativeElement.querySelector('.main-layout__sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should show footer by default', () => {
    const footer = fixture.nativeElement.querySelector('.main-layout__footer');
    expect(footer).toBeTruthy();
  });

  it('should hide sidebar when showSidebar is false', () => {
    component.config.showSidebar = false;
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.main-layout__sidebar');
    expect(sidebar).toBeFalsy();
  });

  it('should hide footer when showFooter is false', () => {
    component.config.showFooter = false;
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.main-layout__footer');
    expect(footer).toBeFalsy();
  });

  it('should apply collapsed class when sidebar is collapsed', () => {
    component.config.sidebarCollapsed = true;
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.main-layout__sidebar');
    expect(sidebar.classList.contains('main-layout__sidebar--collapsed')).toBe(true);
  });

  it('should have proper layout structure', () => {
    const layout = fixture.nativeElement.querySelector('.main-layout');
    const header = fixture.nativeElement.querySelector('.main-layout__header');
    const content = fixture.nativeElement.querySelector('.main-layout__content');
    const main = fixture.nativeElement.querySelector('.main-layout__main');

    expect(layout).toBeTruthy();
    expect(header).toBeTruthy();
    expect(content).toBeTruthy();
    expect(main).toBeTruthy();
  });
});