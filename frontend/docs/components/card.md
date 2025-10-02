# Card Component

## Overview

The Card component is a versatile content container for the Appointment Booking System. It provides a structured layout with optional header, content, and footer sections, making it ideal for displaying information in an organized and visually appealing way.

## 🎯 Features

- **Multiple Variants**: 5 visual styles for different contexts
- **Flexible Sizing**: 3 size options for various content types
- **Interactive States**: Hover effects and clickable functionality
- **Sub-components**: Header, Content, Footer, Title, Description, Image
- **Media Support**: Built-in image component for visual content
- **Responsive Design**: Adapts to different screen sizes
- **Full Accessibility**: WCAG 2.1 AA compliant with proper semantics
- **TypeScript Support**: Fully typed with comprehensive prop interfaces

## 🚀 Basic Usage

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Simple card
<Card>
  <CardContent>
    <p>This is a simple card</p>
  </CardContent>
</Card>

// Card with all sections
<Card>
  <CardHeader>
    <h3>Card Title</h3>
    <p>Card description</p>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## 🎨 Variants

The Card component supports 5 different visual variants:

### Default

```tsx
<Card variant="default">
  <CardContent>
    <p>Standard card with subtle border and background</p>
  </CardContent>
</Card>
```

The default variant provides a clean, standard appearance suitable for most use cases.

### Elevated

```tsx
<Card variant="elevated">
  <CardContent>
    <p>Card with shadow for emphasis</p>
  </CardContent>
</Card>
```

The elevated variant adds shadow depth to make the card stand out from the background.

### Outlined

```tsx
<Card variant="outlined">
  <CardContent>
    <p>Card with prominent border</p>
  </CardContent>
</Card>
```

The outlined variant uses a thicker border for stronger visual definition.

### Filled

```tsx
<Card variant="filled">
  <CardContent>
    <p>Card with filled background</p>
  </CardContent>
</Card>
```

The filled variant uses a subtle background color for visual distinction.

### Ghost

```tsx
<Card variant="ghost">
  <CardContent>
    <p>Minimal card styling</p>
  </CardContent>
</Card>
```

The ghost variant provides minimal styling for a seamless appearance.

## 📏 Sizes

Choose from 3 different card sizes:

```tsx
// Small card - 16px padding
<Card size="sm">
  <CardContent>Compact content</CardContent>
</Card>

// Medium card - 24px padding (default)
<Card size="md">
  <CardContent>Standard content</CardContent>
</Card>

// Large card - 32px padding
<Card size="lg">
  <CardContent>Spacious content</CardContent>
</Card>
```

## 🖼️ Card Sections

### CardHeader

```tsx
<CardHeader className="pb-4">
  <CardTitle>Card Title</CardTitle>
  <CardDescription>
    This is a description of the card content
  </CardDescription>
</CardHeader>
```

The header section provides:
- Consistent spacing and typography
- Title and description components
- Proper semantic structure

### CardContent

```tsx
<CardContent>
  <p>Main card content goes here</p>
  <p>Additional content and information</p>
</CardContent>
```

The content section provides:
- Proper padding and spacing
- Flexible content area
- Responsive layout support

### CardFooter

```tsx
<CardFooter className="pt-4">
  <Button variant="primary">Primary Action</Button>
  <Button variant="ghost">Secondary Action</Button>
</CardFooter>
```

The footer section provides:
- Action buttons and controls
- Consistent alignment
- Proper spacing from content

## 🏷️ Typography Components

### CardTitle

```tsx
<CardTitle>Important Information</CardTitle>
```

Renders as an `<h3>` element with:
- Consistent heading styling
- Proper semantic structure
- Accessibility compliance

### CardDescription

```tsx
<CardDescription>
  Supporting text that provides additional context
</CardDescription>
```

Renders as a `<p>` element with:
- Muted text styling
- Proper contrast ratios
- Screen reader support

## 🖼️ CardImage

```tsx
<Card>
  <CardImage
    src="/images/service.jpg"
    alt="Service illustration"
  />
  <CardHeader>
    <CardTitle>Service Card</CardTitle>
  </CardDescription>
</Card>
```

The image component provides:
- Responsive image sizing
- Proper aspect ratio handling
- Rounded corners for visual consistency
- Alt text for accessibility

## 🖱️ Interactive Cards

Make cards interactive with hover effects and click handlers:

```tsx
<Card
  variant="elevated"
  interactive
  onClick={() => console.log('Card clicked!')}
>
  <CardContent>
    <h3>Clickable Card</h3>
    <p>Click me to perform an action</p>
  </CardContent>
</Card>
```

Interactive cards support:
- Hover animations (scale effect)
- Keyboard navigation (Enter/Space keys)
- Click event handling
- Proper focus management

## 🔧 Props API

### CardProps Interface

```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card visual variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';

  /** Card size */
  size?: 'sm' | 'md' | 'lg';

  /** Whether the card should be interactive (clickable) */
  interactive?: boolean;

  /** Custom container className for additional styling */
  containerClassName?: string;
}
```

### Sub-component Props

```tsx
// CardHeader, CardContent, CardFooter
interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// CardTitle
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

// CardDescription
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

// CardImage
interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}
```

## ♿ Accessibility

The Card component is fully accessible and WCAG 2.1 AA compliant:

### Semantic Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>Accessible Card</CardTitle>
    <CardDescription>Proper heading structure</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content with proper semantics</p>
  </CardContent>
</Card>
```

### Interactive Cards

```tsx
<Card
  interactive
  role="button"
  tabIndex={0}
  aria-label="Navigate to service details"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  <CardContent>
    <p>Accessible interactive card</p>
  </CardContent>
</Card>
```

### Focus Management

- Visible focus indicators for interactive cards
- Proper tab order in card collections
- Keyboard navigation support

### Best Practices

1. **Use semantic heading structure**: Start with CardTitle (h3) and use proper heading hierarchy
2. **Provide meaningful content**: Ensure cards have clear, descriptive content
3. **Use interactive cards judiciously**: Only make cards interactive when clicking has a clear purpose
4. **Test with keyboard navigation**: Ensure all interactive elements are keyboard accessible

## 🎨 Styling

### CSS Custom Properties

The card uses CSS custom properties for theming:

```css
/* Card styling */
--card-border-radius: 8px;
--card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--card-hover-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Card colors */
--card-background: #ffffff;
--card-border: #e5e7eb;
--card-text: #111827;
```

### Custom Styling

Override default styles using the `className` prop:

```tsx
<Card
  className="border-2 border-blue-500"
  containerClassName="mb-6"
>
  <CardContent>Custom styled card</CardContent>
</Card>
```

## 📱 Responsive Design

Cards are fully responsive and work well across all device sizes:

```tsx
// Cards in a responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Card>
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

describe('Card', () => {
  it('renders with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('handles interactive clicks', () => {
    const handleClick = jest.fn();
    render(
      <Card interactive onClick={handleClick}>
        <CardContent>Clickable card</CardContent>
      </Card>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation for interactive cards', () => {
    const handleClick = jest.fn();
    render(
      <Card interactive onClick={handleClick}>
        <CardContent>Interactive card</CardContent>
      </Card>
    );

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(
    <Card>
      <CardHeader>
        <CardTitle>Accessible Card</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
    </Card>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚨 Common Patterns

### Service Cards

```tsx
function ServiceCard({ service }: { service: Service }) {
  return (
    <Card variant="elevated" interactive>
      <CardImage
        src={service.imageUrl}
        alt={service.name}
      />
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">${service.price}</span>
          <span className="text-sm text-gray-500">{service.duration}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button fullWidth>Book Now</Button>
      </CardFooter>
    </Card>
  );
}
```

### Profile Cards

```tsx
function ProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardContent className="text-center">
        <img
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          className="w-16 h-16 rounded-full mx-auto mb-4"
        />
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.role}</CardDescription>
        <p className="mt-2 text-sm">{user.bio}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="ghost" size="sm">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Statistics Cards

```tsx
function StatsCard({
  title,
  value,
  change,
  icon: Icon
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Notification Cards

```tsx
function NotificationCard({ notification }: { notification: Notification }) {
  return (
    <Card variant={notification.read ? 'default' : 'elevated'}>
      <CardContent>
        <div className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
          <div className="flex-1">
            <p className="font-medium">{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🔧 Advanced Usage

### Card Collections

```tsx
function CardGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} variant="elevated" interactive>
          <CardImage src={item.image} alt={item.title} />
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="sm">View Details</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### Dynamic Card Content

```tsx
function DynamicCard({ data }: { data: DynamicData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.content.map((item, index) => (
          <div key={index}>
            {item.type === 'text' && <p>{item.value}</p>}
            {item.type === 'image' && (
              <img src={item.src} alt={item.alt} className="w-full h-48 object-cover" />
            )}
            {item.type === 'list' && (
              <ul className="list-disc list-inside">
                {item.items.map((listItem, listIndex) => (
                  <li key={listIndex}>{listItem}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

**Cards not displaying correctly**
- Ensure proper imports from `@/components/ui`
- Check that Card sub-components are used within a Card
- Verify CSS classes are not conflicting

**Interactive cards not responding**
- Ensure `interactive` prop is set to `true`
- Check that click handlers are properly defined
- Verify keyboard event handlers are implemented

**Styling issues**
- Use the `className` prop for custom styling
- Check that Tailwind CSS is properly configured
- Avoid CSS specificity conflicts

**Accessibility issues**
- Use CardTitle for headings to maintain proper structure
- Provide meaningful alt text for CardImage
- Test with keyboard navigation

## 📈 Performance

### Optimization Tips

1. **Use React.memo for static cards**:
   ```tsx
   const StaticCard = React.memo<CardProps>((props) => (
     <Card {...props} />
   ));
   ```

2. **Lazy load card images**:
   ```tsx
   import { lazy } from 'react';

   const LazyImage = lazy(() => import('./LazyImage'));

   <CardImage src={imageSrc} alt={altText} />
   ```

3. **Virtualize large card lists**:
   ```tsx
   import { FixedSizeList as List } from 'react-window';

   <List
     height={400}
     itemCount={1000}
     itemSize={200}
     itemData={items}
   >
     {({ index, data }) => <Card>{data[index].content}</Card>}
   </List>
   ```

## 🔗 Related Components

- **[Button Component](./button.md)**: Commonly used in card footers
- **[Modal Component](./modal.md)**: May contain cards or be triggered by card actions
- **[Input Component](./input.md)**: May be used within card content for forms

## 📚 Examples

See the [Card Examples](../../../src/components/ui/examples.tsx) file for comprehensive usage examples including:

- All variants and sizes
- Interactive cards
- Cards with images
- Card collections
- Different content types

## 🤝 Contributing

To contribute to the Card component:

1. Follow the existing code patterns
2. Add comprehensive tests
3. Update this documentation
4. Ensure accessibility compliance
5. Test across different browsers and devices

---

**Last Updated**: October 2025
**Version**: 1.0.0