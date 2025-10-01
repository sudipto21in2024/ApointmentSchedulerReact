# UI Implementation Guidelines

## Overview

This document provides comprehensive guidelines for implementing the UI components and templates for the Multi-Tenant Appointment Booking System. These guidelines ensure consistent implementation, maintainability, and adherence to the design system principles.

## Technology Stack

### Frontend Framework
- **Angular 17+**: Primary framework for UI implementation
- **TypeScript**: Strongly typed language for enhanced code quality
- **RxJS**: Reactive programming for state management
- **NgRx**: State management for complex applications

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework
- **SCSS**: CSS preprocessor for component styling
- **CSS Custom Properties**: For design token implementation
- **Responsive Design**: Mobile-first approach

### Component Libraries
- **AG Grid**: Data grid implementation
- **FullCalendar**: Calendar and scheduling components
- **Material Design Components**: For specific UI elements

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **Storybook**: Component development and documentation
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting consistency

## Project Structure

### Directory Organization
```
src/
├── app/
│   ├── components/          # Shared UI components
│   │   ├── atoms/           # Basic components (buttons, inputs, etc.)
│   │   ├── molecules/       # Composite components
│   │   ├── organisms/       # Complex components
│   │   └── templates/       # Page templates
│   ├── features/            # Feature-specific modules
│   │   ├── authentication/  # Auth-related components
│   │   ├── booking/         # Booking functionality
│   │   ├── dashboard/       # Dashboard components
│   │   ├── services/        # Service management
│   │   └── user/            # User profile components
│   ├── shared/              # Shared utilities and services
│   │   ├── directives/      # Custom directives
│   │   ├── pipes/           # Custom pipes
│   │   ├── services/        # Shared services
│   │   └── utils/           # Utility functions
│   ├── styles/              # Global styles and design tokens
│   └── app.component.ts     # Root component
├── assets/                  # Static assets
└── environments/            # Environment configurations
```

### Component Structure
```
component-name/
├── component-name.component.ts      # Component logic
├── component-name.component.html    # Component template
├── component-name.component.scss    # Component styles
├── component-name.component.spec.ts # Component tests
└── index.ts                         # Public API export
```

## Component Implementation

### Component Creation Process

#### 1. Component Specification
Before implementing a component, create a specification that includes:
- Component name and description
- Props interface with TypeScript types
- Event definitions
- Slot/content projection requirements
- Accessibility requirements
- Responsive behavior specifications

#### 2. Component Scaffolding
Use Angular CLI to generate component files:
```bash
ng generate component components/atoms/button
```

#### 3. TypeScript Implementation
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'link';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  loading: boolean;
  icon?: string;
  block?: boolean;
}

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements ButtonProps {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'link' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() block = false;
  
  @Output() clicked = new EventEmitter<void>();
  
  onClick() {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
```

#### 4. Template Implementation
```html
<button
  class="btn"
  [ngClass]="{
    'btn--primary': variant === 'primary',
    'btn--secondary': variant === 'secondary',
    'btn--ghost': variant === 'ghost',
    'btn--link': variant === 'link',
    'btn--small': size === 'small',
    'btn--medium': size === 'medium',
    'btn--large': size === 'large',
    'btn--disabled': disabled,
    'btn--loading': loading,
    'btn--block': block
  }"
  [disabled]="disabled || loading"
  (click)="onClick()"
  aria-busy="{{ loading }}"
>
  <span class="btn__content">
    <i *ngIf="icon" class="btn__icon {{ icon }}"></i>
    <ng-content></ng-content>
  </span>
  <span *ngIf="loading" class="btn__spinner" aria-hidden="true"></span>
</button>
```

#### 5. Styling Implementation
```scss
@import '../../styles/design-tokens';

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $border-radius-button;
  font-weight: $font-weight-button;
  cursor: pointer;
  transition: $transition-button;
 position: relative;
  
  // Variants
  &--primary {
    background-color: $color-primary-main;
    color: $color-neutral-white;
    
    &:hover:not(.btn--disabled) {
      background-color: $color-primary-dark;
    }
    
    &:focus:not(.btn--disabled) {
      box-shadow: $focus-ring-button;
    }
  }
  
  &--secondary {
    background-color: $color-neutral-white;
    color: $color-primary-main;
    border: 1px solid $color-neutral-gray300;
    
    &:hover:not(.btn--disabled) {
      background-color: $color-neutral-gray100;
    }
  }
  
  // Sizes
  &--small {
    height: $button-height-small;
    padding: $button-padding-small;
    font-size: $font-size-body-small;
  }
  
  &--medium {
    height: $button-height-medium;
    padding: $button-padding-medium;
    font-size: $font-size-body-medium;
  }
  
  &--large {
    height: $button-height-large;
    padding: $button-padding-large;
    font-size: $font-size-body-large;
  }
  
  // States
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--loading {
    .btn__content {
      visibility: hidden;
    }
  
  &--block {
    width: 100%;
  }
}

.btn__content {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.btn__spinner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Component Best Practices

#### 1. TypeScript Guidelines
- Use strict typing for all component inputs and outputs
- Define interfaces for complex props
- Use enums for props with limited options
- Implement proper error handling
- Follow Angular lifecycle hooks appropriately

#### 2. Template Guidelines
- Use semantic HTML elements
- Implement proper accessibility attributes
- Minimize logic in templates
- Use Angular directives effectively
- Follow content projection patterns

#### 3. Styling Guidelines
- Use design tokens for all styling values
- Implement responsive design with mobile-first approach
- Follow BEM naming convention for CSS classes
- Use SCSS features like variables, mixins, and functions
- Optimize for performance with efficient selectors

#### 4. Accessibility Guidelines
- Implement proper ARIA attributes
- Ensure keyboard navigation support
- Provide meaningful text alternatives
- Use semantic HTML structure
- Test with screen readers

## Template Implementation

### Template Creation Process

#### 1. Template Analysis
- Analyze template requirements from design specifications
- Identify required components and their props
- Determine responsive behavior requirements
- Plan data flow and state management

#### 2. Template Implementation
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login-template',
  template: `
    <div class="container" [style.max-width]="'480px'">
      <div class="stack" [style.gap]="'32px'">
        <app-logo [size]="'medium'" [variant]="'full'" [link]="'/'"></app-logo>
        
        <div class="stack" [style.gap]="'8px'" [style.align-items]="'center'">
          <app-heading [level]="1" [text]="'Welcome Back'"></app-heading>
          <app-text [variant]="'subtitle'" [content]="'Sign in to your account'"></app-text>
        </div>
        
        <div class="stack" [style.gap]="'24px'" [style.width]="'100%'">
          <app-divider [text]="'Or sign in with email'"></app-divider>
          
          <app-form-section>
            <app-form-group>
              <app-form-field 
                [type]="'email'" 
                [name]="'email'" 
                [label]="'Email Address'" 
                [placeholder]="'you@example.com'" 
                [required]="true">
              </app-form-field>
            </app-form-group>
            
            <app-form-group>
              <app-form-field 
                [type]="'password'" 
                [name]="'password'" 
                [label]="'Password'" 
                [placeholder]="'Enter your password'" 
                [required]="true" 
                [showToggle]="true">
              </app-form-field>
            </app-form-group>
            
            <div class="flex" [style.justify-content]="'space-between'" [style.align-items]="'center'">
              <app-form-field 
                [type]="'checkbox'" 
                [name]="'remember'" 
                [label]="'Remember me'">
              </app-form-field>
              <app-link [href]="'/forgot-password'" [text]="'Forgot password?'"></app-link>
            </div>
            
            <app-button 
              [variant]="'primary'" 
              [block]="true" 
              [size]="'large'" 
              [text]="'Sign In'"
              (clicked)="onSubmit()">
            </app-button>
          </app-form-section>
        </div>
        
        <div class="stack" [style.flex-direction]="'row'" [style.justify-content]="'center'" [style.gap]="'4px'">
          <app-text [content]="'Don't have an account?'"></app-text>
          <app-link [href]="'/register'" [text]="'Sign up'"></app-link>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      margin: 0 auto;
      padding: 40px 24px;
    }
    
    .stack {
      display: flex;
      flex-direction: column;
    }
    
    .flex {
      display: flex;
    }
  `]
})
export class LoginTemplateComponent {
  onSubmit() {
    // Handle form submission
  }
}
```

### Template Best Practices

#### 1. Composition
- Compose templates from smaller components
- Use content projection for flexible layouts
- Implement template inheritance when appropriate
- Parameterize templates for reusability

#### 2. Data Flow
- Implement clear data flow patterns
- Use reactive forms for complex form handling
- Manage state with NgRx for large applications
- Implement proper error handling

#### 3. Performance
- Optimize template rendering
- Use OnPush change detection strategy
- Implement lazy loading for templates
- Minimize DOM manipulation

## Design Token Integration

### CSS Custom Properties Implementation
```scss
:root {
  // Colors
  --color-primary-main: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #DBEAFE;
  
  // Typography
  --font-size-heading1: 32px;
  --font-size-heading2: 24px;
  --font-size-body-large: 16px;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  // Components
  --border-radius-card: 8px;
  --button-height-medium: 40px;
}
```

### Sass Variable Implementation
```scss
// _design-tokens.scss
$color-primary-main: #2563EB;
$color-primary-dark: #1D4ED8;
$font-size-heading1: 32px;
$spacing-md: 16px;
$border-radius-card: 8px;
```

### TypeScript Token Access
```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      main: '#2563EB',
      dark: '#1D4ED8',
      light: '#DBEAFE'
    }
  },
  typography: {
    sizes: {
      heading1: '32px',
      heading2: '24px'
    }
  }
};

// token-service.ts
import { Injectable } from '@angular/core';
import { designTokens } from './design-tokens';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  getToken(path: string): string {
    return path.split('.').reduce((obj: any, key) => obj[key], designTokens);
  }
}
```

## State Management

### NgRx Implementation

#### 1. State Definition
```typescript
// user.state.ts
export interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export const initialUserState: UserState = {
  currentUser: null,
  loading: false,
  error: null
};
```

#### 2. Actions
```typescript
// user.actions.ts
import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);
```

#### 3. Reducers
```typescript
// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { login, loginSuccess, loginFailure } from './user.actions';
import { initialUserState, UserState } from './user.state';

export const userReducer = createReducer(
  initialUserState,
  on(login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    currentUser: user,
    loading: false
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
```

#### 4. Effects
```typescript
// user.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { login, loginSuccess, loginFailure } from './user.actions';

@Injectable()
export class UserEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map(user => loginSuccess({ user })),
          catchError(error => of(loginFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService
  ) {}
}
```

#### 5. Selectors
```typescript
// user.selectors.ts
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectCurrentUser = createSelector(
  selectUserState,
  (state: UserState) => state.currentUser
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);
```

## Responsive Design Implementation

### Breakpoint Definitions
```scss
// _breakpoints.scss
$breakpoints: (
  mobile: 0,
  tablet: 768px,
  desktop: 1024px,
  wide-screen: 1400px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}
```

### Responsive Component Implementation
```scss
.component {
  // Mobile first styles
  padding: $spacing-md;
  
  // Tablet styles
  @include respond-to(tablet) {
    padding: $spacing-lg;
    display: flex;
    flex-direction: row;
  }
  
  // Desktop styles
  @include respond-to(desktop) {
    padding: $spacing-xl;
    max-width: 120px;
    margin: 0 auto;
  }
}
```

### Angular Responsive Directives
```typescript
// responsive.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appResponsive]'
})
export class ResponsiveDirective implements OnInit {
  @Input() appResponsive: 'mobile' | 'tablet' | 'desktop' | 'wide-screen' = 'mobile';
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}
  
  ngOnInit() {
    const screenWidth = window.innerWidth;
    const breakpoints = {
      mobile: 0,
      tablet: 768,
      desktop: 1024,
      'wide-screen': 1400
    };
    
    if (screenWidth >= breakpoints[this.appResponsive]) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

## Accessibility Implementation

### Semantic HTML
```html
<!-- Good example -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/services">Services</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Page Title</h1>
  <p>Page content...</p>
</main>

<!-- Avoid -->
<div class="header">
  <div class="nav">
    <div class="list">
      <div class="item"><span class="link">Dashboard</span></div>
    </div>
  </div>
</div>
```

### ARIA Attributes
```html
<!-- Form with proper labeling -->
<form>
  <label for="email">Email Address</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    aria-describedby="email-error"
    aria-invalid="false">
  <div id="email-error" role="alert" aria-live="polite"></div>
</form>

<!-- Custom button with proper roles -->
<button 
  role="button" 
  aria-pressed="false"
  aria-label="Toggle menu">
  Menu
</button>
```

### Keyboard Navigation
```typescript
// keyboard-navigation.directive.ts
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appKeyboardNavigation]'
})
export class KeyboardNavigationDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Handle activation
        break;
      case 'Escape':
        // Handle escape
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        // Handle navigation
        break;
    }
  }
}
```

## Performance Optimization

### Lazy Loading
```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./features/services/services.module').then(m => m.ServicesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### OnPush Change Detection
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  // Component logic
}
```

### TrackBy Functions
```typescript
// component.ts
export class UserListComponent {
  users: User[] = [];
  
  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}

// template.html
<ul>
  <li *ngFor="let user of users; trackBy: trackByUserId">
    {{ user.name }}
  </li>
</ul>
```

## Testing Implementation

### Unit Testing
```typescript
// button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked event when clicked', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit clicked event when disabled', () => {
    component.disabled = true;
    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });
});
```

### Integration Testing
```typescript
// login-template.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginTemplateComponent } from './login-template.component';
import { ButtonComponent } from '../components/atoms/button/button.component';
import { FormFieldComponent } from '../components/atoms/form-field/form-field.component';

describe('LoginTemplateComponent', () => {
  let component: LoginTemplateComponent;
  let fixture: ComponentFixture<LoginTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        LoginTemplateComponent,
        ButtonComponent,
        FormFieldComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-form-field[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('app-form-field[name="password"]')).toBeTruthy();
    expect(compiled.querySelector('app-button[text="Sign In"]')).toBeTruthy();
  });
});
```

## Documentation and Storybook

### Storybook Stories
```typescript
// button.stories.ts
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from './button.component';

export default {
  title: 'Atoms/Button',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      declarations: [ButtonComponent]
    })
  ]
};

export const Primary = () => ({
  component: ButtonComponent,
  props: {
    variant: 'primary',
    size: 'medium',
    text: 'Primary Button'
  }
});

export const Secondary = () => ({
  component: ButtonComponent,
  props: {
    variant: 'secondary',
    size: 'medium',
    text: 'Secondary Button'
  }
});

export const Loading = () => ({
 component: ButtonComponent,
  props: {
    variant: 'primary',
    size: 'medium',
    text: 'Loading Button',
    loading: true
  }
});
```

### API Documentation
```typescript
/**
 * Button Component
 * 
 * A versatile button component that supports multiple variants, sizes, and states.
 * 
 * @example
 * ```html
 * <app-button 
 *   variant="primary" 
 *   size="large" 
 *   (clicked)="handleClick()">
 *   Click Me
 * </app-button>
 * ```
 * 
 * @props {string} variant - Button variant: 'primary', 'secondary', 'ghost', 'link'
 * @props {string} size - Button size: 'small', 'medium', 'large'
 * @props {boolean} disabled - Whether the button is disabled
 * @props {boolean} loading - Whether the button is in loading state
 * @props {string} icon - Icon class to display with the button
 * @props {boolean} block - Whether the button should take full width
 * 
 * @events {void} clicked - Emitted when the button is clicked
 */
```

## Deployment and CI/CD

### Build Optimization
```json
// angular.json
{
  "projects": {
    "appointment-booking": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/appointment-booking",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.scss"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    steps:
    - uses: actions/checkout@v2

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm ci

    - name: Lint
      run: npm run lint

    - name: Test
      run: npm run test:ci

    - name: Build
      run: npm run build --prod

    - name: Deploy
      if: github.ref == 'refs/heads/main'
      run: |
        # Deployment steps
```

These implementation guidelines provide a comprehensive framework for developing consistent, maintainable, and high-quality UI components and templates for the Multi-Tenant Appointment Booking System.