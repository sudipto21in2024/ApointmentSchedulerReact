import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.size).toBe('md');
    expect(component.config.closable).toBe(true);
    expect(component.config.maskClosable).toBe(true);
    expect(component.config.showCloseButton).toBe(true);
    expect(component.config.centered).toBe(true);
    expect(component.config.destroyOnClose).toBe(false);
  });

  it('should not be visible by default', () => {
    expect(component.visible).toBe(false);
  });

  it('should apply correct modal classes for size', () => {
    component.config.size = 'lg';
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal.classList.contains('modal--lg')).toBe(true);
  });

  it('should show header when title is provided', () => {
    component.title = 'Test Modal';
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.modal__header');
    expect(header).toBeTruthy();
  });

  it('should show close button when closable and showCloseButton are true', () => {
    component.title = 'Test Modal';
    component.config.closable = true;
    component.config.showCloseButton = true;
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.modal__close');
    expect(closeButton).toBeTruthy();
  });

  it('should not show close button when closable is false', () => {
    component.title = 'Test Modal';
    component.config.closable = false;
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.modal__close');
    expect(closeButton).toBeFalsy();
  });

  it('should show footer when showFooter is true', () => {
    component.showFooter = true;
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.modal__footer');
    expect(footer).toBeTruthy();
  });

  it('should emit onClose when close method is called', () => {
    spyOn(component.onClose, 'emit');
    component.close();
    expect(component.onClose.emit).toHaveBeenCalled();
  });

  it('should emit visibleChange when close method is called', () => {
    spyOn(component.visibleChange, 'emit');
    component.visible = true;
    component.close();
    expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
  });

  it('should not close when closable is false', () => {
    spyOn(component.visibleChange, 'emit');
    component.config.closable = false;
    component.visible = true;
    component.close();
    expect(component.visibleChange.emit).not.toHaveBeenCalled();
  });

  it('should emit onOpen when visible becomes true', () => {
    spyOn(component.onOpen, 'emit');
    component.visible = true;
    component.ngOnChanges();
    expect(component.onOpen.emit).toHaveBeenCalled();
  });

  it('should emit onClose when visible becomes false', () => {
    spyOn(component.onClose, 'emit');
    component.visible = false;
    component.ngOnChanges();
    expect(component.onClose.emit).toHaveBeenCalled();
  });

  it('should handle overlay click when maskClosable is true', () => {
    spyOn(component, 'close');
    component.config.maskClosable = true;
    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', {
      value: fixture.nativeElement.querySelector('.modal-overlay'),
      writable: true
    });
    Object.defineProperty(mockEvent, 'currentTarget', {
      value: fixture.nativeElement.querySelector('.modal-overlay'),
      writable: true
    });
    component.onOverlayClick(mockEvent);
    expect(component.close).toHaveBeenCalled();
  });

  it('should not handle overlay click when maskClosable is false', () => {
    spyOn(component, 'close');
    component.config.maskClosable = false;
    const mockEvent = new Event('click');
    Object.defineProperty(mockEvent, 'target', {
      value: fixture.nativeElement.querySelector('.modal-overlay'),
      writable: true
    });
    Object.defineProperty(mockEvent, 'currentTarget', {
      value: fixture.nativeElement.querySelector('.modal-overlay'),
      writable: true
    });
    component.onOverlayClick(mockEvent);
    expect(component.close).not.toHaveBeenCalled();
  });
});