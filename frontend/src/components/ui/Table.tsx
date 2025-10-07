import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Table component props
 */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table children (thead, tbody, etc.) */
  children: React.ReactNode;
}

/**
 * TableHead component props
 */
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table head children */
  children: React.ReactNode;
}

/**
 * TableBody component props
 */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table body children */
  children: React.ReactNode;
}

/**
 * TableRow component props
 */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table row children */
  children: React.ReactNode;
}

/**
 * TableHeader component props
 */
export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table header children */
  children: React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Callback when header is clicked for sorting */
  onSort?: () => void;
}

/**
 * TableCell component props
 */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Additional CSS classes */
  className?: string;
  /** Table cell children */
  children: React.ReactNode;
}

/**
 * Main Table component
 * Provides a styled table with consistent design
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

/**
 * TableHead component for table header section
 */
export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('[&_tr]:border-b', className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHead.displayName = 'TableHead';

/**
 * TableBody component for table body section
 */
export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

/**
 * TableRow component for table rows
 */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

/**
 * TableHeader component for table header cells with optional sorting
 */
export const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => {
    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
          sortable && 'cursor-pointer select-none hover:bg-muted/50',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && sortDirection && (
            <span className="text-xs">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
          {sortable && !sortDirection && (
            <span className="text-xs opacity-50">↕</span>
          )}
        </div>
      </th>
    );
  }
);

TableHeader.displayName = 'TableHeader';

/**
 * TableCell component for table data cells
 */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('p-4 align-middle', className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';