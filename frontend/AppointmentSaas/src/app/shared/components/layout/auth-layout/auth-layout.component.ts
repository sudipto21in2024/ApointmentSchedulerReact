import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AuthLayoutConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  backgroundImage?: string;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="auth-layout"
      [style.background-image]="config.backgroundImage ? 'url(' + config.backgroundImage + ')' : 'none'"
    >
      <!-- Header (optional) -->
      <header
        *ngIf="config.showHeader !== false"
        class="auth-layout__header"
      >
        <div class="auth-layout__header-content">
          <ng-content select="app-auth-header"></ng-content>
        </div>
      </header>

      <!-- Main Content -->
      <main class="auth-layout__main">
        <div class="auth-layout__content-card">
          <ng-content select="app-auth-content"></ng-content>
        </div>
      </main>

      <!-- Footer (optional) -->
      <footer
        *ngIf="config.showFooter !== false"
        class="auth-layout__footer"
      >
        <div class="auth-layout__footer-content">
          <ng-content select="app-auth-footer"></ng-content>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary-50, #eff6ff) 0%, var(--color-secondary-50, #f0f9ff) 100%);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .auth-layout__header {
      padding: var(--spacing-lg, 24px) 0;
    }

    .auth-layout__header-content {
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--spacing-lg, 24px);
    }

    .auth-layout__main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl, 32px) var(--spacing-lg, 24px);
    }

    .auth-layout__content-card {
      width: 100%;
      max-width: var(--auth-card-max-width, 480px);
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-lg, 12px);
      box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
      padding: var(--spacing-xl, 32px);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .auth-layout__footer {
      padding: var(--spacing-lg, 24px) 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
    }

    .auth-layout__footer-content {
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--spacing-lg, 24px);
      text-align: center;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .auth-layout__header-content,
      .auth-layout__footer-content {
        padding: 0 var(--spacing-md, 16px);
      }

      .auth-layout__main {
        padding: var(--spacing-lg, 24px) var(--spacing-md, 16px);
      }

      .auth-layout__content-card {
        padding: var(--spacing-lg, 24px);
        margin: 0 var(--spacing-sm, 8px);
        border-radius: var(--border-radius-card, 8px);
      }
    }

    @media (max-width: 480px) {
      .auth-layout__content-card {
        padding: var(--spacing-md, 16px);
        margin: 0;
        border-radius: 0;
        min-height: 100vh;
        box-shadow: none;
        border: none;
      }

      .auth-layout__main {
        padding: var(--spacing-sm, 8px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {
  @Input() config: AuthLayoutConfig = {
    showHeader: false,
    showFooter: false,
    backgroundImage: undefined
  };
}