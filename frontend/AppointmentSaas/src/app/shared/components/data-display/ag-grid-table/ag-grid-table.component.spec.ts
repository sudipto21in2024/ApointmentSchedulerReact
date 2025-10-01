import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridTableComponent, AgGridColumn } from './ag-grid-table.component';

describe('AgGridTableComponent', () => {
  let component: AgGridTableComponent;
  let fixture: ComponentFixture<AgGridTableComponent>;

  const mockColumns: AgGridColumn[] = [
    {
      field: 'id',
      headerName: 'ID',
      sortable: true,
      filter: 'number',
      width: 100
    },
    {
      field: 'name',
      headerName: 'Name',
      sortable: true,
      filter: 'text',
      minWidth: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: 'text',
      width: 120
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      sortable: true,
      filter: 'text',
      width: 140
    }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', status: 'active', createdAt: '2023-01-01' },
    { id: 2, name: 'Jane Smith', status: 'inactive', createdAt: '2023-01-02' },
    { id: 3, name: 'Bob Johnson', status: 'pending', createdAt: '2023-01-03' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgGridTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AgGridTableComponent);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.height).toBe(400);
    expect(component.config.paginationPageSize).toBe(50);
    expect(component.config.paginationPageSizeSelector).toEqual([20, 50, 100, 200]);
    expect(component.config.rowSelection).toBe('multiple');
  });

  it('should display title when provided', () => {
    component.title = 'User Management';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.ag-grid-table__title');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('User Management');
  });

  it('should display subtitle when provided', () => {
    component.subtitle = 'Manage system users and permissions';
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.ag-grid-table__subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent.trim()).toBe('Manage system users and permissions');
  });

  it('should show toolbar when enabled', () => {
    const toolbar = fixture.nativeElement.querySelector('.ag-grid-table__toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should hide toolbar when disabled', () => {
    component.showToolbar = false;
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('.ag-grid-table__toolbar');
    expect(toolbar).toBeFalsy();
  });

  it('should show global search when enabled', () => {
    const search = fixture.nativeElement.querySelector('.ag-grid-table__search');
    expect(search).toBeTruthy();
  });

  it('should hide global search when disabled', () => {
    component.enableGlobalSearch = false;
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector('.ag-grid-table__search');
    expect(search).toBeFalsy();
  });

  it('should show export button when enabled', () => {
    const exportBtn = fixture.nativeElement.querySelector('.ag-grid-table__export-btn');
    expect(exportBtn).toBeTruthy();
  });

  it('should hide export button when disabled', () => {
    component.enableExport = false;
    fixture.detectChanges();

    const exportBtn = fixture.nativeElement.querySelector('.ag-grid-table__export-btn');
    expect(exportBtn).toBeFalsy();
  });

  it('should show refresh button', () => {
    const refreshBtn = fixture.nativeElement.querySelector('.ag-grid-table__refresh-btn');
    expect(refreshBtn).toBeTruthy();
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('.ag-grid-table__loading');
    expect(loading).toBeTruthy();
    expect(loading.textContent.trim()).toBe('Loading data...');
  });

  it('should show error state', () => {
    component.error = 'Failed to load data';
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.ag-grid-table__error');
    const errorText = fixture.nativeElement.querySelector('.ag-grid-table__error-message');

    expect(error).toBeTruthy();
    expect(errorText.textContent.trim()).toBe('Failed to load data');
  });

  it('should show retry button when error occurs', () => {
    component.error = 'Failed to load data';
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('.ag-grid-table__retry-btn');
    expect(retryBtn).toBeTruthy();
  });

  it('should show footer when enabled', () => {
    const footer = fixture.nativeElement.querySelector('.ag-grid-table__footer');
    expect(footer).toBeTruthy();
  });

  it('should hide footer when disabled', () => {
    component.showFooter = false;
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.ag-grid-table__footer');
    expect(footer).toBeFalsy();
  });

  it('should display custom actions when provided', () => {
    component.customActions = [
      { label: 'Edit', action: 'edit', variant: 'primary' },
      { label: 'Delete', action: 'delete', variant: 'danger' }
    ];
    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelectorAll('.ag-grid-table__custom-action');
    expect(actions.length).toBe(2);
  });

  it('should handle global search input', () => {
    const mockGridApi = {
      setGridOption: jasmine.createSpy('setGridOption')
    };
    (component as any).gridApi = mockGridApi;

    const mockEvent = { target: { value: 'test search' } } as any;
    component.onGlobalSearch(mockEvent);

    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'test search');
  });

  it('should handle export request', () => {
    spyOn(component.exportRequest, 'emit');

    component.onExport();

    expect(component.exportRequest.emit).toHaveBeenCalled();
  });

  it('should handle refresh request', () => {
    spyOn(component.refreshRequest, 'emit');

    component.onRefresh();

    expect(component.refreshRequest.emit).toHaveBeenCalled();
  });

  it('should handle retry action', () => {
    component.error = 'Test error';
    spyOn(component.refreshRequest, 'emit');

    component.onRetry();

    expect(component.error).toBeUndefined();
    expect(component.refreshRequest.emit).toHaveBeenCalled();
  });

  it('should handle custom action click', () => {
    spyOn(component.customActionClick, 'emit');

    component.onCustomAction('edit');

    expect(component.customActionClick.emit).toHaveBeenCalledWith('edit');
  });

  it('should display loading text when provided', () => {
    component.loadingText = 'Fetching records...';
    component.loading = true;
    fixture.detectChanges();

    const loadingText = fixture.nativeElement.querySelector('.ag-grid-table__loading-text');
    expect(loadingText.textContent.trim()).toBe('Fetching records...');
  });

  it('should show selection info when rows selected', () => {
    component.selectedRows = [{ id: 1 }, { id: 2 }];
    fixture.detectChanges();

    const selectionInfo = fixture.nativeElement.querySelector('.ag-grid-table__selection-info');
    expect(selectionInfo).toBeTruthy();
    expect(selectionInfo.textContent.trim()).toBe('2 rows selected');
  });

  it('should show total info when data available', () => {
    component.totalRows = 150;
    fixture.detectChanges();

    const totalInfo = fixture.nativeElement.querySelector('.ag-grid-table__total-info');
    expect(totalInfo).toBeTruthy();
    expect(totalInfo.textContent.trim()).toBe('Total: 150 rows');
  });

  it('should handle grid ready event', () => {
    const mockApi = {
      showLoadingOverlay: jasmine.createSpy('showLoadingOverlay'),
      hideOverlay: jasmine.createSpy('hideOverlay')
    } as any;

    const mockEvent = { api: mockApi } as any;
    component.onGridReady(mockEvent);

    expect((component as any).gridApi).toBe(mockApi);
  });

  it('should handle selection change', () => {
    spyOn(component.selectionChange, 'emit');

    const mockEvent = {
      api: {
        getSelectedRows: () => [{ id: 1 }, { id: 2 }]
      }
    } as any;

    component.onSelectionChanged(mockEvent);

    expect(component.selectedRows).toEqual([{ id: 1 }, { id: 2 }]);
    expect(component.selectionChange.emit).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('should generate correct column definitions', () => {
    const columnDefs = component.columnDefs;
    expect(columnDefs.length).toBe(4);
    expect(columnDefs[0].field).toBe('id');
    expect(columnDefs[0].headerName).toBe('ID');
    expect(columnDefs[1].filter).toBe('text');
  });

  it('should have correct default column definition', () => {
    const defaultColDef = component.defaultColDef;
    expect(defaultColDef.sortable).toBe(true);
    expect(defaultColDef.filter).toBe(true);
    expect(defaultColDef.resizable).toBe(true);
    expect(defaultColDef.minWidth).toBe(100);
  });

  it('should have proper component structure', () => {
    const container = fixture.nativeElement.querySelector('.ag-grid-table-container');
    const header = fixture.nativeElement.querySelector('.ag-grid-table__header');
    const toolbar = fixture.nativeElement.querySelector('.ag-grid-table__toolbar');
    const grid = fixture.nativeElement.querySelector('.ag-grid-table__grid');
    const footer = fixture.nativeElement.querySelector('.ag-grid-table__footer');

    expect(container).toBeTruthy();
    expect(header).toBeTruthy();
    expect(toolbar).toBeTruthy();
    expect(grid).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should handle empty columns array', () => {
    component.columns = [];
    fixture.detectChanges();

    const columnDefs = component.columnDefs;
    expect(columnDefs.length).toBe(0);
  });

  it('should handle missing title and subtitle', () => {
    component.title = undefined;
    component.subtitle = undefined;
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.ag-grid-table__title');
    const subtitle = fixture.nativeElement.querySelector('.ag-grid-table__subtitle');

    expect(title).toBeFalsy();
    expect(subtitle).toBeFalsy();
  });
});