import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { PaginationConfig } from '../../types';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  const mockPaginationConfig: PaginationConfig = {
    page: 3,
    pageSize: 10,
    total: 85,
    pageSizeOptions: [10, 25, 50]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.paginationConfig = mockPaginationConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default config', () => {
    expect(component.config.showPageSizeSelector).toBe(true);
    expect(component.config.showPageInfo).toBe(true);
    expect(component.config.showFirstLast).toBe(true);
    expect(component.config.compact).toBe(false);
    expect(component.config.size).toBe('md');
  });

  it('should calculate total pages correctly', () => {
    expect(component.totalPages).toBe(9); // 85 / 10 = 8.5, rounded up to 9
  });

  it('should calculate start index correctly', () => {
    expect(component.getStartIndex()).toBe(21); // (3-1) * 10 + 1 = 21
  });

  it('should calculate end index correctly', () => {
    expect(component.getEndIndex()).toBe(30); // 3 * 10 = 30
  });

  it('should show page info when enabled', () => {
    const info = fixture.nativeElement.querySelector('.pagination__info');
    expect(info).toBeTruthy();
    expect(info.textContent.trim()).toBe('Showing 21 to 30 of 85 entries');
  });

  it('should hide page info when disabled', () => {
    component.config.showPageInfo = false;
    fixture.detectChanges();

    const info = fixture.nativeElement.querySelector('.pagination__info');
    expect(info).toBeFalsy();
  });

  it('should show page size selector when enabled', () => {
    const selector = fixture.nativeElement.querySelector('.pagination__size-selector');
    expect(selector).toBeTruthy();
  });

  it('should hide page size selector when disabled', () => {
    component.config.showPageSizeSelector = false;
    fixture.detectChanges();

    const selector = fixture.nativeElement.querySelector('.pagination__size-selector');
    expect(selector).toBeFalsy();
  });

  it('should show first/last buttons when enabled', () => {
    const firstBtn = fixture.nativeElement.querySelector('.pagination__btn--first');
    const lastBtn = fixture.nativeElement.querySelector('.pagination__btn--last');
    expect(firstBtn).toBeTruthy();
    expect(lastBtn).toBeTruthy();
  });

  it('should hide first/last buttons when disabled', () => {
    component.config.showFirstLast = false;
    fixture.detectChanges();

    const firstBtn = fixture.nativeElement.querySelector('.pagination__btn--first');
    const lastBtn = fixture.nativeElement.querySelector('.pagination__btn--last');
    expect(firstBtn).toBeFalsy();
    expect(lastBtn).toBeFalsy();
  });

  it('should show correct visible pages for middle page', () => {
    const visiblePages = component.getVisiblePages();
    expect(visiblePages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should show ellipsis for large page count', () => {
    component.paginationConfig = { ...mockPaginationConfig, page: 10, total: 200 };
    fixture.detectChanges();

    const visiblePages = component.getVisiblePages();
    expect(visiblePages.length).toBeGreaterThan(0);
  });

  it('should emit page change when page button clicked', () => {
    spyOn(component.pageChange, 'emit');

    component.goToPage(5);

    expect(component.pageChange.emit).toHaveBeenCalledWith(5);
  });

  it('should not emit page change for invalid page', () => {
    spyOn(component.pageChange, 'emit');

    component.goToPage(0); // Invalid page
    component.goToPage(100); // Invalid page (beyond total)
    component.goToPage(3); // Current page

    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should emit page size change when selector changed', () => {
    spyOn(component.pageSizeChange, 'emit');

    const mockEvent = { target: { value: '25' } } as any;
    component.onPageSizeChange(mockEvent);

    expect(component.pageSizeChange.emit).toHaveBeenCalledWith(25);
  });

  it('should disable previous button on first page', () => {
    component.paginationConfig = { ...mockPaginationConfig, page: 1 };
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('.pagination__btn--prev');
    expect(prevBtn.disabled).toBe(true);
    expect(prevBtn.classList.contains('pagination__btn--disabled')).toBe(true);
  });

  it('should disable next button on last page', () => {
    component.paginationConfig = { ...mockPaginationConfig, page: 9 };
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector('.pagination__btn--next');
    expect(nextBtn.disabled).toBe(true);
    expect(nextBtn.classList.contains('pagination__btn--disabled')).toBe(true);
  });

  it('should highlight active page button', () => {
    const activeBtn = fixture.nativeElement.querySelector('.pagination__btn--active');
    expect(activeBtn).toBeTruthy();
    expect(activeBtn.textContent.trim()).toBe('3');
  });

  it('should show ellipsis indicators', () => {
    component.paginationConfig = { ...mockPaginationConfig, page: 50, total: 1000 };
    fixture.detectChanges();

    const ellipsis = fixture.nativeElement.querySelectorAll('.pagination__ellipsis');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should handle edge case with single page', () => {
    component.paginationConfig = { ...mockPaginationConfig, total: 5, pageSize: 10 };
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeFalsy(); // Should not show pagination for single page
  });

  it('should handle edge case with zero total', () => {
    component.paginationConfig = { ...mockPaginationConfig, total: 0 };
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeFalsy(); // Should not show pagination for no data
  });

  it('should have proper component structure', () => {
    const container = fixture.nativeElement.querySelector('.pagination-container');
    const info = fixture.nativeElement.querySelector('.pagination__info');
    const pagination = fixture.nativeElement.querySelector('.pagination');

    expect(container).toBeTruthy();
    expect(info).toBeTruthy();
    expect(pagination).toBeTruthy();
  });
});