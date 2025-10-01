import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
  removable?: boolean;
}

export interface TabConfig {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  swipeable?: boolean;
  animated?: boolean;
  showIcons?: boolean;
  showBadges?: boolean;
  closable?: boolean;
}

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="tab-item"
      [class]="'tab-item--' + config.size"
      [class]="'tab-item--' + config.variant"
      [class.tab-item--disabled]="data.disabled"
      [class.tab-item--active]="active"
      [class.tab-item--closable]="config.closable && data.removable"
      (click)="!data.disabled && onTabClick()"
    >
      <!-- Icon -->
      <i *ngIf="config.showIcons !== false && data.icon" [class]="data.icon" class="tab-item__icon"></i>

      <!-- Label -->
      <span class="tab-item__label">{{ data.label }}</span>

      <!-- Badge -->
      <span *ngIf="config.showBadges !== false && data.badge" class="tab-item__badge">
        {{ data.badge }}
      </span>

      <!-- Close Button -->
      <button
        *ngIf="config.closable && data.removable"
        class="tab-item__close"
        (click)="onTabClose($event)"
        [attr.aria-label]="'Close ' + data.label + ' tab'"
      >
        <svg class="tab-item__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .tab-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      background: transparent;
      border: none;
      border-radius: var(--border-radius-sm, 4px);
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      position: relative;
      white-space: nowrap;
      outline: none;
    }

    .tab-item:hover:not(.tab-item--disabled) {
      background: var(--color-neutral-gray50, #f9fafb);
      color: var(--color-neutral-gray900, #111827);
    }

    .tab-item:focus {
      outline: 2px solid var(--color-primary-500, #3b82f6);
      outline-offset: -2px;
    }

    .tab-item--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-item--active {
      background: var(--color-primary-50, #eff6ff);
      color: var(--color-primary-700, #1d4ed8);
      border-bottom: 2px solid var(--color-primary-500, #3b82f6);
    }

    .tab-item--active:hover {
      background: var(--color-primary-100, #dbeafe);
    }

    .tab-item__icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .tab-item__label {
      flex: 1;
      text-align: left;
    }

    .tab-item__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 var(--spacing-xs, 4px);
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-semibold, 600);
      border-radius: var(--border-radius-full, 9999px);
      margin-left: var(--spacing-xs, 4px);
    }

    .tab-item__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      border-radius: var(--border-radius-full, 9999px);
      color: var(--color-neutral-gray400, #9ca3af);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      margin-left: var(--spacing-xs, 4px);
      opacity: 0;
    }

    .tab-item--closable:hover .tab-item__close,
    .tab-item__close:focus {
      opacity: 1;
    }

    .tab-item__close:hover {
      background: var(--color-neutral-gray200, #e5e7eb);
      color: var(--color-neutral-gray600, #4b5563);
    }

    .tab-item__close-icon {
      width: 12px;
      height: 12px;
    }

    /* Size Variants */
    .tab-item--sm {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      font-size: var(--font-size-xs, 12px);
    }

    .tab-item--sm .tab-item__icon {
      width: 14px;
      height: 14px;
    }

    .tab-item--lg {
      padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
      font-size: var(--font-size-base, 16px);
    }

    .tab-item--lg .tab-item__icon {
      width: 20px;
      height: 20px;
    }

    /* Variant Styles */
    .tab-item--outlined {
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      margin-right: var(--spacing-xs, 4px);
    }

    .tab-item--outlined.tab-item--active {
      border-color: var(--color-primary-500, #3b82f6);
      background: var(--color-primary-50, #eff6ff);
    }

    .tab-item--filled {
      background: var(--color-neutral-gray100, #f3f4f6);
      margin-right: var(--spacing-xs, 4px);
    }

    .tab-item--filled.tab-item--active {
      background: var(--color-primary-500, #3b82f6);
      color: var(--color-neutral-white, #ffffff);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabItemComponent {
  @Input() data!: TabItem;
  @Input() active = false;
  @Input() config!: TabConfig;

  @Output() tabClick = new EventEmitter<void>();
  @Output() tabClose = new EventEmitter<void>();

  onTabClick(): void {
    if (!this.data.disabled) {
      this.tabClick.emit();
    }
  }

  onTabClose(event: Event): void {
    event.stopPropagation();
    this.tabClose.emit();
  }
}

@Component({
  selector: 'app-tab-group',
  standalone: true,
  imports: [CommonModule, TabItemComponent],
  template: `
    <div
      class="tab-group"
      [class]="'tab-group--' + config.orientation"
      [class]="'tab-group--' + config.variant"
    >
      <!-- Tab Navigation -->
      <div
        class="tab-navigation"
        [class]="'tab-navigation--' + config.orientation"
        role="tablist"
        [attr.aria-label]="'Tab navigation'"
      >
        <div
          *ngFor="let tab of tabs; let i = index"
          class="tab-navigation__item"
          [class.tab-navigation__item--first]="i === 0"
          [class.tab-navigation__item--last]="i === tabs.length - 1"
        >
          <app-tab
            [data]="tab"
            [active]="activeTabIndex === i"
            [config]="config"
            (tabClick)="setActiveTab(i)"
            (tabClose)="closeTab(i)"
          ></app-tab>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <div
          *ngFor="let tab of tabs; let i = index"
          class="tab-content__panel"
          [class.tab-content__panel--active]="activeTabIndex === i"
          [class.tab-content__panel--animated]="config.animated"
          role="tabpanel"
          [attr.aria-labelledby]="'tab-' + i"
          [hidden]="activeTabIndex !== i"
        >
          <ng-content [select]="'tab-content-' + i"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-group {
      display: flex;
      background: var(--color-neutral-white, #ffffff);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      border-radius: var(--border-radius-md, 8px);
      overflow: hidden;
    }

    .tab-group--vertical {
      flex-direction: column;
    }

    .tab-navigation {
      display: flex;
      background: var(--color-neutral-gray50, #f9fafb);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .tab-navigation--vertical {
      flex-direction: column;
      width: 200px;
      border-bottom: none;
      border-right: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .tab-navigation__item {
      flex: 1;
    }

    .tab-navigation__item--first {
      border-top-left-radius: var(--border-radius-sm, 4px);
    }

    .tab-navigation__item--last {
      border-top-right-radius: var(--border-radius-sm, 4px);
    }

    .tab-content {
      flex: 1;
      min-height: 200px;
      background: var(--color-neutral-white, #ffffff);
    }

    .tab-content__panel {
      padding: var(--spacing-lg, 24px);
      width: 100%;
      height: 100%;
    }

    .tab-content__panel--active {
      display: block;
    }

    .tab-content__panel--animated {
      transition: var(--transition-normal, 0.2s ease);
      opacity: 0;
      transform: translateY(10px);
    }

    .tab-content__panel--active.tab-content__panel--animated {
      opacity: 1;
      transform: translateY(0);
    }

    .tab-content__panel[hidden] {
      display: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .tab-group--vertical {
        flex-direction: column;
      }

      .tab-navigation--vertical {
        width: 100%;
        flex-direction: row;
        border-right: none;
        border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
        overflow-x: auto;
      }

      .tab-navigation__item {
        flex: 0 0 auto;
        min-width: 120px;
      }

      .tab-content__panel {
        padding: var(--spacing-md, 16px);
      }
    }

    @media (max-width: 480px) {
      .tab-navigation__item {
        min-width: 100px;
      }

      .tab-content__panel {
        padding: var(--spacing-sm, 8px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent implements AfterContentInit {
  @ContentChildren(TabItemComponent) tabItems!: QueryList<TabItemComponent>;

  @Input() config: TabConfig = {
    variant: 'default',
    size: 'md',
    orientation: 'horizontal',
    swipeable: false,
    animated: true,
    showIcons: true,
    showBadges: true,
    closable: false
  };

  @Input() tabs: TabItem[] = [];
  @Input() activeTabIndex = 0;

  @Output() tabChange = new EventEmitter<number>();
  @Output() tabClose = new EventEmitter<number>();

  ngAfterContentInit(): void {
    // Initialize tabs from content children if not provided via input
    if (this.tabs.length === 0 && this.tabItems.length > 0) {
      this.tabs = this.tabItems.map(tab => tab.data);
    }
  }

  setActiveTab(index: number): void {
    if (index >= 0 && index < this.tabs.length && !this.tabs[index].disabled) {
      this.activeTabIndex = index;
      this.tabChange.emit(index);
    }
  }

  closeTab(index: number): void {
    if (index >= 0 && index < this.tabs.length) {
      this.tabClose.emit(index);
    }
  }

  nextTab(): void {
    const nextIndex = (this.activeTabIndex + 1) % this.tabs.length;
    this.setActiveTab(nextIndex);
  }

  previousTab(): void {
    const prevIndex = this.activeTabIndex <= 0 ? this.tabs.length - 1 : this.activeTabIndex - 1;
    this.setActiveTab(prevIndex);
  }
}