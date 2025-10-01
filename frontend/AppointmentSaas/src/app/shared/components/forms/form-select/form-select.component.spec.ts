import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FormSelectComponent, SelectOption } from './form-select.component';

describe('FormSelectComponent', () => {
  let component: FormSelectComponent;
  let fixture: ComponentFixture<FormSelectComponent>;

  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2', disabled: true },
    { label: 'Option 3', value: 'opt3', icon: 'fas fa-check' },
    { label: 'Option 4', value: 'opt4', description: 'This is a description' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSelectComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormSelectComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.multiple).toBe(false);
    expect(component.config.searchable).toBe(false);
    expect(component.config.clearable).toBe(false);
    expect(component.config.disabled).toBe(false);
    expect(component.config.loading).toBe(false);
    expect(component.config.size).toBe('md');
    expect(component.config.variant).toBe('default');
    expect(component.config.allowCustom).toBe(false);
    expect(component.config.required).toBe(false);
  });

  it('should display label when provided', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.form-select__label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Test Label');
  });

  it('should show required asterisk when required is true', () => {
    component.label = 'Test Label';
    component.config.required = true;
    fixture.detectChanges();
    const required = fixture.nativeElement.querySelector('.form-select__required');
    expect(required).toBeTruthy();
    expect(required.textContent.trim()).toBe('*');
  });

  it('should display placeholder when no selection', () => {
    component.placeholder = 'Choose an option';
    fixture.detectChanges();
    const placeholder = fixture.nativeElement.querySelector('.form-select__placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent.trim()).toBe('Choose an option');
  });

  it('should display options when dropdown is open', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('.form-select__option');
    expect(options.length).toBe(4);
  });

  it('should filter options when searching', () => {
    component.config.searchable = true;
    component.isOpen = true;
    component.searchTerm = 'Option 1';
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.form-select__option');
    expect(options.length).toBe(1);
    expect(options[0].textContent.trim()).toContain('Option 1');
  });

  it('should select single option', () => {
    spyOn(component, 'writeValue');
    spyOn(component.selectionChange, 'emit');

    component.selectOption(mockOptions[0]);

    expect(component.selectedValue).toBe('opt1');
    expect(component.selectionChange.emit).toHaveBeenCalledWith('opt1');
  });

  it('should handle multiple selection', () => {
    component.config.multiple = true;
    spyOn(component, 'writeValue');
    spyOn(component.selectionChange, 'emit');

    component.selectOption(mockOptions[0]);
    component.selectOption(mockOptions[2]);

    expect(component.selectedValues).toEqual(['opt1', 'opt3']);
    expect(component.selectionChange.emit).toHaveBeenCalledWith(['opt1', 'opt3']);
  });

  it('should remove from multiple selection', () => {
    component.config.multiple = true;
    component.selectedValues = ['opt1', 'opt3'];
    spyOn(component, 'writeValue');
    spyOn(component.selectionChange, 'emit');

    component.removeFromSelection('opt1');

    expect(component.selectedValues).toEqual(['opt3']);
    expect(component.selectionChange.emit).toHaveBeenCalledWith(['opt3']);
  });

  it('should check if option is selected', () => {
    component.selectedValue = 'opt1';
    expect(component.isSelected(mockOptions[0])).toBe(true);
    expect(component.isSelected(mockOptions[1])).toBe(false);
  });

  it('should get selected option', () => {
    component.selectedValue = 'opt1';
    const selectedOption = component.getSelectedOption();
    expect(selectedOption).toEqual(mockOptions[0]);
  });

  it('should get option by value', () => {
    const option = component.getOptionByValue('opt2');
    expect(option).toEqual(mockOptions[1]);
  });

  it('should toggle dropdown', () => {
    expect(component.isOpen).toBe(false);
    component.toggleDropdown();
    expect(component.isOpen).toBe(true);
    component.toggleDropdown();
    expect(component.isOpen).toBe(false);
  });

  it('should not toggle dropdown when disabled', () => {
    component.config.disabled = true;
    component.isOpen = false;
    component.toggleDropdown();
    expect(component.isOpen).toBe(false);
  });

  it('should add custom value', () => {
    component.config.allowCustom = true;
    component.showCustomInput = true;
    component.customValue = 'Custom Option';
    spyOn(component, 'writeValue');
    spyOn(component.selectionChange, 'emit');

    component.addCustomValue();

    expect(component.options[4].label).toBe('Custom Option');
    expect(component.options[4].value).toBe('Custom Option');
    expect(component.selectedValue).toBe('Custom Option');
    expect(component.selectionChange.emit).toHaveBeenCalledWith('Custom Option');
  });

  it('should emit search change', () => {
    spyOn(component.searchChange, 'emit');
    component.searchTerm = 'test';
    component.onSearchInput();
    expect(component.searchChange.emit).toHaveBeenCalledWith('test');
  });

  it('should generate unique input id', () => {
    const id1 = component.inputId;
    const id2 = component.inputId;
    expect(id1).not.toBe(id2);
  });

  it('should check if has selection', () => {
    expect(component.hasSelection).toBe(false);

    component.selectedValue = 'opt1';
    expect(component.hasSelection).toBe(true);

    component.config.multiple = true;
    component.selectedValue = null;
    component.selectedValues = ['opt1'];
    expect(component.hasSelection).toBe(true);
  });

  it('should return filtered options', () => {
    expect(component.filteredOptions.length).toBe(4);

    component.searchTerm = 'Option 1';
    expect(component.filteredOptions.length).toBe(1);
    expect(component.filteredOptions[0].label).toBe('Option 1');
  });

  it('should handle ControlValueAccessor writeValue', () => {
    component.config.multiple = false;
    component.writeValue('opt1');
    expect(component.selectedValue).toBe('opt1');

    component.config.multiple = true;
    component.writeValue(['opt1', 'opt2']);
    expect(component.selectedValues).toEqual(['opt1', 'opt2']);
  });

  it('should handle ControlValueAccessor setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.config.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.config.disabled).toBe(false);
  });

  it('should have proper component structure', () => {
    const container = fixture.nativeElement.querySelector('.form-select');
    const value = fixture.nativeElement.querySelector('.form-select__value');

    expect(container).toBeTruthy();
    expect(value).toBeTruthy();
  });
});