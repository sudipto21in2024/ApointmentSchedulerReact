import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    component.title = 'Test Card Title';
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('.app-card-title')).nativeElement;
    expect(titleElement.textContent).toContain('Test Card Title');
  });

  it('should display the subtitle', () => {
    component.subtitle = 'Test Card Subtitle';
    fixture.detectChanges();
    const subtitleElement = fixture.debugElement.query(By.css('.app-card-subtitle')).nativeElement;
    expect(subtitleElement.textContent).toContain('Test Card Subtitle');
  });

  it('should apply elevation classes', () => {
    component.elevation = 'lg';
    fixture.detectChanges();
    const cardElement = fixture.debugElement.query(By.css('.app-card')).nativeElement;
    expect(cardElement.classList).toContain('app-card--elevation-lg');
  });

  it('should render ng-content', () => {
    const testContent = '<div>Inside Card</div>';
    TestBed.overrideTemplate(CardComponent, `
      <app-card>
        ${testContent}
      </app-card>
    `);
    fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();
    const cardContentElement = fixture.debugElement.query(By.css('.app-card-content')).nativeElement;
    expect(cardContentElement.textContent).toContain('Inside Card');
  });
});