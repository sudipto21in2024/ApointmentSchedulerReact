import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbItem } from '../../types';

export interface BreadcrumbConfig {
  separator?: string;
  showHome?: boolean;
  maxItems?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="breadcrumb"
      [class]="'breadcrumb--' + config.size"
      [class]="'breadcrumb--' + config.variant"
      aria-label="Breadcrumb navigation"
    >
      <ol class="breadcrumb__list">
        <!-- Home Breadcrumb -->
        <li *ngIf="config.showHome !== false" class="breadcrumb__item">
          <a
            [routerLink]="homeRoute"
            class="breadcrumb__link breadcrumb__link--home"
            [attr.aria-label]="'Go to ' + homeLabel"
          >
            <svg *ngIf="homeIcon" class="breadcrumb__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span *ngIf="config.variant !== 'compact'" class="breadcrumb__text">{{ homeLabel }}</span>
          </a>
        </li>

        <!-- Dynamic Breadcrumbs -->
        <ng-container *ngFor="let item of visibleItems; let i = index; let last = last">
          <!-- Separator -->
          <li *ngIf="i > 0 || (config.showHome !== false)" class="breadcrumb__separator">
            <span class="breadcrumb__separator-text" aria-hidden="true">
              {{ config.separator || '/' }}
            </span>
          </li>

          <!-- Breadcrumb Item -->
          <li class="breadcrumb__item" [class.breadcrumb__item--last]="last">
            <a
              *ngIf="!last && item.route"
              [routerLink]="item.route"
              class="breadcrumb__link"
              [attr.aria-label]="'Go to ' + item.label"
            >
              <i *ngIf="item.icon" [class]="item.icon" class="breadcrumb__icon"></i>
              <span class="breadcrumb__text">{{ item.label }}</span>
            </a>

            <span
              *ngIf="last || !item.route"
              class="breadcrumb__current"
              aria-current="page"
            >
              <i *ngIf="item.icon" [class]="item.icon" class="breadcrumb__icon"></i>
              <span class="breadcrumb__text">{{ item.label }}</span>
            </span>
          </li>
        </ng-container>

        <!-- Show More Dropdown (if items exceed maxItems) -->
        <li *ngIf="showDropdown" class="breadcrumb__dropdown">
          <button
            class="breadcrumb__dropdown-btn"
            (click)="toggleDropdown()"
            [attr.aria-label]="'Show more breadcrumb items'"
            [attr.aria-expanded]="dropdownOpen"
          >
            <span class="breadcrumb__dropdown-text">...</span>
            <svg class="breadcrumb__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            *ngIf="dropdownOpen"
            class="breadcrumb__dropdown-menu"
            role="menu"
          >
            <a
              *ngFor="let item of hiddenItems; let i = index"
              [routerLink]="item.route"
              class="breadcrumb__dropdown-item"
              role="menuitem"
              (click)="closeDropdown()"
            >
              <i *ngIf="item.icon" [class]="item.icon" class="breadcrumb__dropdown-icon"></i>
              <span class="breadcrumb__dropdown-text">{{ item.label }}</span>
            </a>
          </div>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb {
      margin: 0;
      padding: 0;
    }

    .breadcrumb__list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: var(--spacing-xs, 4px);
      flex-wrap: wrap;
    }

    .breadcrumb__item {
      display: flex;
      align-items: center;
    }

    .breadcrumb__separator {
      display: flex;
      align-items: center;
      margin: 0 var(--spacing-xs, 4px);
    }

    .breadcrumb__separator-text {
      color: var(--color-neutral-gray400, #9ca3af);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-normal, 400);
    }

    .breadcrumb__link {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      color: var(--color-neutral-gray600, #4b5563);
      text-decoration: none;
      font-size: var(--font-size-sm, 14px);
      border-radius: var(--border-radius-sm, 4px);
      transition: var(--transition-normal, 0.2s ease);
      white-space: nowrap;
    }

    .breadcrumb__link:hover {
      color: var(--color-primary-600, #2563eb);
      background: var(--color-primary-50, #eff6ff);
    }

    .breadcrumb__link--home {
      color: var(--color-neutral-gray500, #6b7280);
      font-weight: var(--font-weight-medium, 500);
    }

    .breadcrumb__link--home:hover {
      color: var(--color-primary-600, #2563eb);
      background: var(--color-primary-50, #eff6ff);
    }

    .breadcrumb__current {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      color: var(--color-neutral-gray900, #111827);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      white-space: nowrap;
    }

    .breadcrumb__icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .breadcrumb__text {
      line-height: 1.4;
    }

    .breadcrumb__dropdown {
      position: relative;
    }

    .breadcrumb__dropdown-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      background: none;
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .breadcrumb__dropdown-btn:hover {
      background: var(--color-neutral-gray50, #f9fafb);
      border-color: var(--color-neutral-gray400, #9ca3af);
    }

    .breadcrumb__dropdown-icon {
      width: 12px;
      height: 12px;
      transition: var(--transition-normal, 0.2s ease);
    }

    .breadcrumb__dropdown-btn[aria-expanded="true"] .breadcrumb__dropdown-icon {
      transform: rotate(180deg);
    }

    .breadcrumb__dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background: var(--color-neutral-white, #ffffff);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      border-radius: var(--border-radius-md, 8px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05));
      z-index: var(--z-dropdown, 1000);
      margin-top: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) 0;
    }

    .breadcrumb__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      color: var(--color-neutral-gray700, #374151);
      text-decoration: none;
      font-size: var(--font-size-sm, 14px);
      transition: var(--transition-normal, 0.2s ease);
      white-space: nowrap;
    }

    .breadcrumb__dropdown-item:hover {
      background: var(--color-neutral-gray50, #f9fafb);
      color: var(--color-neutral-gray900, #111827);
    }

    .breadcrumb__dropdown-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Size Variants */
    .breadcrumb--sm {
      gap: var(--spacing-xs, 4px);
    }

    .breadcrumb--sm .breadcrumb__link,
    .breadcrumb--sm .breadcrumb__current {
      padding: var(--spacing-xs, 4px);
      font-size: var(--font-size-xs, 12px);
    }

    .breadcrumb--lg {
      gap: var(--spacing-sm, 8px);
    }

    .breadcrumb--lg .breadcrumb__link,
    .breadcrumb--lg .breadcrumb__current {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      font-size: var(--font-size-base, 16px);
    }

    /* Variant Styles */
    .breadcrumb--compact .breadcrumb__text {
      display: none;
    }

    .breadcrumb--compact .breadcrumb__link,
    .breadcrumb--compact .breadcrumb__current {
      padding: var(--spacing-xs, 4px);
    }

    .breadcrumb--compact .breadcrumb__icon {
      width: 18px;
      height: 18px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .breadcrumb__list {
        gap: var(--spacing-xs, 4px);
      }

      .breadcrumb__link,
      .breadcrumb__current {
        padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
        font-size: var(--font-size-xs, 12px);
      }

      .breadcrumb__dropdown-menu {
        min-width: 160px;
      }
    }

    @media (max-width: 480px) {
      .breadcrumb__list {
        flex-wrap: wrap;
      }

      .breadcrumb__text {
        display: none;
      }

      .breadcrumb__link,
      .breadcrumb__current {
        padding: var(--spacing-xs, 4px);
      }

      .breadcrumb--compact .breadcrumb__text {
        display: inline;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  @Input() config: BreadcrumbConfig = {
    separator: '/',
    showHome: true,
    maxItems: 5,
    size: 'md',
    variant: 'default'
  };

  @Input() items: BreadcrumbItem[] = [];
  @Input() homeLabel = 'Home';
  @Input() homeRoute = '/dashboard';
  @Input() homeIcon = true;

  dropdownOpen = false;

  get visibleItems(): BreadcrumbItem[] {
    if (!this.config.maxItems || this.items.length <= this.config.maxItems) {
      return this.items;
    }

    // Show first item, last items, and hide middle items
    const visible = [this.items[0]]; // Always show first
    const remaining = this.config.maxItems - 2; // Reserve space for first and last
    const start = Math.max(1, this.items.length - remaining);

    for (let i = start; i < this.items.length; i++) {
      visible.push(this.items[i]);
    }

    return visible;
  }

  get hiddenItems(): BreadcrumbItem[] {
    if (!this.config.maxItems || this.items.length <= this.config.maxItems) {
      return [];
    }

    const hidden: BreadcrumbItem[] = [];
    const remaining = this.config.maxItems - 2;
    const start = Math.max(1, this.items.length - remaining);

    for (let i = 1; i < start; i++) {
      hidden.push(this.items[i]);
    }

    return hidden;
  }

  get showDropdown(): boolean {
    return this.config.maxItems ? this.items.length > this.config.maxItems : false;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}