import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, CommonModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelElement.textContent).toContain('Test Label');
  });

  it('should display the placeholder', () => {
    component.placeholder = 'Enter text';
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.placeholder).toBe('Enter text');
  });

  it('should update value on input', () => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const testValue = 'hello world';
    inputElement.value = testValue;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value).toBe(testValue);
  });

  it('should show error message when control is invalid and touched/dirty', () => {
    component.control = new FormControl('', Validators.required);
    component.errorMessage = 'This field is required';
    fixture.detectChanges();

    component.control.markAsTouched();
    fixture.detectChanges();
    expect(component.hasError).toBeTrue();
    const errorElement = fixture.debugElement.query(By.css('.app-input-error')).nativeElement;
    expect(errorElement.textContent).toContain('This field is required');

    component.control.setValue('some value');
    fixture.detectChanges();
    expect(component.hasError).toBeFalse();
    expect(fixture.debugElement.query(By.css('.app-input-error'))).toBeNull();
  });

  it('should disable input when disabled is true', () => {
    component.disabled = true;
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputElement.disabled).toBeTrue();
  });
});