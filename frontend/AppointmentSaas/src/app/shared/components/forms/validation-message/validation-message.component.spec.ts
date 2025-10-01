import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message.component';

describe('ValidationMessageComponent', () => {
  let component: ValidationMessageComponent;
  let fixture: ComponentFixture<ValidationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.type).toBe('error');
    expect(component.showOnTouched).toBe(true);
    expect(component.showOnDirty).toBe(true);
  });

  it('should show message when custom message is provided', () => {
    component.message = 'Custom error message';
    fixture.detectChanges();
    expect(component.shouldShowMessage()).toBe(true);
  });

  it('should not show message when no control and no message', () => {
    component.control = null;
    component.message = '';
    fixture.detectChanges();
    expect(component.shouldShowMessage()).toBe(false);
  });

  it('should show message for control with errors when touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();
    expect(component.shouldShowMessage()).toBe(true);
  });

  it('should not show message for control with errors when not touched', () => {
    const control = new FormControl('', Validators.required);
    component.control = control;
    component.showOnTouched = true;
    fixture.detectChanges();
    expect(component.shouldShowMessage()).toBe(false);
  });

  it('should not show message for control with errors when not dirty', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    component.showOnDirty = true;
    fixture.detectChanges();
    expect(component.shouldShowMessage()).toBe(false);
  });

  it('should apply correct CSS classes for error type', () => {
    component.type = 'error';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.classList.contains('validation-message--error')).toBe(true);
  });

  it('should apply correct CSS classes for success type', () => {
    component.type = 'success';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.classList.contains('validation-message--success')).toBe(true);
  });

  it('should apply correct CSS classes for warning type', () => {
    component.type = 'warning';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.classList.contains('validation-message--warning')).toBe(true);
  });

  it('should apply correct CSS classes for info type', () => {
    component.type = 'info';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.classList.contains('validation-message--info')).toBe(true);
  });

  it('should display custom message', () => {
    component.message = 'Custom error message';
    fixture.detectChanges();
    const textElement = fixture.nativeElement.querySelector('.validation-message__text');
    expect(textElement.textContent.trim()).toBe('Custom error message');
  });

  it('should show icon when icon input is provided', () => {
    component.icon = '<svg>icon</svg>';
    component.message = 'Test message';
    fixture.detectChanges();
    const iconElement = fixture.nativeElement.querySelector('.validation-message__icon');
    expect(iconElement).toBeTruthy();
    expect(iconElement.innerHTML).toBe('<svg>icon</svg>');
  });

  it('should not show icon when icon input is not provided', () => {
    component.message = 'Test message';
    fixture.detectChanges();
    const iconElement = fixture.nativeElement.querySelector('.validation-message__icon');
    expect(iconElement).toBeFalsy();
  });

  it('should have correct ARIA attributes for error type', () => {
    component.type = 'error';
    component.message = 'Error message';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('aria-live')).toBe('polite');
  });

  it('should not have ARIA attributes for non-error types', () => {
    component.type = 'success';
    component.message = 'Success message';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.validation-message');
    expect(element.getAttribute('role')).toBeNull();
    expect(element.getAttribute('aria-live')).toBeNull();
  });
});