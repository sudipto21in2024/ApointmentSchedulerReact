import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';
import { TableColumn, PaginationConfig, SelectionChange } from '../../types';

export interface TableAction {
  label: string;
  icon?: string;
  action: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface TableConfig {
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  loading?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  compact?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

export interface TableAction {
  label: string;
  icon?: string;
  action: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="table-container">
      <!-- Loading State -->
      <div *ngIf="config.loading" class="table-loading">
        <div class="table-loading-spinner"></div>
        <span>Loading data...</span>
      </div>

      <!-- Table -->
      <div *ngIf="!config.loading" class="table-wrapper">
        <table
          class="data-table"
          [class.data-table--striped]="config.striped"
          [class.data-table--bordered]="config.bordered"
          [class.data-table--hover]="config.hover"
          [class.data-table--compact]="config.compact"
        >
          <!-- Table Header -->
          <thead class="data-table__header">
            <tr class="data-table__header-row">
              <!-- Selection Column -->
              <th *ngIf="config.selectable" class="data-table__header-cell data-table__cell--selection">
                <input
                  type="checkbox"
                  class="data-table__checkbox"
                  [checked]="isAllSelected()"
                  (change)="onSelectAll()"
                  [indeterminate]="isIndeterminate()"
                />
              </th>

              <!-- Data Columns -->
              <th
                *ngFor="let column of columns; let i = index"
                class="data-table__header-cell"
                [class.data-table__header-cell--sortable]="config.sortable && column.sortable"
                [style.width]="column.width ? column.width + 'px' : 'auto'"
                (click)="config.sortable && column.sortable && onSort(column.field)"
              >
                <div class="data-table__header-content">
                  <span class="data-table__header-text">{{ column.header }}</span>
                  <div *ngIf="config.sortable && column.sortable" class="data-table__sort-icons">
                    <svg
                      class="data-table__sort-icon data-table__sort-icon--asc"
                      [class.data-table__sort-icon--active]="sortField === column.field && sortDirection === 'asc'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                    <svg
                      class="data-table__sort-icon data-table__sort-icon--desc"
                      [class.data-table__sort-icon--active]="sortField === column.field && sortDirection === 'desc'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </th>

              <!-- Actions Column -->
              <th *ngIf="actions && actions.length > 0" class="data-table__header-cell data-table__cell--actions">
                Actions
              </th>
            </tr>

            <!-- Filter Row -->
            <tr *ngIf="config.filterable" class="data-table__filter-row">
              <th *ngIf="config.selectable" class="data-table__filter-cell"></th>
              <th *ngFor="let column of columns" class="data-table__filter-cell">
                <input
                  *ngIf="column.filterable !== false"
                  type="text"
                  class="data-table__filter-input"
                  [placeholder]="'Filter ' + column.header"
                  [value]="filters[column.field] || ''"
                  (input)="onFilter(column.field, $event)"
                />
              </th>
              <th *ngIf="actions && actions.length > 0" class="data-table__filter-cell"></th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="data-table__body">
            <!-- No Data Row -->
            <tr *ngIf="data.length === 0" class="data-table__row data-table__row--empty">
              <td
                [attr.colspan]="getColspan()"
                class="data-table__cell data-table__cell--empty"
              >
                <div class="data-table__empty-state">
                  <svg class="data-table__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span class="data-table__empty-text">{{ emptyMessage || 'No data available' }}</span>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              *ngFor="let row of data; let i = index; trackBy: trackByFn"
              class="data-table__row"
              [class.data-table__row--selected]="isSelected(row)"
              (click)="onRowClick(row)"
            >
              <!-- Selection Column -->
              <td *ngIf="config.selectable" class="data-table__cell data-table__cell--selection">
                <input
                  type="checkbox"
                  class="data-table__checkbox"
                  [checked]="isSelected(row)"
                  (change)="onRowSelect(row, $event)"
                  (click)="$event.stopPropagation()"
                />
              </td>

              <!-- Data Cells -->
              <td
                *ngFor="let column of columns"
                class="data-table__cell"
                [class.data-table__cell--numeric]="column.type === 'number'"
              >
                <div class="data-table__cell-content">
                  <!-- Text Content -->
                  <span *ngIf="!column.template" class="data-table__cell-text">
                    {{ getCellValue(row, column) }}
                  </span>

                  <!-- Template Content -->
                  <ng-container *ngIf="column.template === 'badge'">
                    <span class="data-table__badge" [class]="'data-table__badge--' + getCellValue(row, column)">
                      {{ getCellValue(row, column) }}
                    </span>
                  </ng-container>

                  <ng-container *ngIf="column.template === 'status'">
                    <span class="data-table__status" [class]="'data-table__status--' + getCellValue(row, column)">
                      <span class="data-table__status-dot"></span>
                      {{ getCellValue(row, column) }}
                    </span>
                  </ng-container>

                  <ng-container *ngIf="column.template === 'date'">
                    <span class="data-table__date">
                      {{ formatDate(getCellValue(row, column)) }}
                    </span>
                  </ng-container>

                  <!-- Custom Template -->
                  <ng-content
                    *ngIf="column.template && !['badge', 'status', 'date'].includes(column.template)"
                    [select]="column.template"
                  ></ng-content>
                </div>
              </td>

              <!-- Actions Column -->
              <td *ngIf="actions && actions.length > 0" class="data-table__cell data-table__cell--actions">
                <div class="data-table__actions">
                  <button
                    *ngFor="let action of actions"
                    class="data-table__action-btn"
                    [class]="'data-table__action-btn--' + action.variant"
                    [disabled]="action.disabled || getRowDisabled(row)"
                    (click)="onActionClick(action.action, row, $event)"
                    [title]="action.label"
                  >
                    <i *ngIf="action.icon" [class]="action.icon"></i>
                    <span *ngIf="!action.icon" class="data-table__action-text">{{ action.label }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="config.pagination && paginationData" class="data-table__pagination">
        <app-pagination
          [config]="config"
          [paginationConfig]="paginationData!"
          (pageChange)="handlePageChange($event)"
          (pageSizeChange)="handlePageSizeChange($event)"
        ></app-pagination>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      position: relative;
      width: 100%;
    }

    .table-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-xl, 32px);
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
    }

    .table-loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-neutral-gray300, #d1d5db);
      border-top: 2px solid var(--color-primary-500, #3b82f6);
      border-radius: var(--border-radius-full, 9999px);
      animation: table-spin 1s linear infinite;
    }

    @keyframes table-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: var(--border-radius-md, 8px);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-white, #ffffff);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm, 14px);
    }

    .data-table--striped .data-table__body .data-table__row:nth-child(even) {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .data-table--bordered {
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .data-table--bordered .data-table__header-cell,
    .data-table--bordered .data-table__cell {
      border-right: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .data-table--bordered .data-table__row:last-child .data-table__cell {
      border-bottom: none;
    }

    .data-table--hover .data-table__body .data-table__row:hover {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .data-table--compact {
      font-size: var(--font-size-xs, 12px);
    }

    .data-table--compact .data-table__header-cell,
    .data-table--compact .data-table__cell {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    }

    .data-table__header {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .data-table__header-row {
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .data-table__header-cell {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      text-align: left;
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      position: relative;
    }

    .data-table__header-cell--sortable {
      cursor: pointer;
      user-select: none;
    }

    .data-table__header-cell--sortable:hover {
      background: var(--color-neutral-gray100, #f3f4f6);
    }

    .data-table__header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-xs, 4px);
    }

    .data-table__sort-icons {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .data-table__sort-icon {
      width: 12px;
      height: 12px;
      color: var(--color-neutral-gray400, #9ca3af);
        transition: var(--transition-normal, 0.2s ease);
      }

    .data-table__sort-icon--active {
      color: var(--color-primary-600, #2563eb);
    }

    .data-table__filter-row {
      background: var(--color-neutral-white, #ffffff);
    }

    .data-table__filter-cell {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
    }

    .data-table__filter-input {
      width: 100%;
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-xs, 12px);
      background: var(--color-neutral-white, #ffffff);
    }

    .data-table__filter-input:focus {
      outline: none;
      border-color: var(--color-primary-500, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .data-table__body {
      background: var(--color-neutral-white, #ffffff);
    }

    .data-table__row {
      transition: var(--transition-normal, 0.2s ease);
      cursor: pointer;
    }

    .data-table__row--selected {
      background: var(--color-primary-50, #eff6ff);
    }

    .data-table__row--empty:hover {
      background: transparent;
      cursor: default;
    }

    .data-table__cell {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      border-bottom: 1px solid var(--color-neutral-gray100, #f3f4f6);
      vertical-align: middle;
    }

    .data-table__cell--selection {
      width: 48px;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    }

    .data-table__cell--actions {
      width: 120px;
    }

    .data-table__cell--numeric {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .data-table__cell--empty {
      text-align: center;
      padding: var(--spacing-xl, 32px) var(--spacing-md, 16px);
      color: var(--color-neutral-gray500, #6b7280);
    }

    .data-table__cell-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
    }

    .data-table__cell-text {
      color: var(--color-neutral-gray900, #111827);
    }

    .data-table__badge {
      display: inline-flex;
      align-items: center;
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      border-radius: var(--border-radius-full, 9999px);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table__badge--active {
      background: var(--color-success-100, #dcfce7);
      color: var(--color-success-800, #166534);
    }

    .data-table__badge--inactive {
      background: var(--color-neutral-100, #f3f4f6);
      color: var(--color-neutral-800, #1f2937);
    }

    .data-table__badge--pending {
      background: var(--color-warning-100, #fef3c7);
      color: var(--color-warning-800, #92400e);
    }

    .data-table__status {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
    }

    .data-table__status-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--border-radius-full, 9999px);
    }

    .data-table__status--online .data-table__status-dot {
      background: var(--color-success-500, #10b981);
    }

    .data-table__status--offline .data-table__status-dot {
      background: var(--color-neutral-400, #9ca3af);
    }

    .data-table__status--busy .data-table__status-dot {
      background: var(--color-warning-500, #f59e0b);
    }

    .data-table__date {
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-xs, 12px);
    }

    .data-table__checkbox {
      width: 16px;
      height: 16px;
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-sm, 4px);
      background: var(--color-neutral-white, #ffffff);
      cursor: pointer;
    }

    .data-table__checkbox:checked {
      background: var(--color-primary-600, #2563eb);
      border-color: var(--color-primary-600, #2563eb);
    }

    .data-table__checkbox:indeterminate {
      background: var(--color-primary-600, #2563eb);
      border-color: var(--color-primary-600, #2563eb);
    }

    .data-table__checkbox:focus {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .data-table__empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm, 8px);
    }

    .data-table__empty-icon {
      width: 48px;
      height: 48px;
      color: var(--color-neutral-gray400, #9ca3af);
    }

    .data-table__empty-text {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray500, #6b7280);
    }

    .data-table__actions {
      display: flex;
      gap: var(--spacing-xs, 4px);
    }

    .data-table__action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      border: none;
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-xs, 12px);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .data-table__action-btn--primary {
      background: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
    }

    .data-table__action-btn--primary:hover:not(:disabled) {
      background: var(--color-primary-700, #1d4ed8);
    }

    .data-table__action-btn--secondary {
      background: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray700, #374151);
    }

    .data-table__action-btn--secondary:hover:not(:disabled) {
      background: var(--color-neutral-gray200, #e5e7eb);
    }

    .data-table__action-btn--danger {
      background: var(--color-error-600, #dc2626);
      color: var(--color-neutral-white, #ffffff);
    }

    .data-table__action-btn--danger:hover:not(:disabled) {
      background: var(--color-error-700, #b91c1c);
    }

    .data-table__action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .data-table__action-text {
      font-size: var(--font-size-xs, 12px);
    }

    .data-table__pagination {
      margin-top: var(--spacing-md, 16px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .data-table__header-cell,
      .data-table__cell {
        padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      }

      .data-table__actions {
        flex-direction: column;
        gap: var(--spacing-xs, 4px);
      }

      .data-table__action-btn {
        justify-content: center;
        padding: var(--spacing-sm, 8px);
      }

      .data-table__filter-input {
        font-size: var(--font-size-xs, 12px);
        padding: var(--spacing-xs, 4px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input() config: TableConfig = {
    selectable: false,
    sortable: true,
    filterable: false,
    loading: false,
    striped: true,
    bordered: false,
    hover: true,
    compact: false,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions?: TableAction[];
  @Input() emptyMessage?: string;
  @Input() paginationData?: PaginationConfig;

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<SelectionChange>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() filterChange = new EventEmitter<{ [key: string]: string }>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  selectedItems: any[] = [];
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filters: { [key: string]: string } = {};

  getColspan(): number {
    let colspan = this.columns.length;
    if (this.config.selectable) colspan++;
    if (this.actions && this.actions.length > 0) colspan++;
    return colspan;
  }

  isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedItems.length === this.data.length;
  }

  isIndeterminate(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.data.length;
  }

  isSelected(row: any): boolean {
    return this.selectedItems.includes(row);
  }

  getRowDisabled(row: any): boolean {
    // This can be customized based on row data
    return false;
  }

  getCellValue(row: any, column: TableColumn): any {
    return row[column.field];
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onRowSelect(row: any, event: Event): void {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedItems.push(row);
    } else {
      const index = this.selectedItems.indexOf(row);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }

    this.selectionChange.emit({
      selected: this.selectedItems,
      unselected: checked ? [] : [row]
    });
  }

  onSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedItems = [];
      this.selectionChange.emit({ selected: [], unselected: this.data });
    } else {
      this.selectedItems = [...this.data];
      this.selectionChange.emit({ selected: this.selectedItems, unselected: [] });
    }
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({
      field: this.sortField,
      direction: this.sortDirection
    });
  }

  onFilter(field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filters[field] = value;
    this.filterChange.emit(this.filters);
  }

  onActionClick(action: string, row: any, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSizeChange.emit(pageSize);
  }

  handlePageChange(page: number): void {
    this.onPageChange(page);
  }

  handlePageSizeChange(pageSize: number): void {
    this.onPageSizeChange(pageSize);
  }
}