import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationConfig } from '../../types';

export interface PaginationComponentConfig {
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" [class.pagination-container--compact]="config.compact">
      <!-- Page Size Selector -->
      <div *ngIf="config.showPageSizeSelector && pageSizeOptions.length > 0" class="pagination__size-selector">
        <label class="pagination__size-label">Show:</label>
        <select
          class="pagination__size-select"
          [value]="paginationConfig.pageSize"
          (change)="onPageSizeChange($event)"
        >
          <option *ngFor="let size of pageSizeOptions" [value]="size">
            {{ size }}
          </option>
        </select>
        <span class="pagination__size-text">entries</span>
      </div>

      <!-- Page Info -->
      <div *ngIf="config.showPageInfo" class="pagination__info">
        Showing {{ getStartIndex() }} to {{ getEndIndex() }} of {{ paginationConfig.total }} entries
      </div>

      <!-- Pagination Controls -->
      <nav
        *ngIf="paginationConfig.total > paginationConfig.pageSize"
        class="pagination"
        role="navigation"
        [attr.aria-label]="'Pagination Navigation'"
      >
        <!-- First Page -->
        <button
          *ngIf="config.showFirstLast"
          class="pagination__btn pagination__btn--first"
          [class.pagination__btn--disabled]="paginationConfig.page <= 1"
          [disabled]="paginationConfig.page <= 1"
          (click)="goToPage(1)"
          [attr.aria-label]="'Go to first page'"
        >
          <svg class="pagination__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Previous Page -->
        <button
          class="pagination__btn pagination__btn--prev"
          [class.pagination__btn--disabled]="paginationConfig.page <= 1"
          [disabled]="paginationConfig.page <= 1"
          (click)="goToPage(paginationConfig.page - 1)"
          [attr.aria-label]="'Go to previous page'"
        >
          <svg class="pagination__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span *ngIf="!config.compact" class="pagination__btn-text">Previous</span>
        </button>

        <!-- Page Numbers -->
        <div class="pagination__pages">
          <!-- First page or ellipsis -->
          <button
            *ngIf="showFirstPage()"
            class="pagination__btn pagination__btn--page"
            [class.pagination__btn--active]="paginationConfig.page === 1"
            (click)="goToPage(1)"
          >
            1
          </button>
          <span *ngIf="showFirstEllipsis()" class="pagination__ellipsis">...</span>

          <!-- Current page range -->
          <button
            *ngFor="let page of getVisiblePages()"
            class="pagination__btn pagination__btn--page"
            [class.pagination__btn--active]="page === paginationConfig.page"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>

          <!-- Last page or ellipsis -->
          <span *ngIf="showLastEllipsis()" class="pagination__ellipsis">...</span>
          <button
            *ngIf="showLastPage()"
            class="pagination__btn pagination__btn--page"
            [class.pagination__btn--active]="paginationConfig.page === totalPages"
            (click)="goToPage(totalPages)"
          >
            {{ totalPages }}
          </button>
        </div>

        <!-- Next Page -->
        <button
          class="pagination__btn pagination__btn--next"
          [class.pagination__btn--disabled]="paginationConfig.page >= totalPages"
          [disabled]="paginationConfig.page >= totalPages"
          (click)="goToPage(paginationConfig.page + 1)"
          [attr.aria-label]="'Go to next page'"
        >
          <span *ngIf="!config.compact" class="pagination__btn-text">Next</span>
          <svg class="pagination__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Last Page -->
        <button
          *ngIf="config.showFirstLast"
          class="pagination__btn pagination__btn--last"
          [class.pagination__btn--disabled]="paginationConfig.page >= totalPages"
          [disabled]="paginationConfig.page >= totalPages"
          (click)="goToPage(totalPages)"
          [attr.aria-label]="'Go to last page'"
        >
          <svg class="pagination__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-lg, 24px);
      padding: var(--spacing-md, 16px) 0;
      flex-wrap: wrap;
    }

    .pagination-container--compact {
      gap: var(--spacing-md, 16px);
      padding: var(--spacing-sm, 8px) 0;
    }

    .pagination__size-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray700, #374151);
    }

    .pagination__size-label {
      font-weight: var(--font-weight-medium, 500);
    }

    .pagination__size-select {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      background: var(--color-neutral-white, #ffffff);
      cursor: pointer;
    }

    .pagination__size-select:focus {
      outline: none;
      border-color: var(--color-primary-500, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .pagination__size-text {
      color: var(--color-neutral-gray600, #4b5563);
    }

    .pagination__info {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
      white-space: nowrap;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }

    .pagination__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      background: var(--color-neutral-white, #ffffff);
      color: var(--color-neutral-gray700, #374151);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
      min-height: 36px;
    }

    .pagination__btn:hover:not(:disabled) {
      background: var(--color-neutral-gray50, #f9fafb);
      border-color: var(--color-neutral-gray400, #9ca3af);
    }

    .pagination__btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .pagination__btn--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .pagination__btn--active {
      background: var(--color-primary-600, #2563eb);
      border-color: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
    }

    .pagination__btn--active:hover {
      background: var(--color-primary-700, #1d4ed8);
      border-color: var(--color-primary-700, #1d4ed8);
    }

    .pagination__btn--first,
    .pagination__btn--last,
    .pagination__btn--prev,
    .pagination__btn--next {
      padding: var(--spacing-sm, 8px);
      min-width: 36px;
    }

    .pagination__btn--compact {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    }

    .pagination__btn-text {
      font-size: var(--font-size-sm, 14px);
    }

    .pagination__icon {
      width: 16px;
      height: 16px;
    }

    .pagination__pages {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      margin: 0 var(--spacing-sm, 8px);
    }

    .pagination__btn--page {
      min-width: 36px;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    }

    .pagination__ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--spacing-sm, 8px);
      color: var(--color-neutral-gray500, #6b7280);
      font-size: var(--font-size-sm, 14px);
      min-height: 36px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md, 16px);
      }

      .pagination__info {
        text-align: center;
        order: -1;
      }

      .pagination__size-selector {
        justify-content: center;
      }

      .pagination {
        justify-content: center;
        flex-wrap: wrap;
      }

      .pagination__pages {
        margin: var(--spacing-xs, 4px) 0;
      }
    }

    @media (max-width: 480px) {
      .pagination__btn {
        padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
        font-size: var(--font-size-xs, 12px);
      }

      .pagination__btn--page {
        min-width: 32px;
        padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      }

      .pagination__pages {
        gap: 2px;
        margin: 0 var(--spacing-xs, 4px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() config: PaginationComponentConfig = {
    showPageSizeSelector: true,
    showPageInfo: true,
    showFirstLast: true,
    compact: false,
    size: 'md'
  };

  @Input() paginationConfig!: PaginationConfig;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  // For backward compatibility with TableComponent
  @Input() set tableConfig(value: any) {
    if (value && typeof value === 'object') {
      Object.assign(this, value);
    }
  }

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.paginationConfig.total / this.paginationConfig.pageSize);
  }

  getStartIndex(): number {
    return Math.max(1, (this.paginationConfig.page - 1) * this.paginationConfig.pageSize + 1);
  }

  getEndIndex(): number {
    return Math.min(this.paginationConfig.total, this.paginationConfig.page * this.paginationConfig.pageSize);
  }

  getVisiblePages(): number[] {
    const total = this.totalPages;
    const current = this.paginationConfig.page;
    const delta = 2; // Number of pages to show on each side of current page

    const range: number[] = [];
    const rangeWithDots: number[] = [];

    // Calculate the range of pages to show
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show first page
    if (current > delta + 1) {
      rangeWithDots.push(1);
    }

    // Add ellipsis after first page if needed
    if (current > delta + 2) {
      rangeWithDots.push(-1); // -1 represents ellipsis
    }

    // Add the range
    rangeWithDots.push(...range);

    // Add ellipsis before last page if needed
    if (current < total - delta - 1) {
      rangeWithDots.push(-2); // -2 represents ellipsis
    }

    // Always show last page
    if (current < total - delta) {
      rangeWithDots.push(total);
    }

    return rangeWithDots.filter(page => page !== -1 && page !== -2);
  }

  showFirstPage(): boolean {
    return this.totalPages > 1;
  }

  showLastPage(): boolean {
    return this.totalPages > 1;
  }

  showFirstEllipsis(): boolean {
    return this.paginationConfig.page > 4; // Show ellipsis if current page > 4
  }

  showLastEllipsis(): boolean {
    return this.paginationConfig.page < this.totalPages - 3; // Show ellipsis if current page < total - 3
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.paginationConfig.page) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const pageSize = parseInt(target.value, 10);
    if (pageSize && pageSize !== this.paginationConfig.pageSize) {
      this.pageSizeChange.emit(pageSize);
    }
  }
}