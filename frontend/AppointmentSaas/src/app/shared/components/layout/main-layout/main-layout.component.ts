import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MainLayoutConfig {
  showSidebar?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-layout">
      <!-- Header -->
      <header class="main-layout__header">
        <ng-content select="app-header"></ng-content>
      </header>

      <!-- Main Content Area -->
      <div class="main-layout__content">
        <!-- Sidebar (optional) -->
        <aside
          *ngIf="config.showSidebar !== false"
          class="main-layout__sidebar"
          [class.main-layout__sidebar--collapsed]="config.sidebarCollapsed"
        >
          <ng-content select="app-sidebar"></ng-content>
        </aside>

        <!-- Main Content -->
        <main class="main-layout__main">
          <ng-content select="app-main-content"></ng-content>
        </main>
      </div>

      <!-- Footer (optional) -->
      <footer
        *ngIf="config.showFooter !== false"
        class="main-layout__footer"
      >
        <ng-content select="app-footer"></ng-content>
      </footer>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .main-layout__header {
      position: sticky;
      top: 0;
      z-index: var(--z-header, 100);
      background: var(--color-neutral-white, #ffffff);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

    .main-layout__content {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    .main-layout__sidebar {
      width: var(--sidebar-width, 280px);
      background: var(--color-neutral-white, #ffffff);
      border-right: 1px solid var(--color-neutral-gray200, #e5e7eb);
      transition: var(--transition-normal, 0.2s ease);
      overflow-y: auto;
    }

    .main-layout__sidebar--collapsed {
      width: var(--sidebar-width-collapsed, 64px);
    }

    .main-layout__main {
      flex: 1;
      padding: var(--spacing-lg, 24px);
      overflow-y: auto;
      background: var(--color-neutral-white, #ffffff);
    }

    .main-layout__footer {
      background: var(--color-neutral-gray900, #111827);
      color: var(--color-neutral-white, #ffffff);
      padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .main-layout__sidebar {
        width: var(--sidebar-width-collapsed, 64px);
      }

      .main-layout__main {
        padding: var(--spacing-md, 16px);
      }
    }

    @media (max-width: 768px) {
      .main-layout__content {
        flex-direction: column;
      }

      .main-layout__sidebar {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      }

      .main-layout__main {
        padding: var(--spacing-sm, 8px);
      }

      .main-layout__footer {
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  @Input() config: MainLayoutConfig = {
    showSidebar: true,
    showFooter: true,
    sidebarCollapsed: false
  };
}