import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface ModalConfig {
  size?: ModalSize;
  closable?: boolean;
  maskClosable?: boolean;
  showCloseButton?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="modal-overlay"
      [class.modal-overlay--visible]="visible"
      [class.modal-overlay--centered]="config.centered"
      (click)="onOverlayClick($event)"
    >
      <div
        class="modal"
        [class]="getModalClasses()"
        [class.modal--visible]="visible"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? 'modal-title' : null"
        [attr.aria-describedby]="'modal-body'"
      >
        <!-- Header -->
        <div *ngIf="title || config.showCloseButton" class="modal__header">
          <h2 *ngIf="title" id="modal-title" class="modal__title">
            {{ title }}
          </h2>
          <button
            *ngIf="config.closable && config.showCloseButton"
            type="button"
            class="modal__close"
            (click)="close()"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div id="modal-body" class="modal__body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="showFooter" class="modal__footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: var(--transition-normal, 0.2s ease);
      padding: var(--spacing-md, 16px);
      overflow-y: auto;
    }

    .modal-overlay--visible {
      opacity: 1;
      visibility: visible;
    }

    .modal-overlay--centered {
      align-items: center;
    }

    .modal {
      background: var(--color-neutral-white, #ffffff);
      border-radius: var(--border-radius-card, 8px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(0.9) translateY(-20px);
      opacity: 0;
      transition: var(--transition-normal, 0.2s ease);
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal--visible {
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* Sizes */
    .modal--sm {
      max-width: 400px;
    }

    .modal--md {
      max-width: 500px;
    }

    .modal--lg {
      max-width: 800px;
    }

    .modal--xl {
      max-width: 1200px;
    }

    .modal--fullscreen {
      max-width: none;
      max-height: none;
      border-radius: 0;
    }

    /* Header */
    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg, 24px);
      border-bottom: 1px solid var(--color-neutral-gray200, #e5e7eb);
      flex-shrink: 0;
    }

    .modal__title {
      margin: 0;
      font-size: var(--font-size-heading2, 24px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-neutral-gray900, #111827);
    }

    .modal__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--color-neutral-gray500, #6b7280);
      border-radius: var(--border-radius-button, 6px);
      cursor: pointer;
      transition: var(--transition-normal, 0.2s ease);
    }

    .modal__close:hover {
      background-color: var(--color-neutral-gray100, #f3f4f6);
      color: var(--color-neutral-gray700, #374151);
    }

    .modal__close:focus-visible {
      outline: 2px solid var(--color-primary-main, #2563EB);
      outline-offset: 2px;
    }

    /* Body */
    .modal__body {
      padding: var(--spacing-lg, 24px);
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    /* Footer */
    .modal__footer {
      padding: var(--spacing-lg, 24px);
      border-top: 1px solid var(--color-neutral-gray200, #e5e7eb);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md, 16px);
      flex-shrink: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .modal-overlay {
        padding: var(--spacing-sm, 8px);
      }

      .modal__header,
      .modal__body,
      .modal__footer {
        padding: var(--spacing-md, 16px);
      }

      .modal--lg,
      .modal--xl {
        max-width: none;
        max-height: none;
      }
    }

    @media (max-width: 480px) {
      .modal__footer {
        flex-direction: column-reverse;
        gap: var(--spacing-sm, 8px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() visible: boolean = false;
  @Input() title?: string;
  @Input() showFooter: boolean = false;
  @Input() config: ModalConfig = {
    size: 'md',
    closable: true,
    maskClosable: true,
    showCloseButton: true,
    centered: true,
    destroyOnClose: false
  };

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onOpen = new EventEmitter<void>();
  @Output() onAfterClose = new EventEmitter<void>();
  @Output() onAfterOpen = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(): void {
    if (this.visible) {
      this.onOpen.emit();
      setTimeout(() => this.onAfterOpen.emit(), 200);
    } else {
      this.onClose.emit();
      setTimeout(() => this.onAfterClose.emit(), 200);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (this.visible && this.config.closable) {
      this.close();
    }
  }

  close(): void {
    if (this.config.closable) {
      this.visible = false;
      this.visibleChange.emit(false);
    }
  }

  open(): void {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  onOverlayClick(event: Event): void {
    if (this.config.maskClosable && event.target === event.currentTarget) {
      this.close();
    }
  }

  getModalClasses(): string {
    const classes = ['modal'];

    if (this.config.size) {
      classes.push(`modal--${this.config.size}`);
    }

    if (this.visible) {
      classes.push('modal--visible');
    }

    return classes.join(' ');
  }
}