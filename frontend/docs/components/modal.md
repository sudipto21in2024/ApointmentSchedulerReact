# Modal Component

## Overview

The Modal component is a flexible dialog and overlay system for the Appointment Booking System. It provides an accessible way to display content that requires user attention, such as forms, confirmations, or additional information, while maintaining focus and preventing interaction with the background content.

## 🎯 Features

- **Multiple Sizes**: 5 size options from small to full screen
- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: ESC key support and proper tab order
- **Overlay Options**: Click outside to close with backdrop blur
- **Smooth Animations**: Entrance and exit animations
- **Sub-components**: Header, Content, Footer, Title, Description, Close button
- **Full Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **TypeScript Support**: Fully typed with comprehensive prop interfaces

## 🚀 Basic Usage

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui';

// Basic modal
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <ModalContent>
    <p>Modal content goes here</p>
  </ModalContent>
</Modal>

// Modal with all sections
<Modal open={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Confirm Action</ModalTitle>
    <ModalDescription>
      Are you sure you want to delete this item?
    </ModalDescription>
  </ModalHeader>
  <ModalContent>
    <p>Additional content can go here</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirm}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

## 📏 Sizes

Choose from 5 different modal sizes:

```tsx
// Small modal - 448px max width
<Modal size="sm">...</Modal>

// Medium modal - 512px max width (default)
<Modal size="md">...</Modal>

// Large modal - 672px max width
<Modal size="lg">...</Modal>

// Extra large modal - 896px max width
<Modal size="xl">...</Modal>

// Full screen modal
<Modal size="full">...</Modal>
```

## ⌨️ Keyboard Navigation

The Modal component supports comprehensive keyboard navigation:

### ESC Key

```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  closeOnEscape={true} // Default: true
>
  <ModalContent>Press ESC to close</ModalContent>
</Modal>
```

### Tab Navigation

- **Tab**: Navigate between focusable elements within the modal
- **Shift + Tab**: Navigate backwards
- **Focus trapping**: Focus remains within the modal when open

### Focus Management

```tsx
function ModalWithFocusManagement() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    // Focus will be automatically managed
  };

  const handleClose = () => {
    setIsOpen(false);
    // Focus will return to the element that opened the modal
  };

  return (
    <>
      <Button onClick={handleOpen}>Open Modal</Button>

      <Modal open={isOpen} onClose={handleClose}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Focused Modal</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <Input label="First field" autoFocus />
            <Input label="Second field" />
          </ModalContent>
          <ModalFooter>
            <Button onClick={handleClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
```

## 🖱️ Overlay Behavior

### Click Outside to Close

```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  closeOnOverlayClick={true} // Default: true
>
  <ModalContent>Click outside to close</ModalContent>
</Modal>
```

### Prevent Closing

```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  preventClose={true} // Removes close button and disables ESC/overlay close
>
  <ModalContent>
    <p>This modal cannot be closed by the user</p>
  </ModalContent>
</Modal>
```

## 🎨 Modal Sections

### ModalHeader

```tsx
<ModalHeader className="text-center sm:text-left">
  <ModalTitle>Modal Title</ModalTitle>
  <ModalDescription>
    Description of the modal's purpose
  </ModalDescription>
</ModalHeader>
```

The header provides:
- Consistent spacing and typography
- Title and description components
- Responsive text alignment

### ModalContent

```tsx
<ModalContent>
  <p>Main modal content goes here</p>
  <form>
    <Input label="Email" type="email" />
    <Input label="Message" multiline />
  </form>
</ModalContent>
```

The content area provides:
- Scrollable content when needed
- Proper padding and spacing
- Flexible layout for forms and content

### ModalFooter

```tsx
<ModalFooter className="flex-col sm:flex-row gap-2">
  <Button variant="ghost" onClick={handleClose}>
    Cancel
  </Button>
  <Button variant="primary" onClick={handleConfirm}>
    Confirm
  </Button>
</ModalFooter>
```

The footer provides:
- Action buttons with consistent styling
- Responsive layout (stacked on mobile, row on desktop)
- Proper spacing and alignment

## 🔧 Props API

### ModalProps Interface

```tsx
interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  open?: boolean;

  /** Callback fired when the modal should be closed */
  onClose?: () => void;

  /** Whether clicking the overlay should close the modal */
  closeOnOverlayClick?: boolean;

  /** Whether pressing ESC should close the modal */
  closeOnEscape?: boolean;

  /** Prevent the modal from being closed */
  preventClose?: boolean;

  /** Modal size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

### Sub-component Props

```tsx
// ModalHeader, ModalContent, ModalFooter
interface ModalSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// ModalTitle
interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

// ModalDescription
interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

// ModalClose
interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}
```

## ♿ Accessibility

The Modal component is fully accessible and WCAG 2.1 AA compliant:

### ARIA Attributes

```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <ModalHeader>
    <ModalTitle id="modal-title">Accessible Modal</ModalTitle>
    <ModalDescription id="modal-description">
      Modal description for screen readers
    </ModalDescription>
  </ModalHeader>
  <ModalContent>
    <p>Modal content</p>
  </ModalContent>
</Modal>
```

### Focus Management

The modal automatically:
- Traps focus within the modal when open
- Returns focus to the triggering element when closed
- Handles focus for dynamic content
- Supports initial focus on specific elements

### Screen Reader Support

```tsx
<Modal open={isOpen} onClose={handleClose}>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Delete Confirmation</ModalTitle>
      <ModalDescription>
        This action cannot be undone. Are you sure?
      </ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button onClick={handleClose}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete Item
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Best Practices

1. **Provide clear modal titles**: Use ModalTitle for consistent heading structure
2. **Include helpful descriptions**: Explain the modal's purpose and content
3. **Use semantic actions**: Make button purposes clear
4. **Test with screen readers**: Ensure proper announcements
5. **Consider modal size**: Don't make modals too large for screen readers

## 🎨 Styling

### CSS Custom Properties

The modal uses CSS custom properties for theming:

```css
/* Modal overlay */
--modal-overlay-bg: rgba(0, 0, 0, 0.5);
--modal-backdrop-blur: blur(4px);

/* Modal content */
--modal-bg: #ffffff;
--modal-border-radius: 8px;
--modal-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Modal animations */
--modal-animation-duration: 200ms;
--modal-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
```

### Custom Styling

Override default styles using the `className` prop:

```tsx
<Modal
  open={isOpen}
  onClose={handleClose}
  className="custom-modal-overlay"
>
  <ModalContent className="custom-modal-content">
    <p>Custom styled modal</p>
  </ModalContent>
</Modal>
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalContent } from '@/components/ui';

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal open={true}>
        <ModalContent>Modal content</ModalContent>
      </Modal>
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false}>
        <ModalContent>Modal content</ModalContent>
      </Modal>
    );

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when ESC is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalContent>Modal content</ModalContent>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(
    <Modal open={true}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Accessible Modal</ModalTitle>
          <ModalDescription>Modal description</ModalDescription>
        </ModalHeader>
      </ModalContent>
    </Modal>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚨 Common Patterns

### Confirmation Modal

```tsx
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{message}</ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### Form Modal

```tsx
function FormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Contact Form</ModalTitle>
        <ModalDescription>
          Send us a message and we'll get back to you
        </ModalDescription>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Send Message</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
```

### Image Gallery Modal

```tsx
function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
}) {
  return (
    <Modal open={isOpen} onClose={onClose} size="full">
      <ModalContent className="relative">
        <ModalClose onClick={onClose} />
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
```

### Loading Modal

```tsx
function LoadingModal({
  isOpen,
  message = 'Loading...'
}: {
  isOpen: boolean;
  message?: string;
}) {
  return (
    <Modal open={isOpen} preventClose size="sm">
      <ModalContent>
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary-main border-t-transparent rounded-full mx-auto mb-4" />
          <p>{message}</p>
        </div>
      </ModalContent>
    </Modal>
  );
}
```

## 🔧 Advanced Usage

### Nested Modals

```tsx
function NestedModalExample() {
  const [modal1Open, setModal1Open] = useState(false);
  const [modal2Open, setModal2Open] = useState(false);

  return (
    <>
      <Button onClick={() => setModal1Open(true)}>Open First Modal</Button>

      <Modal open={modal1Open} onClose={() => setModal1Open(false)}>
        <ModalHeader>
          <ModalTitle>First Modal</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>This is the first modal</p>
          <Button onClick={() => setModal2Open(true)}>
            Open Second Modal
          </Button>
        </ModalContent>
      </Modal>

      <Modal open={modal2Open} onClose={() => setModal2Open(false)}>
        <ModalHeader>
          <ModalTitle>Second Modal</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p>This is the nested second modal</p>
        </ModalContent>
      </Modal>
    </>
  );
}
```

### Dynamic Modal Content

```tsx
function DynamicModal({ type }: { type: 'success' | 'error' | 'warning' }) {
  const modalConfig = {
    success: {
      title: 'Success!',
      description: 'Operation completed successfully',
      variant: 'success' as const,
    },
    error: {
      title: 'Error',
      description: 'An error occurred',
      variant: 'danger' as const,
    },
    warning: {
      title: 'Warning',
      description: 'Please review your input',
      variant: 'warning' as const,
    },
  };

  const config = modalConfig[type];

  return (
    <Modal open={true} onClose={() => {}}>
      <ModalHeader>
        <ModalTitle>{config.title}</ModalTitle>
        <ModalDescription>{config.description}</ModalDescription>
      </ModalHeader>
      <ModalFooter>
        <Button onClick={() => {}}>OK</Button>
      </ModalFooter>
    </Modal>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

**Modal not opening**
- Ensure `open` prop is set to `true`
- Check that the modal is properly imported
- Verify no JavaScript errors are preventing rendering

**Focus not working correctly**
- Ensure focusable elements exist within the modal
- Check that `onClose` handler is properly defined
- Test with keyboard navigation

**Styling issues**
- Use the `className` prop for custom styling
- Check that Tailwind CSS is properly configured
- Avoid CSS specificity conflicts

**Accessibility issues**
- Always use ModalTitle for modal headings
- Provide meaningful descriptions
- Test with screen reader software

**Z-index issues**
- Modal uses `z-50` by default
- Increase z-index if needed: `className="z-[60]"`
- Ensure no other elements have conflicting z-index values

## 📈 Performance

### Optimization Tips

1. **Lazy load modal content**:
   ```tsx
   const ModalContent = lazy(() => import('./ModalContent'));

   <Modal open={isOpen}>
     <Suspense fallback={<div>Loading...</div>}>
       <ModalContent />
     </Suspense>
   </Modal>
   ```

2. **Prevent unnecessary re-renders**:
   ```tsx
   const ModalContent = React.memo(({ data }) => (
     <Modal open={true}>
       <div>{data.content}</div>
     </Modal>
   ));
   ```

3. **Use portal for better performance**:
   ```tsx
   // Modal already uses portal internally for better performance
   <Modal open={isOpen}>
     <ModalContent>Content</ModalContent>
   </Modal>
   ```

## 🔗 Related Components

- **[Button Component](./button.md)**: Often used to trigger modals
- **[Card Component](./card.md)**: May be displayed within modals
- **[Input Component](./input.md)**: Commonly used in modal forms

## 📚 Examples

See the [Modal Examples](../../../src/components/ui/examples.tsx) file for comprehensive usage examples including:

- Basic modal usage
- Form modals
- Confirmation dialogs
- Image galleries
- Loading states
- Nested modals

## 🤝 Contributing

To contribute to the Modal component:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update this documentation
4. Ensure accessibility compliance
5. Test across different browsers and devices

---

**Last Updated**: October 2025
**Version**: 1.0.0