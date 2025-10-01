import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../types';

export interface SidebarMenuItem extends MenuItem {
  expanded?: boolean;
  active?: boolean;
}

export interface AppSidebarConfig {
  collapsible?: boolean;
  collapsed?: boolean;
  showMobileMenu?: boolean;
  mobileMenuOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="app-sidebar" [class.app-sidebar--collapsed]="config.collapsed">
      <!-- Header -->
      <div class="app-sidebar__header">
        <div class="app-sidebar__logo">
          <img
            *ngIf="logoUrl"
            [src]="logoUrl"
            [alt]="appName"
            class="app-sidebar__logo-image"
          />
          <div
            *ngIf="!logoUrl"
            class="app-sidebar__logo-placeholder"
          >
            {{ getAppInitials() }}
          </div>
        </div>
        <h2
          *ngIf="!config.collapsed"
          class="app-sidebar__app-name"
        >
          {{ appName }}
        </h2>
        <button
          *ngIf="config.collapsible !== false"
          class="app-sidebar__collapse-btn"
          (click)="onToggleCollapse()"
          [attr.aria-label]="config.collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg
            class="app-sidebar__collapse-icon"
            [class.app-sidebar__collapse-icon--rotated]="config.collapsed"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="app-sidebar__nav">
        <ul class="app-sidebar__menu">
          <li
            *ngFor="let item of menuItems; let i = index"
            class="app-sidebar__menu-item"
            [class.app-sidebar__menu-item--has-children]="item.children && item.children.length > 0"
            [class.app-sidebar__menu-item--active]="item.active"
            [class.app-sidebar__menu-item--disabled]="item.disabled"
          >
            <!-- Menu Item with Children -->
            <div *ngIf="item.children && item.children.length > 0; else simpleItem">
              <button
                class="app-sidebar__menu-toggle"
                (click)="toggleMenuGroup(i)"
                [attr.aria-expanded]="item.expanded"
                [disabled]="item.disabled"
              >
                <span class="app-sidebar__menu-icon" *ngIf="item.icon">
                  <i [class]="item.icon"></i>
                </span>
                <span
                  *ngIf="!config.collapsed"
                  class="app-sidebar__menu-label"
                >
                  {{ item.label }}
                </span>
                <span *ngIf="item.badge" class="app-sidebar__menu-badge">
                  {{ item.badge }}
                </span>
                <svg
                  *ngIf="!config.collapsed"
                  class="app-sidebar__menu-arrow"
                  [class.app-sidebar__menu-arrow--rotated]="item.expanded"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Submenu -->
              <ul
                *ngIf="item.expanded && (!config.collapsed || config.mobileMenuOpen)"
                class="app-sidebar__submenu"
                [class.app-sidebar__submenu--mobile]="config.mobileMenuOpen"
              >
                <li
                  *ngFor="let child of item.children"
                  class="app-sidebar__submenu-item"
                  [class.app-sidebar__submenu-item--active]="isChildActive(child)"
                  [class.app-sidebar__submenu-item--disabled]="child.disabled"
                >
                  <a
                    *ngIf="child.route && !child.disabled"
                    [routerLink]="child.route"
                    class="app-sidebar__submenu-link"
                    (click)="onMobileMenuClose()"
                  >
                    <span class="app-sidebar__submenu-icon" *ngIf="child.icon">
                      <i [class]="child.icon"></i>
                    </span>
                    <span class="app-sidebar__submenu-label">{{ child.label }}</span>
                    <span *ngIf="child.badge" class="app-sidebar__submenu-badge">
                      {{ child.badge }}
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Simple Menu Item -->
            <ng-template #simpleItem>
              <a
                *ngIf="item.route && !item.disabled"
                [routerLink]="item.route"
                class="app-sidebar__menu-link"
                (click)="onMobileMenuClose()"
              >
                <span class="app-sidebar__menu-icon" *ngIf="item.icon">
                  <i [class]="item.icon"></i>
                </span>
                <span
                  *ngIf="!config.collapsed"
                  class="app-sidebar__menu-label"
                >
                  {{ item.label }}
                </span>
                <span *ngIf="item.badge" class="app-sidebar__menu-badge">
                  {{ item.badge }}
                </span>
              </a>
            </ng-template>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="app-sidebar__footer">
        <div
          *ngIf="!config.collapsed"
          class="app-sidebar__user-section"
        >
          <div class="app-sidebar__user-info">
            <div class="app-sidebar__user-avatar">
              <img
                *ngIf="userAvatar"
                [src]="userAvatar"
                [alt]="userName"
                class="app-sidebar__user-image"
              />
              <div
                *ngIf="!userAvatar"
                class="app-sidebar__user-initials"
              >
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="app-sidebar__user-details">
              <span class="app-sidebar__user-name">{{ userName }}</span>
              <span class="app-sidebar__user-role">{{ userRole }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Overlay -->
      <div
        *ngIf="config.mobileMenuOpen"
        class="app-sidebar__overlay"
        (click)="onMobileMenuClose()"
      ></div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      position: relative;
      display: flex;
      flex-direction: column;
      width: var(--sidebar-width, 280px);
      height: 100vh;
      background: var(--color-neutral-white, #ffffff);
      border-right: 1px solid var(--color-neutral-gray200, #e5e7eb);
      transition: var(--transition-normal, 0.2s ease);
      overflow: hidden;
      z-index: var(--z-sidebar, 50);
    }

    .app-sidebar--collapsed {
      width: var(--sidebar-width-collapsed, 64px);
    }

    .app-sidebar__header {
      display: flex;
      align-items: center;
      padding: var(--spacing-lg, 24px) var(--spacing-md, 16px);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-white, #ffffff);
      min-height: 72px;
    }

    .app-sidebar__logo {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-sm, 4px);
      overflow: hidden;
      flex-shrink: 0;
      margin-right: var(--spacing-sm, 8px);
    }

    .app-sidebar__logo-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .app-sidebar__logo-placeholder {
      width: 100%;
      height: 100%;
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-semibold, 600);
    }

    .app-sidebar__app-name {
      flex: 1;
      margin: 0;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-sidebar__collapse-btn {
      background: none;
      border: none;
      padding: var(--spacing-xs, 4px);
      border-radius: var(--border-radius-sm, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      flex-shrink: 0;
    }

    .app-sidebar__collapse-btn:hover {
      background: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray900, #111827);
    }

    .app-sidebar__collapse-icon {
      width: 16px;
      height: 16px;
      transition: var(--transition-normal, 0.2s ease);
    }

    .app-sidebar__collapse-icon--rotated {
      transform: rotate(180deg);
    }

    .app-sidebar__nav {
      flex: 1;
      padding: var(--spacing-md, 16px) 0;
      overflow-y: auto;
    }

    .app-sidebar__menu {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .app-sidebar__menu-item {
      margin: 0;
    }

    .app-sidebar__menu-toggle,
    .app-sidebar__menu-link {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      text-decoration: none;
      color: var(--color-neutral-gray700, #374151);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      border: none;
      background: none;
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      position: relative;
    }

    .app-sidebar__menu-toggle:hover,
    .app-sidebar__menu-link:hover {
      background: var(--color-neutral-gray50, #f9fafb);
      color: var(--color-neutral-gray900, #111827);
    }

    .app-sidebar__menu-toggle:focus,
    .app-sidebar__menu-link:focus {
      outline: 2px solid var(--color-primary-500, #3b82f6);
      outline-offset: -2px;
    }

    .app-sidebar__menu-item--active .app-sidebar__menu-toggle,
    .app-sidebar__menu-item--active .app-sidebar__menu-link {
      background: var(--color-primary-50, #eff6ff);
      color: var(--color-primary-700, #1d4ed8);
      border-right: 3px solid var(--color-primary-500, #3b82f6);
    }

    .app-sidebar__menu-item--disabled .app-sidebar__menu-toggle,
    .app-sidebar__menu-item--disabled .app-sidebar__menu-link {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .app-sidebar__menu-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-right: var(--spacing-sm, 8px);
      flex-shrink: 0;
    }

    .app-sidebar__menu-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-sidebar__menu-badge {
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      padding: 2px var(--spacing-xs, 4px);
      border-radius: var(--border-radius-full, 9999px);
      min-width: 18px;
      text-align: center;
      margin-left: var(--spacing-xs, 4px);
    }

    .app-sidebar__menu-arrow {
      width: 16px;
      height: 16px;
      margin-left: var(--spacing-xs, 4px);
      transition: var(--transition-normal, 0.2s ease);
      flex-shrink: 0;
    }

    .app-sidebar__menu-arrow--rotated {
      transform: rotate(180deg);
    }

    .app-sidebar__submenu {
      list-style: none;
      margin: 0;
      padding: 0;
      background: var(--color-neutral-gray50, #f9fafb);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .app-sidebar__submenu--mobile {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--color-neutral-white, #ffffff);
      z-index: var(--z-mobile-menu, 1000);
      padding: var(--spacing-xl, 32px);
      overflow-y: auto;
    }

    .app-sidebar__submenu-item {
      margin: 0;
    }

    .app-sidebar__submenu-link {
      display: flex;
      align-items: center;
      padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
      color: var(--color-neutral-gray600, #4b5563);
      text-decoration: none;
      font-size: var(--font-size-base, 16px);
      font-weight: var(--font-weight-medium, 500);
      transition: var(--transition-normal, 0.2s ease);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .app-sidebar__submenu-link:hover {
      background: var(--color-neutral-gray50, #f9fafb);
      color: var(--color-neutral-gray900, #111827);
    }

    .app-sidebar__submenu-item--active .app-sidebar__submenu-link {
      background: var(--color-primary-50, #eff6ff);
      color: var(--color-primary-700, #1d4ed8);
      border-left: 3px solid var(--color-primary-500, #3b82f6);
    }

    .app-sidebar__submenu-item--disabled .app-sidebar__submenu-link {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .app-sidebar__submenu-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-right: var(--spacing-md, 16px);
      flex-shrink: 0;
    }

    .app-sidebar__submenu-label {
      flex: 1;
    }

    .app-sidebar__submenu-badge {
      background: var(--color-secondary-500, #8b5cf6);
      color: var(--color-neutral-white, #ffffff);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      padding: 2px var(--spacing-xs, 4px);
      border-radius: var(--border-radius-full, 9999px);
      min-width: 18px;
      text-align: center;
      margin-left: var(--spacing-xs, 4px);
    }

    .app-sidebar__footer {
      padding: var(--spacing-md, 16px);
      border-top: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-white, #ffffff);
    }

    .app-sidebar__user-section {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm, 8px);
      border-radius: var(--border-radius-md, 8px);
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .app-sidebar__user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      min-width: 0;
    }

    .app-sidebar__user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-full, 9999px);
      overflow: hidden;
      flex-shrink: 0;
    }

    .app-sidebar__user-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .app-sidebar__user-initials {
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

    .app-sidebar__user-details {
      min-width: 0;
    }

    .app-sidebar__user-name {
      display: block;
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-neutral-gray900, #111827);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-sidebar__user-role {
      display: block;
      font-size: var(--font-size-xs, 12px);
      color: var(--color-neutral-gray600, #4b5563);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-sidebar__overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--z-mobile-overlay, 40);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .app-sidebar {
        width: var(--sidebar-width-collapsed, 64px);
      }

      .app-sidebar__menu-toggle,
      .app-sidebar__menu-link {
        padding: var(--spacing-sm, 8px) var(--spacing-xs, 4px);
        justify-content: center;
      }

      .app-sidebar__menu-label,
      .app-sidebar__menu-arrow {
        display: none;
      }

      .app-sidebar__menu-icon {
        margin-right: 0;
      }
    }

    @media (max-width: 768px) {
      .app-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: var(--sidebar-width, 280px);
        height: 100vh;
        transform: translateX(-100%);
        z-index: var(--z-mobile-sidebar, 200);
      }

      .app-sidebar--mobile-open {
        transform: translateX(0);
      }

      .app-sidebar__overlay {
        display: block;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSidebarComponent {
  @Input() config: AppSidebarConfig = {
    collapsible: true,
    collapsed: false,
    showMobileMenu: true,
    mobileMenuOpen: false
  };

  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() appName = 'Appointment SaaS';
  @Input() logoUrl?: string;
  @Input() userName = 'User';
  @Input() userRole = 'User';
  @Input() userAvatar?: string;

  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() mobileMenuClose = new EventEmitter<void>();

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  onMobileMenuClose(): void {
    this.mobileMenuClose.emit();
  }

  toggleMenuGroup(index: number): void {
    if (this.menuItems[index]) {
      this.menuItems[index].expanded = !this.menuItems[index].expanded;
    }
  }

  getAppInitials(): string {
    return this.appName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserInitials(): string {
    return this.userName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  isChildActive(child: MenuItem): boolean {
    // For now, return false as we don't have route-based active state logic
    // This can be enhanced later with actual routing information
    return false;
  }
}