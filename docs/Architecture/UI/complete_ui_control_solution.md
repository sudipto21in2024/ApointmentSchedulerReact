# Complete UI Control Solution: Tasks & Supporting Documents

## Document Structure Overview

This solution provides:
1. **Design System Foundation** - Core design tokens and patterns
2. **UI Component Library** - Predefined component specifications
3. **Layout Pattern Library** - Reusable page structures
4. **Enhanced Task Templates** - Controlled task specifications
5. **Validation Framework** - Quality assurance guidelines

---

## 1. Design System Foundation

### File: `docs/design-system/design-tokens.json`

```json
{
  "version": "2.1.0",
  "tokens": {
    "colors": {
      "primary": {
        "50": "#EEF2FF",
        "100": "#E0E7FF",
        "500": "#4F46E5",
        "600": "#3730A3",
        "700": "#312E81"
      },
      "semantic": {
        "success": "#10B981",
        "error": "#EF4444",
        "warning": "#F59E0B",
        "info": "#3B82F6"
      },
      "neutral": {
        "50": "#F8FAFC",
        "100": "#F1F5F9",
        "200": "#E2E8F0",
        "500": "#64748B",
        "700": "#334155",
        "900": "#0F172A"
      }
    },
    "typography": {
      "scale": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem"
      },
      "weights": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "families": {
        "primary": "'Inter', system-ui, sans-serif",
        "mono": "'JetBrains Mono', monospace"
      }
    },
    "spacing": {
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem"
    },
    "borderRadius": {
      "sm": "0.125rem",
      "base": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

### File: `docs/design-system/component-patterns.json`

```json
{
  "version": "1.0.0",
  "patterns": {
    "auth_components": {
      "layout_type": "centered_card",
      "container": {
        "max_width": "400px",
        "padding": "2rem",
        "margin": "auto",
        "background": "neutral.50"
      },
      "card": {
        "background": "white",
        "border_radius": "lg",
        "shadow": "md",
        "padding": "2rem"
      },
      "form": {
        "field_spacing": "1.5rem",
        "label_margin_bottom": "0.5rem",
        "input_height": "3rem",
        "button_height": "3rem"
      }
    },
    "dashboard_components": {
      "layout_type": "sidebar_main",
      "sidebar": {
        "width": "16rem",
        "background": "primary.500",
        "text_color": "white"
      },
      "main": {
        "background": "neutral.50",
        "padding": "2rem"
      },
      "cards": {
        "background": "white",
        "border_radius": "lg",
        "shadow": "sm",
        "padding": "1.5rem",
        "margin_bottom": "1.5rem"
      }
    }
  }
}
```

---

## 2. UI Component Library

### File: `docs/ui-components/auth-components-spec.json`

```json
{
  "component_library": "auth_components",
  "version": "1.0.0",
  "components": {
    "LoginComponent": {
      "template_id": "auth_card_form",
      "required_structure": {
        "root": {
          "element": "div",
          "classes": ["auth-container", "min-h-screen", "flex", "items-center", "justify-center", "bg-gray-50"],
          "children": ["auth_card"]
        },
        "auth_card": {
          "element": "div",
          "classes": ["auth-card", "max-w-md", "w-full", "bg-white", "rounded-lg", "shadow-md", "p-8"],
          "children": ["auth_header", "auth_form", "auth_footer"]
        },
        "auth_header": {
          "element": "div",
          "classes": ["auth-header", "text-center", "mb-8"],
          "children": ["title", "subtitle"]
        },
        "title": {
          "element": "h1",
          "classes": ["text-2xl", "font-bold", "text-gray-900", "mb-2"],
          "content": "Welcome Back"
        },
        "subtitle": {
          "element": "p",
          "classes": ["text-sm", "text-gray-600"],
          "content": "Sign in to your account"
        },
        "auth_form": {
          "element": "form",
          "classes": ["auth-form", "space-y-6"],
          "children": ["email_field", "password_field", "submit_button"]
        },
        "email_field": {
          "element": "div",
          "classes": ["field-group"],
          "children": ["email_label", "email_input", "email_error"]
        },
        "email_label": {
          "element": "label",
          "classes": ["block", "text-sm", "font-medium", "text-gray-700", "mb-2"],
          "attributes": {"for": "email"},
          "content": "Email Address"
        },
        "email_input": {
          "element": "input",
          "classes": ["w-full", "px-3", "py-2", "border", "border-gray-300", "rounded-md", "focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent"],
          "attributes": {
            "type": "email",
            "id": "email",
            "name": "email",
            "placeholder": "Enter your email",
            "required": true
          }
        },
        "email_error": {
          "element": "div",
          "classes": ["text-red-600", "text-sm", "mt-1", "hidden"],
          "attributes": {"role": "alert"}
        },
        "password_field": {
          "element": "div",
          "classes": ["field-group"],
          "children": ["password_label", "password_input", "password_error"]
        },
        "password_label": {
          "element": "label",
          "classes": ["block", "text-sm", "font-medium", "text-gray-700", "mb-2"],
          "attributes": {"for": "password"},
          "content": "Password"
        },
        "password_input": {
          "element": "input",
          "classes": ["w-full", "px-3", "py-2", "border", "border-gray-300", "rounded-md", "focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent"],
          "attributes": {
            "type": "password",
            "id": "password",
            "name": "password",
            "placeholder": "Enter your password",
            "required": true
          }
        },
        "password_error": {
          "element": "div",
          "classes": ["text-red-600", "text-sm", "mt-1", "hidden"],
          "attributes": {"role": "alert"}
        },
        "submit_button": {
          "element": "button",
          "classes": ["w-full", "bg-primary", "text-white", "py-2", "px-4", "rounded-md", "hover:bg-primary-hover", "focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:ring-offset-2", "font-medium"],
          "attributes": {"type": "submit"},
          "content": "Sign In"
        },
        "auth_footer": {
          "element": "div",
          "classes": ["auth-footer", "text-center", "mt-6", "space-y-4"],
          "children": ["forgot_link", "register_link"]
        },
        "forgot_link": {
          "element": "a",
          "classes": ["text-primary", "hover:text-primary-hover", "text-sm", "font-medium"],
          "attributes": {"href": "/auth/forgot-password"},
          "content": "Forgot your password?"
        },
        "register_link": {
          "element": "p",
          "classes": ["text-sm", "text-gray-600"],
          "content": "Don't have an account? <a href='/auth/register' class='text-primary hover:text-primary-hover font-medium'>Sign up</a>"
        }
      },
      "validation_rules": {
        "email": ["required", "email"],
        "password": ["required", "minLength:8"]
      },
      "error_messages": {
        "email": {
          "required": "Email is required",
          "email": "Please enter a valid email address"
        },
        "password": {
          "required": "Password is required",
          "minLength": "Password must be at least 8 characters"
        }
      }
    },
    "RegisterComponent": {
      "template_id": "auth_card_form",
      "required_structure": {
        "root": {
          "element": "div",
          "classes": ["auth-container", "min-h-screen", "flex", "items-center", "justify-center", "bg-gray-50"],
          "children": ["auth_card"]
        },
        "auth_card": {
          "element": "div",
          "classes": ["auth-card", "max-w-md", "w-full", "bg-white", "rounded-lg", "shadow-md", "p-8"],
          "children": ["auth_header", "auth_form", "auth_footer"]
        },
        "auth_header": {
          "element": "div",
          "classes": ["auth-header", "text-center", "mb-8"],
          "children": ["title", "subtitle"]
        },
        "title": {
          "element": "h1",
          "classes": ["text-2xl", "font-bold", "text-gray-900", "mb-2"],
          "content": "Create Account"
        },
        "subtitle": {
          "element": "p",
          "classes": ["text-sm", "text-gray-600"],
          "content": "Sign up for a new account"
        },
        "auth_form": {
          "element": "form",
          "classes": ["auth-form", "space-y-6"],
          "children": ["name_row", "email_field", "password_field", "confirm_password_field", "submit_button"]
        },
        "name_row": {
          "element": "div",
          "classes": ["grid", "grid-cols-2", "gap-4"],
          "children": ["first_name_field", "last_name_field"]
        },
        "first_name_field": {
          "element": "div",
          "classes": ["field-group"],
          "children": ["first_name_label", "first_name_input", "first_name_error"]
        },
        "first_name_label": {
          "element": "label",
          "classes": ["block", "text-sm", "font-medium", "text-gray-700", "mb-2"],
          "attributes": {"for": "firstName"},
          "content": "First Name"
        },
        "first_name_input": {
          "element": "input",
          "classes": ["w-full", "px-3", "py-2", "border", "border-gray-300", "rounded-md", "focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent"],
          "attributes": {
            "type": "text",
            "id": "firstName",
            "name": "firstName",
            "placeholder": "First name",
            "required": true
          }
        },
        "first_name_error": {
          "element": "div",
          "classes": ["text-red-600", "text-sm", "mt-1", "hidden"],
          "attributes": {"role": "alert"}
        },
        "last_name_field": {
          "element": "div",
          "classes": ["field-group"],
          "children": ["last_name_label", "last_name_input", "last_name_error"]
        },
        "last_name_label": {
          "element": "label",
          "classes": ["block", "text-sm", "font-medium", "text-gray-700", "mb-2"],
          "attributes": {"for": "lastName"},
          "content": "Last Name"
        },
        "last_name_input": {
          "element": "input",
          "classes": ["w-full", "px-3", "py-2", "border", "border-gray-300", "rounded-md", "focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent"],
          "attributes": {
            "type": "text",
            "id": "lastName",
            "name": "lastName",
            "placeholder": "Last name",
            "required": true
          }
        },
        "last_name_error": {
          "element": "div",
          "classes": ["text-red-600", "text-sm", "mt-1", "hidden"],
          "attributes": {"role": "alert"}
        }
      },
      "validation_rules": {
        "firstName": ["required", "minLength:2"],
        "lastName": ["required", "minLength:2"],
        "email": ["required", "email"],
        "password": ["required", "minLength:8", "pattern:^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"],
        "confirmPassword": ["required", "matchField:password"]
      }
    }
  }
}
```

---

## 3. Layout Pattern Library

### File: `docs/layout-patterns/page-layouts.json`

```json
{
  "layout_library": "page_layouts",
  "version": "1.0.0",
  "layouts": {
    "auth_centered_layout": {
      "description": "Centered authentication forms with background",
      "viewport": "full_height",
      "structure": {
        "container": {
          "classes": ["min-h-screen", "flex", "items-center", "justify-center"],
          "background": "neutral.50"
        },
        "card": {
          "max_width": "28rem",
          "classes": ["w-full", "bg-white", "rounded-lg", "shadow-md"],
          "padding": "2rem"
        }
      },
      "responsive": {
        "mobile": {
          "container_padding": "1rem",
          "card_margin": "1rem"
        }
      }
    },
    "dashboard_sidebar_layout": {
      "description": "Dashboard with fixed sidebar navigation",
      "structure": {
        "root": {
          "classes": ["flex", "min-h-screen"]
        },
        "sidebar": {
          "width": "16rem",
          "classes": ["fixed", "left-0", "top-0", "h-full", "bg-primary-500"],
          "z_index": 1000
        },
        "main": {
          "classes": ["ml-64", "flex-1", "bg-neutral-50"],
          "padding": "2rem"
        }
      },
      "responsive": {
        "mobile": {
          "sidebar": "hidden",
          "main": "ml-0",
          "mobile_menu": "required"
        }
      }
    },
    "content_page_layout": {
      "description": "Standard content pages with header and footer",
      "structure": {
        "header": {
          "height": "4rem",
          "classes": ["fixed", "top-0", "w-full", "bg-white", "shadow-sm"],
          "z_index": 50
        },
        "main": {
          "classes": ["pt-16", "min-h-screen"],
          "max_width": "1200px",
          "margin": "0 auto",
          "padding": "2rem"
        },
        "footer": {
          "classes": ["bg-gray-800", "text-white"],
          "padding": "3rem 0"
        }
      }
    }
  }
}
```

---

## 4. Enhanced Task Template

### File: `templates/enhanced-ui-task-template.json`

```json
{
  "task_id": "FE-003-01",
  "title": "Create Authentication UI Components",
  "description": "Develop UI components for user authentication following exact design specifications",
  "priority": "HIGH",
  "complexity": 3,
  "effort_estimate": {
    "hours": 6,
    "story_points": 5
  },
  "status": "NOT_STARTED",
  
  "ui_control_specifications": {
    "design_system_version": "2.1.0",
    "component_library_reference": "docs/ui-components/auth-components-spec.json",
    "layout_pattern": "auth_centered_layout",
    "design_tokens_file": "docs/design-system/design-tokens.json",
    
    "strict_requirements": {
      "must_use_exact_html_structure": true,
      "must_use_specified_css_classes": true,
      "cannot_modify_layout_pattern": true,
      "cannot_change_color_scheme": true,
      "must_follow_component_spec": true
    }
  },
  
  "component_specifications": {
    "components_to_create": [
      {
        "name": "LoginComponent",
        "specification_reference": "docs/ui-components/auth-components-spec.json#LoginComponent",
        "required_files": [
          "src/components/auth/Login/Login.tsx",
          "src/components/auth/Login/Login.test.tsx",
          "src/components/auth/Login/index.ts"
        ],
        "template_structure": "EXACT_COPY_REQUIRED",
        "css_classes": "NO_MODIFICATIONS_ALLOWED",
        "validation_rules": "AS_SPECIFIED_ONLY"
      },
      {
        "name": "RegisterComponent", 
        "specification_reference": "docs/ui-components/auth-components-spec.json#RegisterComponent",
        "required_files": [
          "src/components/auth/Register/Register.tsx",
          "src/components/auth/Register/Register.test.tsx",
          "src/components/auth/Register/index.ts"
        ],
        "template_structure": "EXACT_COPY_REQUIRED",
        "css_classes": "NO_MODIFICATIONS_ALLOWED",
        "validation_rules": "AS_SPECIFIED_ONLY"
      }
    ]
  },
  
  "implementation_constraints": {
    "required_imports": [
      "react",
      "react-dom",
      "react-hook-form",
      "react-router-dom"
    ],
    "forbidden_modifications": [
      "HTML element structure",
      "CSS class names", 
      "Layout patterns",
      "Color values",
      "Spacing values",
      "Typography classes"
    ],
    "allowed_customizations": [
      "Component logic (TypeScript)",
      "React hooks and state management",
      "Form validation logic",
      "Event handlers",
      "API integrations"
    ]
  },
  
  "quality_gates": {
    "html_structure_validation": {
      "tool": "html-structure-validator",
      "config": "docs/validation/html-structure-rules.json",
      "must_pass": true
    },
    "css_class_validation": {
      "tool": "css-class-validator", 
      "config": "docs/validation/css-class-rules.json",
      "must_pass": true
    },
    "design_token_validation": {
      "tool": "design-token-validator",
      "config": "docs/design-system/design-tokens.json",
      "must_pass": true
    }
  },
  
  "acceptance_criteria": [
    "HTML structure EXACTLY matches the specification in auth-components-spec.json",
    "All CSS classes are used EXACTLY as specified with NO additions or modifications",
    "Component uses auth_centered_layout pattern without deviations",
    "Form validation follows the exact rules specified in the component spec",
    "Error messages display using the exact text and styling specified",
    "All components pass automated structure and class validation",
    "Responsive behavior matches the layout pattern specifications",
    "No custom styles are added beyond the approved design tokens"
  ],
  
  "validation_checklist": {
    "pre_submission": [
      "Run HTML structure validator",
      "Run CSS class validator", 
      "Run design token validator",
      "Verify component specification compliance",
      "Test responsive behavior against layout spec"
    ],
    "manual_review": [
      "Visual comparison with design spec",
      "Cross-browser testing",
      "Accessibility audit",
      "Performance validation"
    ]
  }
}
```

---

## 5. Validation Framework

### File: `docs/validation/validation-rules.json`

```json
{
  "validation_framework": {
    "version": "1.0.0",
    "rules": {
      "html_structure": {
        "required_elements": {
          "auth_components": [
            "div.auth-container",
            "div.auth-card", 
            "div.auth-header",
            "h1",
            "form.auth-form",
            "div.field-group",
            "label",
            "input",
            "button[type=submit]",
            "div.auth-footer"
          ]
        },
        "forbidden_elements": [
          "table",
          "div without classes",
          "inline styles"
        ],
        "element_hierarchy": {
          "auth-container": {
            "must_contain": ["auth-card"],
            "cannot_contain": ["form", "input"]
          },
          "auth-card": {
            "must_contain": ["auth-header", "auth-form"],
            "direct_children_only": true
          }
        }
      },
      "css_classes": {
        "required_classes": {
          "container": ["auth-container", "min-h-screen", "flex", "items-center", "justify-center", "bg-gray-50"],
          "card": ["auth-card", "max-w-md", "w-full", "bg-white", "rounded-lg", "shadow-md", "p-8"],
          "form": ["auth-form", "space-y-6"],
          "input": ["w-full", "px-3", "py-2", "border", "border-gray-300", "rounded-md"],
          "button": ["w-full", "bg-primary", "text-white", "py-2", "px-4", "rounded-md"]
        },
        "forbidden_classes": [
          "custom-*",
          "my-*",
          "temp-*"
        ],
        "class_combinations": {
          "input_focus": ["focus:outline-none", "focus:ring-2", "focus:ring-primary", "focus:border-transparent"]
        }
      },
      "design_tokens": {
        "allowed_colors": [
          "primary", "primary-hover", "success", "error", "warning",
          "gray-50", "gray-100", "gray-300", "gray-600", "gray-700", "gray-900",
          "white", "red-600"
        ],
        "allowed_spacing": [
          "p-2", "p-3", "p-4", "p-8", "px-3", "py-2", 
          "m-2", "mb-2", "mb-8", "mt-1", "mt-6",
          "space-y-4", "space-y-6"
        ],
        "allowed_typography": [
          "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl",
          "font-medium", "font-bold",
          "text-center"
        ]
      }
    },
    "validation_tools": {
      "html_validator": {
        "command": "npm run validate:html",
        "config": "validation/html-rules.js",
        "output": "validation-reports/html-report.json"
      },
      "css_validator": {
        "command": "npm run validate:css", 
        "config": "validation/css-rules.js",
        "output": "validation-reports/css-report.json"
      },
      "accessibility_validator": {
        "command": "npm run validate:a11y",
        "config": "validation/a11y-rules.js",
        "output": "validation-reports/a11y-report.json"
      }
    }
  }
}
```

---

## 6. Modified Authentication Task

### File: `tasks/FE-003-01-enhanced.json`

```json
{
  "task_id": "FE-003-01-ENHANCED",
  "title": "Create Authentication UI Components (Design-Controlled)",
  "description": "Develop authentication UI components following EXACT specifications with ZERO design variations allowed",
  
  "design_control": {
    "control_level": "STRICT",
    "specification_files": [
      "docs/ui-components/auth-components-spec.json",
      "docs/design-system/design-tokens.json", 
      "docs/layout-patterns/page-layouts.json"
    ],
    "validation_required": true,
    "creative_freedom": "NONE"
  },
  
  "implementation_instructions": {
    "step_1": {
      "action": "COPY HTML structure",
      "source": "docs/ui-components/auth-components-spec.json#LoginComponent.required_structure",
      "target": "login.component.html",
      "modifications_allowed": false
    },
    "step_2": {
      "action": "COPY CSS classes",
      "source": "auth-components-spec.json CSS class specifications",
      "modifications_allowed": false,
      "additional_classes_allowed": false
    },
    "step_3": {
      "action": "IMPLEMENT TypeScript logic",
      "requirements": [
        "Use React Hook Form for form handling",
        "Implement validation as specified",
        "Handle errors as specified",
        "NO modifications to JSX structure"
      ]
    },
    "step_4": {
      "action": "RUN validation",
      "required_validators": [
        "html-structure-validator",
        "css-class-validator", 
        "design-token-validator"
      ],
      "must_pass_all": true
    }
  },
  
  "ai_agent_constraints": {
    "absolutely_forbidden": [
      "Modifying HTML element structure",
      "Adding/removing/changing CSS classes",
      "Changing colors, fonts, or spacing",
      "Creating custom styles",
      "Altering layout patterns",
      "Making design decisions"
    ],
    "required_actions": [
      "Copy specifications exactly",
      "Implement only business logic",
      "Follow validation requirements",
      "Use only approved design tokens"
    ],
    "decision_matrix": {
      "html_structure": "NO_DECISIONS - copy exactly",
      "css_styling": "NO_DECISIONS - use specified classes only", 
      "layout": "NO_DECISIONS - use specified pattern",
      "colors": "NO_DECISIONS - use design tokens only",
      "business_logic": "FULL_DECISIONS - implement as needed",
      "validation": "NO_DECISIONS - use specified rules"
    }
  },
  
  "success_criteria": {
    "automated_validation": {
      "html_structure_score": "100%",
      "css_class_compliance": "100%", 
      "design_token_compliance": "100%",
      "accessibility_score": "100%"
    },
    "manual_validation": {
      "pixel_perfect_match": true,
      "cross_browser_consistency": true,
      "responsive_behavior": "matches_specification"
    }
  },
  
  "failure_criteria": {
    "automatic_rejection": [
      "Any HTML structure deviation",
      "Any unauthorized CSS classes",
      "Any custom styling",
      "Any design token violations",
      "Validation score below 100%"
    ]
  }
}
```

---

## 7. Implementation Script Templates

### File: `scripts/validate-ui-components.js`

```javascript
/**
 * UI Component Validation Script
 * Validates that AI-generated components match exact specifications
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

class UIValidator {
  constructor() {
    this.authSpec = require('../docs/ui-components/auth-components-spec.json');
    this.designTokens = require('../docs/design-system/design-tokens.json');
  }

  validateComponent(componentName, htmlFile, cssFile) {
    const results = {
      component: componentName,
      htmlValid: false,
      cssValid: false,
      errors: [],
      warnings: []
    };

    // Validate HTML structure
    const htmlValidation = this.validateHTMLStructure(componentName, htmlFile);
    results.htmlValid = htmlValidation.valid;
    results.errors.push(...htmlValidation.errors);

    // Validate CSS classes
    const cssValidation = this.validateCSSClasses(componentName, htmlFile);
    results.cssValid = cssValidation.valid;
    results.errors.push(...cssValidation.errors);

    return results;
  }

  validateHTMLStructure(componentName, htmlFile) {
    const spec = this.authSpec.components[componentName];
    const html = fs.readFileSync(htmlFile, 'utf8');
    const $ = cheerio.load(html);
    
    const errors = [];
    
    // Check required structure
    const requiredStructure = spec.required_structure;
    
    for (const [elementKey, elementSpec] of Object.entries(requiredStructure)) {
      const selector = this.buildSelector(elementSpec);
      const element = $(selector);
      
      if (element.length === 0) {
        errors.push(`Missing required element: ${elementKey} with selector ${selector}`);
      } else {
        // Validate classes
        const requiredClasses = elementSpec.classes || [];
        const actualClasses = element.attr('class')?.split(' ') || [];
        
        for (const requiredClass of requiredClasses) {
          if (!actualClasses.includes(requiredClass)) {
            errors.push(`Missing required class '${requiredClass}' on element ${elementKey}`);
          }
        }
        
        // Check for unauthorized classes
        const authorizedClasses = this.getAuthorizedClasses();
        for (const actualClass of actualClasses) {
          if (!authorizedClasses.includes(actualClass)) {
            errors.push(`Unauthorized class '${actualClass}' on element ${elementKey}`);
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  buildSelector(elementSpec) {
    const element = elementSpec.element || 'div';
    const classes = elementSpec.classes || [];
    const classSelector = classes.length > 0 ? '.' + classes.join('.') : '';
    return element + classSelector;
  }

  getAuthorizedClasses() {
    // Extract authorized classes from design tokens and validation rules
    return [
      // Layout classes
      'auth-container', 'auth-card', 'auth-header', 'auth-form', 'auth-footer',
      'field-group', 'min-h-screen', 'flex', 'items-center', 'justify-center',
      'max-w-md', 'w-full', 'bg-white', 'rounded-lg', 'shadow-md', 'p-8',
      'text-center', 'mb-8', 'space-y-6', 'grid', 'grid-cols-2', 'gap-4',
      
      // Typography classes
      'text-2xl', 'text-sm', 'text-base', 'font-bold', 'font-medium',
      
      // Color classes
      'text-gray-900', 'text-gray-600', 'text-gray-700', 'text-red-600',
      'text-white', 'bg-gray-50', 'bg-primary', 'hover:bg-primary-hover',
      
      // Form classes
      'block', 'border', 'border-gray-300', 'px-3', 'py-2', 'rounded-md',
      'focus:outline-none', 'focus:ring-2', 'focus:ring-primary', 
      'focus:border-transparent', 'focus:ring-offset-2',
      
      // Spacing classes
      'mb-2', 'mt-1', 'mt-6', 'space-y-4', 'hidden'
    ];
  }

  validateCSSClasses(componentName, htmlFile) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const $ = cheerio.load(html);
    const errors = [];
    
    // Check all elements for unauthorized classes
    $('*').each((index, element) => {
      const classes = $(element).attr('class')?.split(' ') || [];
      const authorizedClasses = this.getAuthorizedClasses();
      
      for (const className of classes) {
        if (className && !authorizedClasses.includes(className)) {
          errors.push(`Unauthorized CSS class: ${className}`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateValidationReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      overall_status: results.every(r => r.htmlValid && r.cssValid) ? 'PASS' : 'FAIL',
      components: results,
      summary: {
        total_components: results.length,
        passed: results.filter(r => r.htmlValid && r.cssValid).length,
        failed: results.filter(r => !r.htmlValid || !r.cssValid).length
      }
    };
    
    // Write report
    fs.writeFileSync('validation-reports/ui-validation-report.json', 
      JSON.stringify(report, null, 2));
    
    return report;
  }
}

module.exports = UIValidator;
```

---

## 8. Package.json Scripts

### File: `package-scripts.json`

```json
{
  "scripts": {
    "validate:ui": "node scripts/validate-ui-components.js",
    "validate:html": "node scripts/validate-html-structure.js",
    "validate:css": "node scripts/validate-css-classes.js",
    "validate:tokens": "node scripts/validate-design-tokens.js",
    "validate:all": "npm run validate:html && npm run validate:css && npm run validate:tokens",
    "generate:component": "node scripts/generate-component-from-spec.js",
    "lint:ui": "npm run validate:all && npm run test:ui",
    "test:ui": "jest --testPathPattern=ui-validation"
  }
}
```

---

## 9. AI Agent Instructions Template

### File: `ai-instructions/component-generation-instructions.md`

```markdown
# AI Agent Component Generation Instructions

## CRITICAL: Design Control Protocol

You are generating UI components under STRICT design control. You have ZERO creative freedom for visual design decisions.

### MANDATORY STEPS:

1. **LOAD SPECIFICATIONS FIRST**
   ```
   - Read: docs/ui-components/auth-components-spec.json
   - Read: docs/design-system/design-tokens.json
   - Read: docs/layout-patterns/page-layouts.json
   ```

2. **COPY HTML STRUCTURE EXACTLY**
   - Find your component in auth-components-spec.json
   - Copy the required_structure EXACTLY
   - Do NOT modify element hierarchy
   - Do NOT add/remove elements
   - Do NOT change element types

3. **COPY CSS CLASSES EXACTLY**
   - Use ONLY the classes specified in the component spec
   - Do NOT add additional classes
   - Do NOT modify existing classes
   - Do NOT create custom classes

4. **IMPLEMENT TYPESCRIPT LOGIC ONLY**
   - You have full freedom for component logic
   - Implement form validation as specified
   - Handle events and state management
   - Integrate with services as needed

5. **VALIDATE BEFORE COMPLETION**
   - Run: npm run validate:ui
   - Must achieve 100% validation score
   - Fix any validation errors
   - Do NOT submit until validation passes

### FORBIDDEN ACTIONS:
❌ Modifying HTML structure
❌ Adding/removing CSS classes
❌ Creating custom styles
❌ Changing colors or spacing
❌ Altering layout patterns
❌ Making any visual design decisions

### ALLOWED ACTIONS:
✅ Implementing TypeScript component logic
✅ Adding form validation logic
✅ Creating event handlers
✅ Integrating with services
✅ Adding business logic

### EXAMPLE WORKFLOW:

```typescript
// 1. Create component directory and files
mkdir -p src/components/auth/Login
touch src/components/auth/Login/Login.tsx
touch src/components/auth/Login/Login.test.tsx
touch src/components/auth/Login/index.ts

// 2. Copy JSX structure from spec
// Login.tsx - EXACT COPY from spec
<div className="auth-container min-h-screen flex items-center justify-center bg-gray-50">
  <div className="auth-card max-w-md w-full bg-white rounded-lg shadow-md p-8">
    {/* EXACT structure from auth-components-spec.json */}
  </div>
</div>

// 3. Implement TypeScript logic with React hooks
// Login.tsx - YOUR IMPLEMENTATION
export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    // Your business logic here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form implementation */}
    </form>
  );
};

// 4. Validate
npm run validate:ui
// Must return 100% pass rate
```

### VALIDATION REQUIREMENTS:
- HTML structure: 100% match
- CSS classes: 100% compliance  
- Design tokens: 100% usage
- Accessibility: 100% score

### REJECTION CRITERIA:
Any deviation from specifications will result in automatic rejection.
```

---

## 10. Team Usage Guide

### File: `docs/team-guides/ui-development-guide.md`

```markdown
# UI Development Team Guide

## Overview
This guide explains how to develop UI components with complete design control, ensuring consistent output from AI agents and human developers.

## Development Process

### For Human Developers:
1. **Reference the specifications** before starting any UI work
2. **Follow the exact HTML structure** defined in component specs
3. **Use only approved CSS classes** from the design token library
4. **Run validations** before committing code
5. **No creative design decisions** - everything is pre-defined

### For AI Agent Tasks:
1. **Create enhanced tasks** using the new task template
2. **Reference all specification files** in the task description
3. **Set strict validation requirements**
4. **Use the AI instruction template** for consistent results

## File Structure
```
project/
├── docs/
│   ├── design-system/
│   │   ├── design-tokens.json
│   │   └── component-patterns.json
│   ├── ui-components/
│   │   └── auth-components-spec.json
│   ├── layout-patterns/
│   │   └── page-layouts.json
│   └── validation/
│       └── validation-rules.json
├── scripts/
│   ├── validate-ui-components.js
│   └── generate-component-from-spec.js
├── templates/
│   └── enhanced-ui-task-template.json
└── ai-instructions/
    └── component-generation-instructions.md
```

## Quality Gates

### Automated Validation:
- HTML structure validation (100% required)
- CSS class validation (100% required)  
- Design token compliance (100% required)
- Accessibility validation (100% required)

### Manual Review:
- Visual comparison with design specs
- Cross-browser testing
- Responsive behavior verification
- User experience validation

## Benefits

### For Project Managers:
- Predictable development timelines
- Consistent quality output
- Reduced design review cycles
- Lower maintenance costs

### For Developers:
- Clear specifications to follow
- No design decision paralysis
- Automated validation feedback
- Reusable component patterns

### For Designers:
- Full control over visual output
- Systematic design implementation
- Reduced design debt
- Scalable design systems

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- Create design token library
- Define component specifications
- Setup validation framework

### Phase 2: Templates (Week 2) 
- Create enhanced task templates
- Write AI instruction guides
- Setup automation scripts

### Phase 3: Validation (Week 3)
- Implement validation tools
- Create quality gates
- Test with sample components

### Phase 4: Rollout (Week 4)
- Train team on new process
- Update existing tasks
- Monitor and refine system

This system transforms UI development from creative interpretation to precise implementation, giving you complete control over AI-generated interfaces while maintaining development speed and efficiency.
```