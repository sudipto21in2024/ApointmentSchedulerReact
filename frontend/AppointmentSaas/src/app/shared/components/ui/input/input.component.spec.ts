import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.type).toBe('text');
    expect(component.config.variant).toBe('default');
    expect(component.config.size).toBe('md');
    expect(component.config.disabled).toBe(false);
    expect(component.config.readonly).toBe(false);
    expect(component.config.required).toBe(false);
  });

  it('should apply correct CSS classes for default variant', () => {
    component.config.variant = 'default';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input--default')).toBe(true);
  });

  it('should apply correct CSS classes for filled variant', () => {
    component.config.variant = 'filled';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input--filled')).toBe(true);
  });

  it('should apply correct size classes', () => {
    component.config.size = 'lg';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input--lg')).toBe(true);
  });

  it('should set input attributes correctly', () => {
    component.config.placeholder = 'Test placeholder';
    component.config.required = true;
    component.config.maxlength = 100;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.placeholder).toBe('Test placeholder');
    expect(input.required).toBe(true);
    expect(input.maxLength).toBe(100);
  });

  it('should emit valueChange when input value changes', () => {
    spyOn(component.valueChange, 'emit');
    const input = fixture.nativeElement.querySelector('input');

    input.value = 'test value';
    input.dispatchEvent(new Event('input'));

    expect(component.valueChange.emit).toHaveBeenCalledWith('test value');
  });

  it('should emit inputBlur when input loses focus', () => {
    spyOn(component.inputBlur, 'emit');
    const input = fixture.nativeElement.querySelector('input');

    input.dispatchEvent(new Event('blur'));

    expect(component.inputBlur.emit).toHaveBeenCalled();
  });

  it('should emit inputFocus when input gains focus', () => {
    spyOn(component.inputFocus, 'emit');
    const input = fixture.nativeElement.querySelector('input');

    input.dispatchEvent(new Event('focus'));

    expect(component.inputFocus.emit).toHaveBeenCalled();
  });

  it('should apply error class when error is true', () => {
    component.error = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input--error')).toBe(true);
  });

  it('should apply success class when success is true', () => {
    component.success = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('input--success')).toBe(true);
  });

  it('should disable input when disabled is true', () => {
    component.config.disabled = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('should set readonly when readonly is true', () => {
    component.config.readonly = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.readOnly).toBe(true);
  });
});