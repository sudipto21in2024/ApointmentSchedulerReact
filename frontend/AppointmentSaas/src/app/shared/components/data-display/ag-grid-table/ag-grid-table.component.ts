import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  GridOptions
} from 'ag-grid-community';

export interface AgGridColumn extends ColDef {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filter?: boolean | 'text' | 'number' | 'date';
  resizable?: boolean;
  editable?: boolean;
  cellRenderer?: string | Function;
  cellRendererParams?: any;
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => any;
  cellClass?: string | string[] | ((params: any) => string | string[]);
  headerClass?: string | string[];
  suppressMenu?: boolean;
  suppressSorting?: boolean;
  suppressFilter?: boolean;
}

export interface DataRequest {
  page?: number;
  pageSize?: number;
  sortModel?: any[];
  filterModel?: any;
  globalFilter?: string;
}

export interface DataResponse {
  data: any[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface AgGridTableConfig {
  height?: number;
  width?: string;
  enableRangeSelection?: boolean;
  suppressRowClickSelection?: boolean;
  rowSelection?: 'single' | 'multiple';
  rowMultiSelectWithClick?: boolean;
  suppressCellFocus?: boolean;
  enableCellTextSelection?: boolean;
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[];
  domLayout?: 'normal' | 'autoHeight' | 'print';
  rowHeight?: number;
  headerHeight?: number;
  suppressPaginationPanel?: boolean;
  enableBrowserTooltips?: boolean;
}

@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  template: `
    <div class="ag-grid-table-container">
      <!-- Table Header -->
      <div *ngIf="title || subtitle || showToolbar" class="ag-grid-table__header">
        <div class="ag-grid-table__title-section">
          <h3 *ngIf="title" class="ag-grid-table__title">{{ title }}</h3>
          <p *ngIf="subtitle" class="ag-grid-table__subtitle">{{ subtitle }}</p>
        </div>

        <!-- Toolbar -->
        <div *ngIf="showToolbar" class="ag-grid-table__toolbar">
          <!-- Global Search -->
          <div *ngIf="enableGlobalSearch" class="ag-grid-table__search">
            <input
              type="text"
              class="ag-grid-table__search-input"
              placeholder="Search..."
              [(ngModel)]="globalSearchText"
              (input)="onGlobalSearch($event)"
            />
            <svg class="ag-grid-table__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <!-- Export Button -->
          <button
            *ngIf="enableExport"
            class="ag-grid-table__export-btn"
            (click)="onExport()"
            [disabled]="loading"
          >
            <svg class="ag-grid-table__export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l4-4m-4 4l-4-4m8 2h3m-3 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Export
          </button>

          <!-- Refresh Button -->
          <button
            class="ag-grid-table__refresh-btn"
            (click)="onRefresh()"
            [disabled]="loading"
          >
            <svg class="ag-grid-table__refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" class="ag-grid-table__loading">
        <div class="ag-grid-table__loading-spinner"></div>
        <span class="ag-grid-table__loading-text">{{ loadingText }}</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="ag-grid-table__error">
        <svg class="ag-grid-table__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <div class="ag-grid-table__error-content">
          <h4 class="ag-grid-table__error-title">Error Loading Data</h4>
          <p class="ag-grid-table__error-message">{{ error }}</p>
          <button class="ag-grid-table__retry-btn" (click)="onRetry()">Try Again</button>
        </div>
      </div>

      <!-- AG Grid -->
      <div
        *ngIf="!loading && !error"
        class="ag-grid-table__grid"
        [style.height.px]="config.height || 400"
        [style.width]="config.width || '100%'"
      >
        <ag-grid-angular
          #agGrid
          [gridOptions]="gridOptions"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [rowData]="data"
          [pagination]="config.pagination !== false"
          [paginationPageSize]="config.paginationPageSize || 50"
          [paginationPageSizeSelector]="config.paginationPageSizeSelector || [20, 50, 100, 200]"
          [rowSelection]="config.rowSelection || 'multiple'"
          [suppressRowClickSelection]="config.suppressRowClickSelection || false"
          [enableRangeSelection]="config.enableRangeSelection || false"
          (gridReady)="onGridReady($event)"
          (selectionChanged)="onSelectionChanged($event)"
          (filterChanged)="onFilterChanged($event)"
          (sortChanged)="onSortChanged($event)"
          (firstDataRendered)="onFirstDataRendered($event)"
          class="ag-theme-alpine"
        >
        </ag-grid-angular>
      </div>

      <!-- Table Footer -->
      <div *ngIf="showFooter && !loading && !error" class="ag-grid-table__footer">
        <div class="ag-grid-table__footer-info">
          <span *ngIf="selectedRows.length > 0" class="ag-grid-table__selection-info">
            {{ selectedRows.length }} row{{ selectedRows.length > 1 ? 's' : '' }} selected
          </span>
          <span *ngIf="totalRows > 0" class="ag-grid-table__total-info">
            Total: {{ totalRows }} row{{ totalRows > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Custom Actions -->
        <div *ngIf="customActions && customActions.length > 0" class="ag-grid-table__custom-actions">
          <button
            *ngFor="let action of customActions"
            class="ag-grid-table__custom-action"
            [class]="'ag-grid-table__custom-action--' + action.variant"
            [disabled]="action.disabled || (action.requiresSelection && selectedRows.length === 0)"
            (click)="onCustomAction(action.action)"
          >
            <i *ngIf="action.icon" [class]="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ag-grid-table-container {
      position: relative;
      width: 100%;
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-md, 8px);
      border: 1px solid var(--color-neutral-gray200, #e5e7eb);
      overflow: hidden;
    }

    .ag-grid-table__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg, 24px);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .ag-grid-table__title-section {
      flex: 1;
    }

    .ag-grid-table__title {
      margin: 0 0 var(--spacing-xs, 4px) 0;
      font-size: var(--font-size-xl, 20px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
    }

    .ag-grid-table__subtitle {
      margin: 0;
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
    }

    .ag-grid-table__toolbar {
      display: flex;
      align-items: center;
      gap: var(--spacing-md, 16px);
    }

    .ag-grid-table__search {
      position: relative;
    }

    .ag-grid-table__search-input {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px) var(--spacing-sm, 8px) 40px;
      border: 1px solid var(--color-neutral-gray300, #d1d5db);
      border-radius: var(--border-radius-md, 8px);
      font-size: var(--font-size-sm, 14px);
      background: var(--color-neutral-white, #ffffff);
      min-width: 200px;
    }

    .ag-grid-table__search-input:focus {
      outline: none;
      border-color: var(--color-primary-500, #3b82f6);
      box-shadow: 0 0 0 3px var(--color-primary-100, #dbeafe);
    }

    .ag-grid-table__search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--color-neutral-gray400, #9ca3af);
    }

    .ag-grid-table__export-btn,
    .ag-grid-table__refresh-btn {
      display: flex;
      align-items: center;
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
    }

    .ag-grid-table__export-btn:hover:not(:disabled),
    .ag-grid-table__refresh-btn:hover:not(:disabled) {
      background: var(--color-neutral-gray50, #f9fafb);
      border-color: var(--color-neutral-gray400, #9ca3af);
    }

    .ag-grid-table__export-btn:disabled,
    .ag-grid-table__refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ag-grid-table__export-icon,
    .ag-grid-table__refresh-icon {
      width: 16px;
      height: 16px;
    }

    .ag-grid-table__loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm, 8px);
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
    }

    .ag-grid-table__loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-neutral-gray200, #e5e7eb);
      border-top: 3px solid var(--color-primary-500, #3b82f6);
      border-radius: var(--border-radius-full, 9999px);
      animation: ag-grid-spin 1s linear infinite;
    }

    @keyframes ag-grid-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .ag-grid-table__loading-text {
      color: var(--color-neutral-gray600, #4b5563);
      font-size: var(--font-size-sm, 14px);
    }

    .ag-grid-table__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl, 32px);
      text-align: center;
      gap: var(--spacing-md, 16px);
    }

    .ag-grid-table__error-icon {
      width: 48px;
      height: 48px;
      color: var(--color-error-500, #ef4444);
    }

    .ag-grid-table__error-content {
      max-width: 400px;
    }

    .ag-grid-table__error-title {
      margin: 0 0 var(--spacing-xs, 4px) 0;
      font-size: var(--font-size-lg, 18px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
    }

    .ag-grid-table__error-message {
      margin: 0 0 var(--spacing-md, 16px) 0;
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
    }

    .ag-grid-table__retry-btn {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      background: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
      border: none;
      border-radius: var(--border-radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      font-weight: var(--font-weight-medium, 500);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .ag-grid-table__retry-btn:hover {
      background: var(--color-primary-700, #1d4ed8);
    }

    .ag-grid-table__grid {
      position: relative;
    }

    .ag-grid-table__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
      border-top: 1px solid var(--color-neutral-gray200, #e5e7eb);
      background: var(--color-neutral-gray50, #f9fafb);
    }

    .ag-grid-table__footer-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md, 16px);
      font-size: var(--font-size-sm, 14px);
      color: var(--color-neutral-gray600, #4b5563);
    }

    .ag-grid-table__selection-info {
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-primary-600, #2563eb);
    }

    .ag-grid-table__custom-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
    }

    .ag-grid-table__custom-action {
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

    .ag-grid-table__custom-action--primary {
      background: var(--color-primary-600, #2563eb);
      color: var(--color-neutral-white, #ffffff);
    }

    .ag-grid-table__custom-action--primary:hover:not(:disabled) {
      background: var(--color-primary-700, #1d4ed8);
    }

    .ag-grid-table__custom-action--secondary {
      background: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray700, #374151);
    }

    .ag-grid-table__custom-action--secondary:hover:not(:disabled) {
      background: var(--color-neutral-gray200, #e5e7eb);
    }

    .ag-grid-table__custom-action--danger {
      background: var(--color-error-600, #dc2626);
      color: var(--color-neutral-white, #ffffff);
    }

    .ag-grid-table__custom-action--danger:hover:not(:disabled) {
      background: var(--color-error-700, #b91c1c);
    }

    .ag-grid-table__custom-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* AG Grid Theme Customization */
    :host ::ng-deep .ag-theme-alpine {
      --ag-foreground-color: var(--color-neutral-gray900, #111827);
      --ag-background-color: var(--color-neutral-white, #ffffff);
      --ag-secondary-foreground-color: var(--color-neutral-gray600, #4b5563);
      --ag-data-color: var(--color-neutral-gray900, #111827);
      --ag-header-foreground-color: var(--color-neutral-gray700, #374151);
      --ag-header-background-color: var(--color-neutral-gray50, #f9fafb);
      --ag-header-height: 48px;
      --ag-row-height: 40px;
      --ag-selected-row-background-color: var(--color-primary-50, #eff6ff);
      --ag-range-selection-background-color: var(--color-primary-100, #dbeafe);
      --ag-border-color: var(--color-neutral-gray200, #e5e7eb);
      --ag-row-border-color: var(--color-neutral-gray100, #f3f4f6);
    }

    :host ::ng-deep .ag-theme-alpine .ag-header-cell {
      font-weight: var(--font-weight-semibold, 600);
      font-size: var(--font-size-sm, 14px);
    }

    :host ::ng-deep .ag-theme-alpine .ag-row {
      transition: var(--transition-normal, 0.2s ease);
    }

    :host ::ng-deep .ag-theme-alpine .ag-row:hover {
      background: var(--color-neutral-gray50, #f9fafb);
    }

    :host ::ng-deep .ag-theme-alpine .ag-cell {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      font-size: var(--font-size-sm, 14px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .ag-grid-table__header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-md, 16px);
        padding: var(--spacing-md, 16px);
      }

      .ag-grid-table__toolbar {
        flex-wrap: wrap;
        gap: var(--spacing-sm, 8px);
      }

      .ag-grid-table__search-input {
        min-width: 150px;
      }

      .ag-grid-table__footer {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm, 8px);
        padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
      }

      .ag-grid-table__footer-info {
        justify-content: center;
      }

      .ag-grid-table__custom-actions {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .ag-grid-table__toolbar {
        flex-direction: column;
        width: 100%;
      }

      .ag-grid-table__search {
        width: 100%;
      }

      .ag-grid-table__search-input {
        width: 100%;
        min-width: auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridTableComponent implements OnChanges {
  @Input() config: AgGridTableConfig = {
    height: 400,
    paginationPageSize: 50,
    paginationPageSizeSelector: [20, 50, 100, 200],
    rowSelection: 'multiple'
  };

  @Input() columns: AgGridColumn[] = [];
  @Input() data: any[] = [];
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() showToolbar = true;
  @Input() showFooter = true;
  @Input() enableGlobalSearch = true;
  @Input() enableExport = true;
  @Input() loading = false;
  @Input() loadingText = 'Loading data...';
  @Input() error?: string;
  @Input() customActions?: Array<{
    label: string;
    icon?: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    requiresSelection?: boolean;
  }>;

  @Output() dataLoad = new EventEmitter<DataRequest>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() exportRequest = new EventEmitter<void>();
  @Output() refreshRequest = new EventEmitter<void>();
  @Output() customActionClick = new EventEmitter<string>();

  gridApi?: GridApi;
  globalSearchText = '';
  selectedRows: any[] = [];
  totalRows = 0;
  currentPage = 0;
  pageSize = 50;
  sortModel: any[] = [];
  filterModel: any = {};

  get gridOptions(): GridOptions {
    return {
      ...this.config,
      onRowClicked: (event) => this.rowClick.emit(event.data),
      onSelectionChanged: (event) => this.onSelectionChanged(event),
      onFilterChanged: (event) => this.onFilterChanged(event),
      onSortChanged: (event) => this.onSortChanged(event),
      onFirstDataRendered: (event) => this.onFirstDataRendered(event)
    };
  }

  get columnDefs(): ColDef[] {
    return this.columns.map(col => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      sortable: col.sortable,
      filter: col.filter,
      resizable: col.resizable,
      editable: col.editable,
      cellRenderer: col.cellRenderer,
      cellRendererParams: col.cellRendererParams,
      valueFormatter: col.valueFormatter,
      valueGetter: col.valueGetter,
      cellClass: col.cellClass,
      headerClass: col.headerClass,
      suppressMenu: col.suppressMenu,
      suppressSorting: col.suppressSorting,
      suppressFilter: col.suppressFilter
    }));
  }

  get defaultColDef(): ColDef {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100
    };
  }

  // For client-side row model, we'll use a simple approach

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading'] && this.gridApi) {
      if (this.loading) {
        this.gridApi.showLoadingOverlay();
      } else {
        this.gridApi.hideOverlay();
      }
    }
    if (changes['data'] && !changes['data'].firstChange) {
      this.refreshGridData();
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    if (this.loading) {
      this.gridApi.showLoadingOverlay();
    }
  }

  onSelectionChanged(event: any): void {
    this.selectedRows = this.gridApi?.getSelectedRows() || [];
    this.selectionChange.emit(this.selectedRows);
  }

  onFilterChanged(event: any): void {
    this.filterModel = this.gridApi?.getFilterModel() || {};
    this.loadDataFromServer();
  }

  onSortChanged(event: any): void {
    // Sort model is handled by AG Grid internally for client-side
    // For server-side coordination, we would need to extract from event
    this.loadDataFromServer();
  }

  onFirstDataRendered(event: any): void {
    // Grid is ready for interaction
  }

  onGlobalSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.gridApi?.setGridOption('quickFilterText', searchValue);
  }

  onExport(): void {
    this.exportRequest.emit();
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: `${this.title || 'data'}_export.csv`
      });
    }
  }

  onRefresh(): void {
    this.refreshRequest.emit();
    this.loadDataFromServer();
  }

  onRetry(): void {
    this.error = undefined;
    this.onRefresh();
  }

  onCustomAction(action: string): void {
    this.customActionClick.emit(action);
  }

  private loadDataFromServer(): void {
    const request: DataRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortModel: this.sortModel,
      filterModel: this.filterModel,
      globalFilter: this.globalSearchText
    };

    this.dataLoad.emit(request);
  }

  private refreshGridData(): void {
    if (this.gridApi) {
      // For client-side row model, update the grid data
      this.totalRows = this.data.length;
      // The grid will automatically update when data input changes
    }
  }

  // Public API methods for parent components
  refreshData(): void {
    this.loadDataFromServer();
  }

  clearSelection(): void {
    if (this.gridApi) {
      this.gridApi.deselectAll();
    }
  }

  selectAll(): void {
    if (this.gridApi) {
      this.gridApi.selectAll();
    }
  }

  getSelectedRows(): any[] {
    return this.selectedRows;
  }

  setData(data: any[]): void {
    this.data = data;
    this.totalRows = data.length;
    this.refreshGridData();
  }

  setTotalRows(total: number): void {
    this.totalRows = total;
  }

  exportToCsv(filename?: string): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: filename || `${this.title || 'data'}_export.csv`
      });
    }
  }

  sizeColumnsToFit(): void {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  autoSizeAllColumns(): void {
    if (this.gridApi) {
      const allColumnIds: string[] = [];
      this.gridApi.getColumns()?.forEach(column => {
        allColumnIds.push(column.getId());
      });
      this.gridApi.autoSizeColumns(allColumnIds);
    }
  }
}