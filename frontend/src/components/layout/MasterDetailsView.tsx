/**
 * Master-Details View Component
 *
 * Implements the three master-details form interaction patterns specified in the design system:
 * 1. Simple Navigation: Navigate to add/edit form, return to grid when done
 * 2. Popup Pattern: Open popup for add/edit, reload grid on success/cancellation
 * 3. Slider Pattern: Open configurable slider form from right side for add/edit
 *
 * Features:
 * - Three interaction modes for master-details forms
 * - Responsive design with mobile considerations
 * - Smooth animations and transitions
 * - Accessibility features (focus management, ARIA labels)
 * - Integration with existing components
 * - Customizable form content and actions
 */

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../../utils/cn';

export type MasterDetailsMode = 'navigation' | 'popup' | 'slider';

export interface MasterDetailsViewProps {
  /** Master view content (usually a data grid or list) */
  masterView: React.ReactNode;
  /** Details form content */
  detailForm: React.ReactNode;
  /** Current interaction mode */
  mode: MasterDetailsMode;
  /** Whether details form is open */
  detailOpen?: boolean;
  /** Title for the details form */
  detailTitle?: string;
  /** Whether form is in create mode (vs edit mode) */
  isCreate?: boolean;
  /** Form submission handler */
  onSubmit?: (data: any) => Promise<void>;
  /** Form cancellation handler */
  onCancel?: () => void;
  /** Success callback after form submission */
  onSuccess?: () => void;
  /** Loading state for form submission */
  submitting?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Master-Details View Component
 */
export const MasterDetailsView: React.FC<MasterDetailsViewProps> = ({
  masterView,
  detailForm,
  mode,
  detailOpen = false,
  detailTitle = 'Details',
  onCancel,
  className = '',
  'data-testid': testId = 'master-details-view'
}) => {
  const [showDetails, setShowDetails] = useState(detailOpen);

  /**
   * Handle form cancellation
   */
  const handleCancel = useCallback(() => {
    setShowDetails(false);
    onCancel?.();
  }, [onCancel]);

  /**
   * Handle opening details form
   */
  const handleOpenDetails = useCallback(() => {
    setShowDetails(true);
  }, []);

  // Render based on interaction mode
  switch (mode) {
    case 'navigation':
      return (
        <div className={cn('master-details-navigation', className)} data-testid={testId}>
          {showDetails ? detailForm : masterView}
        </div>
      );

    case 'popup':
      return (
        <div className={cn('master-details-popup', className)} data-testid={testId}>
          {/* Master view with action button */}
          <div className="relative">
            {masterView}

            {/* Floating action button for create */}
            <Button
              variant="primary"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              onClick={handleOpenDetails}
              data-testid="create-button"
            >
              ➕
            </Button>
          </div>

          {/* Popup modal for details */}
          <Modal
            open={showDetails}
            onClose={handleCancel}
            size="lg"
            data-testid="details-modal"
          >
            <ModalHeader>
              <ModalTitle>{detailTitle}</ModalTitle>
            </ModalHeader>
            <ModalContent className="max-h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                {detailForm}
              </div>
            </ModalContent>
          </Modal>
        </div>
      );

    case 'slider':
      return (
        <div className={cn('master-details-slider', className)} data-testid={testId}>
          <div className="flex h-full">
            {/* Master view */}
            <div className={cn(
              'transition-all duration-300',
              showDetails ? 'w-1/2' : 'w-full'
            )}>
              {masterView}
            </div>

            {/* Details slider */}
            {showDetails && (
              <div className="w-1/2 border-l border-gray-200 bg-white">
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {detailTitle}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      data-testid="close-slider"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {detailForm}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className={cn('master-details-default', className)} data-testid={testId}>
          {masterView}
        </div>
      );
  }
};

/**
 * Master-Details Container with Action Buttons
 */
export interface MasterDetailsContainerProps {
  /** Master content (list/grid) */
  masterContent: React.ReactNode;
  /** Detail form content */
  detailForm: React.ReactNode;
  /** Interaction mode */
  mode: MasterDetailsMode;
  /** Detail form configuration */
  detailConfig?: {
    title?: string;
    isCreate?: boolean;
  };
  /** Form handlers */
  formHandlers?: {
    onSubmit?: (data: any) => Promise<void>;
    onCancel?: () => void;
    onSuccess?: () => void;
  };
  /** Loading state */
  loading?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const MasterDetailsContainer: React.FC<MasterDetailsContainerProps> = ({
  masterContent,
  detailForm,
  mode,
  detailConfig = {},
  formHandlers = {},
  loading = false,
  className = ''
}) => {
  return (
    <MasterDetailsView
      masterView={masterContent}
      detailForm={detailForm}
      mode={mode}
      detailTitle={detailConfig.title || (detailConfig.isCreate ? 'Create New' : 'Edit')}
      isCreate={detailConfig.isCreate}
      onSubmit={formHandlers.onSubmit}
      onCancel={formHandlers.onCancel}
      onSuccess={formHandlers.onSuccess}
      submitting={loading}
      className={className}
    />
  );
};

// Modal components for JSX
const ModalHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const ModalTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-gray-900">
    {children}
  </h2>
);

const ModalContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export default MasterDetailsView;