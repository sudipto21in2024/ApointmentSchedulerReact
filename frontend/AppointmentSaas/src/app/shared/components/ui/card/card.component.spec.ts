import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.variant).toBe('elevated');
    expect(component.config.padding).toBe('md');
    expect(component.config.interactive).toBe(false);
    expect(component.config.disabled).toBe(false);
    expect(component.config.loading).toBe(false);
  });

  it('should apply correct CSS classes for elevated variant', () => {
    component.config.variant = 'elevated';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--elevated')).toBe(true);
  });

  it('should apply correct CSS classes for outlined variant', () => {
    component.config.variant = 'outlined';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--outlined')).toBe(true);
  });

  it('should apply interactive class when interactive is true', () => {
    component.config.interactive = true;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--interactive')).toBe(true);
  });

  it('should apply disabled class when disabled is true', () => {
    component.config.disabled = true;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--disabled')).toBe(true);
  });

  it('should apply loading class when loading is true', () => {
    component.config.loading = true;
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--loading')).toBe(true);
  });

  it('should apply correct padding classes', () => {
    component.config.padding = 'sm';
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.card');
    expect(element.classList.contains('card--padding-sm')).toBe(true);
  });
});