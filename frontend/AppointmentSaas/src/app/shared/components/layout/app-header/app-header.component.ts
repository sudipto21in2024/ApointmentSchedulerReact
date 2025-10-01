import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../types';

export interface AppHeaderConfig {
  showBreadcrumbs?: boolean;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  title?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header">
      <div class="app-header__content">
        <!-- Left Section -->
        <div class="app-header__left">
          <!-- Mobile Menu Button -->
          <button
            *ngIf="config.showUserMenu !== false"
            class="app-header__mobile-menu"
            (click)="onMobileMenuClick()"
            aria-label="Toggle navigation menu"
          >
            <svg class="app-header__menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Breadcrumbs -->
          <nav
            *ngIf="config.showBreadcrumbs !== false && breadcrumbs.length > 0"
            class="app-header__breadcrumbs"
            aria-label="Breadcrumb navigation"
          >
            <ol class="app-header__breadcrumb-list">
              <li
                *ngFor="let breadcrumb of breadcrumbs; let last = last; let first = first"
                class="app-header__breadcrumb-item"
                [class.app-header__breadcrumb-item--first]="first"
              >
                <a
                  *ngIf="!last && breadcrumb.route"
                  [routerLink]="breadcrumb.route"
                  class="app-header__breadcrumb-link"
                >
                  <span *ngIf="breadcrumb.icon" class="app-header__breadcrumb-icon">
                    <i [class]="breadcrumb.icon"></i>
                  </span>
                  {{ breadcrumb.label }}
                </a>
                <span
                  *ngIf="last || !breadcrumb.route"
                  class="app-header__breadcrumb-current"
                >
                  <span *ngIf="breadcrumb.icon" class="app-header__breadcrumb-icon">
                    <i [class]="breadcrumb.icon"></i>
                  </span>
                  {{ breadcrumb.label }}
                </span>
                <span *ngIf="!last" class="app-header__breadcrumb-separator" aria-hidden="true">/</span>
              </li>
            </ol>
          </nav>

          <!-- Title/Subtitle -->
          <div *ngIf="config.title" class="app-header__title-section">
            <h1 class="app-header__title">{{ config.title }}</h1>
            <p *ngIf="config.subtitle" class="app-header__subtitle">{{ config.subtitle }}</p>
          </div>
        </div>

        <!-- Right Section -->
        <div class="app-header__right">
          <!-- Notifications -->
          <button
            *ngIf="config.showNotifications !== false"
            class="app-header__notifications"
            (click)="onNotificationsClick()"
            aria-label="View notifications"
          >
            <svg class="app-header__notifications-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-4.586 0-3.376-4.038-4.586-12-4.586S0 12.683 0 16.059C0 19.435 4.038 21 12 21c2.891 0 5.547-.233 7.132-.683M4.868 12.683C4.038 13.074 3 13.574 3 14.5 3 15.328 4.038 16 12 16s9-.672 9-1.5c0-.828-1.038-1.426-2.868-1.817"/>
            </svg>
            <span *ngIf="notificationCount > 0" class="app-header__notification-badge">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          </button>

          <!-- User Menu -->
          <div
            *ngIf="config.showUserMenu !== false"
            class="app-header__user-menu"
            (click)="onUserMenuClick()"
          >
            <div class="app-header__user-avatar">
              <img
                *ngIf="userAvatar"
                [src]="userAvatar"
                [alt]="userName"
                class="app-header__user-image"
              />
              <div
                *ngIf="!userAvatar"
                class="app-header__user-initials"
              >
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="app-header__user-info">
              <span class="app-header__user-name">{{ userName }}</span>
              <span class="app-header__user-role">{{ userRole }}</span>
            </div>
            <svg class="app-header__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: var(--color-neutral-white, #ffffff);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
      position: sticky;
      top: 0;
      z-index: var(--z-header, 100);
    }

    .app-header__content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
      max-width: var(--container-max-width, 1200px);
      margin: 0 auto;
    }

    .app-header__left {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg, 24px);
    }

    .app-header__mobile-menu {
      display: none;
      background: none;
      border: none;
      padding: var(--spacing-sm, 8px);
      border-radius: var(--border-radius-sm, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .app-header__mobile-menu:hover {
      background: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray900, #111827);
    }

    .app-header__breadcrumbs {
      margin: 0;
    }

    .app-header__breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: var(--spacing-sm, 8px);
    }

    .app-header__breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: var(--font-size-sm, 14px);
    }

    .app-header__breadcrumb-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      text-decoration: none;
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      border-radius: var(--border-radius-sm, 4px);
      transition: var(--transition-normal, 0.2s ease);
    }

    .app-header__breadcrumb-link:hover {
      color: var(--color-primary-600, #2563eb);
      background: var(--color-primary-50, #eff6ff);
    }

    .app-header__breadcrumb-current {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      color: var(--color-neutral-gray900, #111827);
      font-weight: var(--font-weight-medium, 500);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    }

    .app-header__breadcrumb-separator {
      color: var(--color-neutral-gray400, #9ca3af);
      margin: 0 var(--spacing-xs, 4px);
    }

    .app-header__breadcrumb-icon {
      display: flex;
      align-items: center;
      width: 16px;
      height: 16px;
    }

    .app-header__title-section {
      margin-left: var(--spacing-md, 16px);
    }

    .app-header__title {
      margin: 0;
      font-size: var(--font-size-xl, 20px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
      line-height: 1.2;
    }

    .app-header__subtitle {
      margin: var(--spacing-xs, 4px) 0 0 0;
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
      line-height: 1.3;
    }

    .app-header__right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md, 16px);
    }

    .app-header__notifications {
      position: relative;
      background: none;
      border: none;
      padding: var(--spacing-sm, 8px);
      border-radius: var(--border-radius-sm, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .app-header__notifications:hover {
      background: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray900, #111827);
    }

    .app-header__notifications-icon {
      width: 20px;
      height: 20px;
    }

    .app-header__notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--color-error-500, #ef4444);
      color: var(--color-neutral-white, #ffffff);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      padding: 2px 6px;
      border-radius: var(--border-radius-full, 9999px);
      min-width: 18px;
      text-align: center;
      line-height: 1;
    }

    .app-header__user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border-radius: var(--border-radius-md, 8px);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      border: 1px solid transparent;
    }

    .app-header__user-menu:hover {
      background: var(--color-neutral-gray50, #f9fafb);
      border-color: var(--color-neutral-gray200, #e5e7eb);
    }

    .app-header__user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-full, 9999px);
      overflow: hidden;
      flex-shrink: 0;
    }

    .app-header__user-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .app-header__user-initials {
      width: 100%;
      height: 100%;
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
    }

    .app-header__user-info {
      display: flex;
      flex-direction: column;
      text-align: left;
      min-width: 0;
    }

    .app-header__user-name {
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-neutral-gray900, #111827);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-header__user-role {
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray600, #4b5563);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-header__dropdown-icon {
      width: 16px;
      height: 16px;
      color: var(--color-neutral-gray400, #9ca3af);
      flex-shrink: 0;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .app-header__content {
        padding: var(--spacing-md, 16px);
      }

      .app-header__left {
        gap: var(--spacing-md, 16px);
      }

      .app-header__title-section {
        margin-left: var(--spacing-sm, 8px);
      }
    }

    @media (max-width: 768px) {
      .app-header__mobile-menu {
        display: flex;
      }

      .app-header__content {
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      }

      .app-header__left {
        gap: var(--spacing-sm, 8px);
      }

      .app-header__breadcrumbs {
        display: none;
      }

      .app-header__title-section {
        margin-left: 0;
      }

      .app-header__title {
        font-size: var(--font-size-lg, 18px);
      }

      .app-header__user-info {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .app-header__right {
        gap: var(--spacing-sm, 8px);
      }

      .app-header__notifications {
        padding: var(--spacing-xs, 4px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input() config: AppHeaderConfig = {
    showBreadcrumbs: true,
    showUserMenu: true,
    showNotifications: true
  };

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() userName = 'User';
  @Input() userRole = 'User';
  @Input() userAvatar?: string;
  @Input() notificationCount = 0;

  @Output() mobileMenuClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() userMenuClick = new EventEmitter<void>();

  onMobileMenuClick(): void {
    this.mobileMenuClick.emit();
  }

  onNotificationsClick(): void {
    this.notificationsClick.emit();
  }

  onUserMenuClick(): void {
    this.userMenuClick.emit();
  }

  getUserInitials(): string {
    return this.userName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}