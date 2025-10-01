import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FooterLink {
  label: string;
  url?: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface AppFooterConfig {
  showSocialLinks?: boolean;
  showCopyright?: boolean;
  sticky?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="app-footer" [class.app-footer--sticky]="config.sticky">
      <div class="app-footer__content">
        <!-- Main Footer Content -->
        <div class="app-footer__main">
          <!-- Company Info -->
          <div class="app-footer__section">
            <div class="app-footer__logo">
              <img
                *ngIf="logoUrl"
                [src]="logoUrl"
                [alt]="companyName"
                class="app-footer__logo-image"
              />
              <div
                *ngIf="!logoUrl"
                class="app-footer__logo-placeholder"
              >
                {{ getCompanyInitials() }}
              </div>
            </div>
            <h3 *ngIf="!config.sticky" class="app-footer__company-name">{{ companyName }}</h3>
            <p *ngIf="description && !config.sticky" class="app-footer__description">
              {{ description }}
            </p>
          </div>

          <!-- Footer Links -->
          <div class="app-footer__sections">
            <div
              *ngFor="let section of sections"
              class="app-footer__section"
            >
              <h4 class="app-footer__section-title">{{ section.title }}</h4>
              <ul class="app-footer__links">
                <li
                  *ngFor="let link of section.links"
                  class="app-footer__link-item"
                >
                  <a
                    *ngIf="link.url"
                    [href]="link.url"
                    [target]="link.external ? '_blank' : '_self'"
                    [rel]="link.external ? 'noopener noreferrer' : ''"
                    class="app-footer__link"
                  >
                    {{ link.label }}
                    <svg
                      *ngIf="link.external"
                      class="app-footer__external-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                  <span *ngIf="!link.url" class="app-footer__link-text">{{ link.label }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="app-footer__bottom">
          <div class="app-footer__bottom-content">
            <!-- Copyright -->
            <div *ngIf="config.showCopyright !== false" class="app-footer__copyright">
              <span class="app-footer__copyright-text">
                © {{ currentYear }} {{ companyName }}. All rights reserved.
              </span>
            </div>

            <!-- Social Links -->
            <div *ngIf="config.showSocialLinks !== false" class="app-footer__social">
              <a
                *ngFor="let socialLink of socialLinks"
                [href]="socialLink.url"
                target="_blank"
                rel="noopener noreferrer"
                class="app-footer__social-link"
                [attr.aria-label]="socialLink.label"
              >
                <i [class]="socialLink.icon"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--color-neutral-gray900, #111827);
      color: var(--color-neutral-gray300, #d1d5db);
      padding: var(--spacing-xl, 32px) 0 var(--spacing-lg, 24px) 0;
    }

    .app-footer--sticky {
      position: sticky;
      bottom: 0;
      z-index: var(--z-footer, 10);
      padding: var(--spacing-lg, 24px) 0;
    }

    .app-footer__content {
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--spacing-lg, 24px);
    }

    .app-footer__main {
      display: grid;
      gap: var(--spacing-xl, 32px);
      margin-bottom: var(--spacing-lg, 24px);
    }

    .app-footer__section {
      display: flex;
      flex-direction: column;
    }

    .app-footer__logo {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-sm, 4px);
      overflow: hidden;
      margin-bottom: var(--spacing-md, 16px);
    }

    .app-footer__logo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .app-footer__logo-placeholder {
      width: 100%;
      height: 100%;
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-semibold, 600);
    }

    .app-footer__company-name {
      margin: 0 0 var(--spacing-sm, 8px) 0;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-white, #ffffff);
    }

    .app-footer__description {
      margin: 0;
      font-size: var(--font-size-sm, 14px);
      line-height: 1.6;
      color: var(--color-neutral-gray400, #9ca3af);
      max-width: 320px;
    }

    .app-footer__sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-xl, 32px);
    }

    .app-footer__section-title {
      margin: 0 0 var(--spacing-md, 16px) 0;
      font-size: var(--font-size-base, 16px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-white, #ffffff);
    }

    .app-footer__links {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .app-footer__link-item {
      margin-bottom: var(--spacing-sm, 8px);
    }

    .app-footer__link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      color: var(--color-neutral-gray300, #d1d5db);
      text-decoration: none;
      font-size: var(--font-size-sm, 14px);
      transition: var(--transition-normal, 0.2s ease);
      padding: var(--spacing-xs, 4px) 0;
    }

    .app-footer__link:hover {
      color: var(--color-neutral-white, #ffffff);
      text-decoration: underline;
    }

    .app-footer__link-text {
      color: var(--color-neutral-gray400, #9ca3af);
      font-size: var(--font-size-sm, 14px);
    }

    .app-footer__external-icon {
      width: 12px;
      height: 12px;
      opacity: 0.7;
    }

    .app-footer__bottom {
      border-top: 1px solid var(--color-neutral-gray700, #374151);
      padding-top: var(--spacing-lg, 24px);
    }

    .app-footer__bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md, 16px);
    }

    .app-footer__copyright {
      flex: 1;
    }

    .app-footer__copyright-text {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray400, #9ca3af);
    }

    .app-footer__social {
      display: flex;
      gap: var(--spacing-sm, 8px);
    }

    .app-footer__social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--color-neutral-gray800, #1f2937);
      border-radius: var(--border-radius-full, 9999px);
      color: var(--color-neutral-gray400, #9ca3af);
      text-decoration: none;
      transition: var(--transition-normal, 0.2s ease);
    }

    .app-footer__social-link:hover {
      background: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .app-footer {
        padding: var(--spacing-lg, 24px) 0;
      }

      .app-footer__content {
        padding: 0 var(--spacing-md, 16px);
      }

      .app-footer__main {
        gap: var(--spacing-lg, 24px);
        margin-bottom: var(--spacing-md, 16px);
      }

      .app-footer__sections {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-lg, 24px);
      }

      .app-footer__bottom-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm, 8px);
      }

      .app-footer__bottom {
        padding-top: var(--spacing-md, 16px);
      }
    }

    @media (max-width: 480px) {
      .app-footer__sections {
        grid-template-columns: 1fr;
        gap: var(--spacing-md, 16px);
      }

      .app-footer__social {
        justify-content: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooterComponent {
  @Input() config: AppFooterConfig = {
    showSocialLinks: true,
    showCopyright: true,
    sticky: false
  };

  @Input() companyName = 'Appointment SaaS';
  @Input() logoUrl?: string;
  @Input() description = 'Streamline your appointment scheduling with our comprehensive SaaS solution.';

  @Input() sections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', url: '/features' },
        { label: 'Pricing', url: '/pricing' },
        { label: 'Integrations', url: '/integrations' },
        { label: 'API Documentation', url: '/docs' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Careers', url: '/careers' },
        { label: 'Contact', url: '/contact' },
        { label: 'Blog', url: '/blog' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', url: '/help' },
        { label: 'Community', url: '/community' },
        { label: 'System Status', url: '/status' },
        { label: 'Contact Support', url: '/support' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Cookie Policy', url: '/cookies' },
        { label: 'GDPR', url: '/gdpr' }
      ]
    }
  ];

  @Input() socialLinks = [
    { label: 'Twitter', url: 'https://twitter.com/appointmentsaas', icon: 'fab fa-twitter' },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/appointmentsaas', icon: 'fab fa-linkedin-in' },
    { label: 'GitHub', url: 'https://github.com/appointmentsaas', icon: 'fab fa-github' }
  ];

  get currentYear(): number {
    return new Date().getFullYear();
  }

  getCompanyInitials(): string {
    return this.companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}