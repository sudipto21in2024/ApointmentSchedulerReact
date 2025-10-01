import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppFooterComponent, FooterSection } from './app-footer.component';

describe('AppFooterComponent', () => {
  let component: AppFooterComponent;
  let fixture: ComponentFixture<AppFooterComponent>;

  const mockSections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', url: '/features' },
        { label: 'Pricing', url: '/pricing' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', url: '/help' },
        { label: 'Contact', url: '/contact' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.showSocialLinks).toBe(true);
    expect(component.config.showCopyright).toBe(true);
    expect(component.config.sticky).toBe(false);
  });

  it('should have default properties', () => {
    expect(component.companyName).toBe('Appointment SaaS');
    expect(component.description).toBe('Streamline your appointment scheduling with our comprehensive SaaS solution.');
    expect(component.sections.length).toBe(4); // Default sections
    expect(component.socialLinks.length).toBe(3); // Default social links
  });

  it('should display company name', () => {
    const companyName = fixture.nativeElement.querySelector('.app-footer__company-name');
    expect(companyName).toBeTruthy();
    expect(companyName.textContent.trim()).toBe('Appointment SaaS');
  });

  it('should display description', () => {
    const description = fixture.nativeElement.querySelector('.app-footer__description');
    expect(description).toBeTruthy();
    expect(description.textContent.trim()).toBe('Streamline your appointment scheduling with our comprehensive SaaS solution.');
  });

  it('should hide company name and description when sticky', () => {
    component.config.sticky = true;
    fixture.detectChanges();

    const companyName = fixture.nativeElement.querySelector('.app-footer__company-name');
    const description = fixture.nativeElement.querySelector('.app-footer__description');

    expect(companyName).toBeFalsy();
    expect(description).toBeFalsy();
  });

  it('should display footer sections', () => {
    component.sections = mockSections;
    fixture.detectChanges();

    const sectionTitles = fixture.nativeElement.querySelectorAll('.app-footer__section-title');
    expect(sectionTitles.length).toBe(2);
    expect(sectionTitles[0].textContent.trim()).toBe('Product');
    expect(sectionTitles[1].textContent.trim()).toBe('Support');
  });

  it('should display footer links', () => {
    component.sections = mockSections;
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('.app-footer__link');
    expect(links.length).toBe(4); // 2 sections × 2 links each
  });

  it('should display external link icons for external links', () => {
    component.sections = [{
      title: 'Social',
      links: [{ label: 'External Link', url: 'https://example.com', external: true }]
    }];
    fixture.detectChanges();

    const externalIcon = fixture.nativeElement.querySelector('.app-footer__external-icon');
    expect(externalIcon).toBeTruthy();
  });

  it('should show copyright by default', () => {
    const copyright = fixture.nativeElement.querySelector('.app-footer__copyright');
    expect(copyright).toBeTruthy();
  });

  it('should hide copyright when showCopyright is false', () => {
    component.config.showCopyright = false;
    fixture.detectChanges();

    const copyright = fixture.nativeElement.querySelector('.app-footer__copyright');
    expect(copyright).toBeFalsy();
  });

  it('should show social links by default', () => {
    const socialLinks = fixture.nativeElement.querySelector('.app-footer__social');
    expect(socialLinks).toBeTruthy();
  });

  it('should hide social links when showSocialLinks is false', () => {
    component.config.showSocialLinks = false;
    fixture.detectChanges();

    const socialLinks = fixture.nativeElement.querySelector('.app-footer__social');
    expect(socialLinks).toBeFalsy();
  });

  it('should display current year in copyright', () => {
    const currentYear = new Date().getFullYear();
    const copyrightText = fixture.nativeElement.querySelector('.app-footer__copyright-text');
    expect(copyrightText.textContent.trim()).toContain(currentYear.toString());
  });

  it('should apply sticky class when sticky is true', () => {
    component.config.sticky = true;
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.app-footer');
    expect(footer.classList.contains('app-footer--sticky')).toBe(true);
  });

  it('should generate correct company initials', () => {
    expect(component.getCompanyInitials()).toBe('AS');
    component.companyName = 'Test Company Name';
    expect(component.getCompanyInitials()).toBe('TC');
  });

  it('should have proper footer structure', () => {
    const footer = fixture.nativeElement.querySelector('.app-footer');
    const content = fixture.nativeElement.querySelector('.app-footer__content');
    const main = fixture.nativeElement.querySelector('.app-footer__main');
    const bottom = fixture.nativeElement.querySelector('.app-footer__bottom');

    expect(footer).toBeTruthy();
    expect(content).toBeTruthy();
    expect(main).toBeTruthy();
    expect(bottom).toBeTruthy();
  });
});