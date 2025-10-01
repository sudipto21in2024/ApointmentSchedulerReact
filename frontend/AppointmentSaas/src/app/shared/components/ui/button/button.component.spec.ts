import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.variant).toBe('primary');
    expect(component.config.size).toBe('md');
    expect(component.config.disabled).toBe(false);
    expect(component.config.loading).toBe(false);
    expect(component.config.block).toBe(false);
    expect(component.config.type).toBe('button');
  });

  it('should apply correct CSS classes for primary variant', () => {
    component.config.variant = 'primary';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.btn');
    expect(element.classList.contains('btn--primary')).toBe(true);
  });

  it('should apply correct CSS classes for secondary variant', () => {
    component.config.variant = 'secondary';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.btn');
    expect(element.classList.contains('btn--secondary')).toBe(true);
  });

  it('should apply correct size classes', () => {
    component.config.size = 'lg';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.btn');
    expect(element.classList.contains('btn--lg')).toBe(true);
  });

  it('should apply block class when block is true', () => {
    component.config.block = true;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.btn');
    expect(element.classList.contains('btn--block')).toBe(true);
  });

  it('should disable button when disabled is true', () => {
    component.config.disabled = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('should disable button when loading is true', () => {
    component.config.loading = true;
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('should show spinner when loading is true', () => {
    component.config.loading = true;
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.btn__spinner');
    expect(spinner).toBeTruthy();
  });

  it('should emit click event when button is clicked', () => {
    spyOn(component.onClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.onClick.emit).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', () => {
    component.config.disabled = true;
    spyOn(component.onClick, 'emit');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.onClick.emit).not.toHaveBeenCalled();
  });
});