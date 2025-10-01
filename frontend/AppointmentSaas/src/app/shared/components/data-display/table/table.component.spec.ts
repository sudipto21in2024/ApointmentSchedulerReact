import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableAction } from './table.component';
import { TableColumn } from '../../types';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const mockColumns: TableColumn[] = [
    { field: 'id', header: 'ID', type: 'number', sortable: true },
    { field: 'name', header: 'Name', type: 'text', sortable: true },
    { field: 'status', header: 'Status', type: 'text', template: 'status' },
    { field: 'createdAt', header: 'Created', type: 'date' }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', status: 'active', createdAt: '2023-01-01' },
    { id: 2, name: 'Jane Smith', status: 'inactive', createdAt: '2023-01-02' },
    { id: 3, name: 'Bob Johnson', status: 'pending', createdAt: '2023-01-03' }
  ];

  const mockActions: TableAction[] = [
    { label: 'Edit', icon: 'fas fa-edit', action: 'edit', variant: 'primary' },
    { label: 'Delete', icon: 'fas fa-trash', action: 'delete', variant: 'danger' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    component.data = mockData;
    component.actions = mockActions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.selectable).toBe(false);
    expect(component.config.sortable).toBe(true);
    expect(component.config.filterable).toBe(false);
    expect(component.config.loading).toBe(false);
    expect(component.config.striped).toBe(true);
    expect(component.config.bordered).toBe(false);
    expect(component.config.hover).toBe(true);
    expect(component.config.compact).toBe(false);
    expect(component.config.pagination).toBe(true);
    expect(component.config.pageSize).toBe(10);
  });

  it('should display data rows', () => {
    const rows = fixture.nativeElement.querySelectorAll('.data-table__row');
    expect(rows.length).toBe(3); // 3 data rows
  });

  it('should display column headers', () => {
    const headerCells = fixture.nativeElement.querySelectorAll('.data-table__header-cell');
    expect(headerCells.length).toBe(5); // 4 columns + 1 actions column
    expect(headerCells[1].textContent.trim()).toBe('Name');
    expect(headerCells[2].textContent.trim()).toBe('Status');
  });

  it('should show empty state when no data', () => {
    component.data = [];
    fixture.detectChanges();

    const emptyRow = fixture.nativeElement.querySelector('.data-table__row--empty');
    const emptyCell = fixture.nativeElement.querySelector('.data-table__cell--empty');

    expect(emptyRow).toBeTruthy();
    expect(emptyCell).toBeTruthy();
  });

  it('should display custom empty message', () => {
    component.data = [];
    component.emptyMessage = 'No records found';
    fixture.detectChanges();

    const emptyText = fixture.nativeElement.querySelector('.data-table__empty-text');
    expect(emptyText.textContent.trim()).toBe('No records found');
  });

  it('should show loading state', () => {
    component.config.loading = true;
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('.table-loading');
    expect(loading).toBeTruthy();
    expect(loading.textContent.trim()).toBe('Loading data...');
  });

  it('should hide table when loading', () => {
    component.config.loading = true;
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('.data-table');
    expect(table).toBeFalsy();
  });

  it('should show selection column when selectable', () => {
    component.config.selectable = true;
    fixture.detectChanges();

    const selectionHeader = fixture.nativeElement.querySelector('.data-table__cell--selection');
    expect(selectionHeader).toBeTruthy();
  });

  it('should show actions column when actions provided', () => {
    const actionsHeader = fixture.nativeElement.querySelector('.data-table__cell--actions');
    expect(actionsHeader).toBeTruthy();
    expect(actionsHeader.textContent.trim()).toBe('Actions');
  });

  it('should display action buttons', () => {
    const actionButtons = fixture.nativeElement.querySelectorAll('.data-table__action-btn');
    expect(actionButtons.length).toBe(6); // 2 actions × 3 rows
  });

  it('should apply correct colspan for empty state', () => {
    const emptyCell = fixture.nativeElement.querySelector('.data-table__cell--empty');
    expect(emptyCell.getAttribute('colspan')).toBe('5'); // 4 columns + 1 actions column
  });

  it('should handle row click', () => {
    spyOn(component.rowClick, 'emit');

    const firstRow = fixture.nativeElement.querySelector('.data-table__row');
    firstRow.click();

    expect(component.rowClick.emit).toHaveBeenCalledWith(mockData[0]);
  });

  it('should handle action click', () => {
    spyOn(component.actionClick, 'emit');

    const firstActionBtn = fixture.nativeElement.querySelector('.data-table__action-btn');
    firstActionBtn.click();

    expect(component.actionClick.emit).toHaveBeenCalledWith({
      action: 'edit',
      row: mockData[0]
    });
  });

  it('should handle sorting', () => {
    spyOn(component.sortChange, 'emit');

    component.onSort('name');

    expect(component.sortField).toBe('name');
    expect(component.sortDirection).toBe('asc');
    expect(component.sortChange.emit).toHaveBeenCalledWith({
      field: 'name',
      direction: 'asc'
    });
  });

  it('should toggle sort direction on same field', () => {
    component.sortField = 'name';
    component.sortDirection = 'asc';

    component.onSort('name');

    expect(component.sortDirection).toBe('desc');
  });

  it('should handle filtering', () => {
    spyOn(component.filterChange, 'emit');

    const mockEvent = { target: { value: 'test' } } as any;
    component.onFilter('name', mockEvent);

    expect(component.filters['name']).toBe('test');
    expect(component.filterChange.emit).toHaveBeenCalledWith({ name: 'test' });
  });

  it('should get cell value correctly', () => {
    const row = mockData[0];
    const column = mockColumns[0]; // id column

    const value = component.getCellValue(row, column);
    expect(value).toBe(1);
  });

  it('should format date correctly', () => {
    const dateStr = '2023-01-01';
    const formatted = component.formatDate(dateStr);
    expect(formatted).toBe(new Date(dateStr).toLocaleDateString());
  });

  it('should track by function correctly', () => {
    const trackByFn = component.trackByFn;

    expect(trackByFn(0, mockData[0])).toBe(1); // id field
    expect(trackByFn(1, mockData[1])).toBe(2); // id field
  });

  it('should handle selection when selectable', () => {
    component.config.selectable = true;
    spyOn(component.selectionChange, 'emit');
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('.data-table__checkbox');
    checkbox.click();

    expect(component.selectedItems.length).toBe(1);
    expect(component.selectionChange.emit).toHaveBeenCalled();
  });

  it('should handle select all', () => {
    component.config.selectable = true;
    spyOn(component.selectionChange, 'emit');
    fixture.detectChanges();

    component.onSelectAll();

    expect(component.selectedItems.length).toBe(3);
    expect(component.selectionChange.emit).toHaveBeenCalledWith({
      selected: component.selectedItems,
      unselected: []
    });
  });

  it('should handle page change', () => {
    spyOn(component.pageChange, 'emit');
    component.onPageChange(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should handle page size change', () => {
    spyOn(component.pageSizeChange, 'emit');
    component.onPageSizeChange(25);
    expect(component.pageSizeChange.emit).toHaveBeenCalledWith(25);
  });

  it('should have proper table structure', () => {
    const table = fixture.nativeElement.querySelector('.data-table');
    const header = fixture.nativeElement.querySelector('.data-table__header');
    const body = fixture.nativeElement.querySelector('.data-table__body');

    expect(table).toBeTruthy();
    expect(header).toBeTruthy();
    expect(body).toBeTruthy();
  });
});