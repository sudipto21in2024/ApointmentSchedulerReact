# AI Agent Instructions: UI Component Generation

## **MANDATORY DIRECTIVE: STRICT COMPLIANCE REQUIRED**

You are an AI agent tasked with generating an Angular UI component. Your operational context is governed by a **Zero-Deviation Design Policy**. You have no creative freedom regarding HTML structure, CSS styling, or any other visual aspect of the component. Your sole purpose is to implement the business logic within the TypeScript file based on the provided specifications.

---

## **Non-Negotiable Workflow**

### 1. **Ingest Task & Specifications**
   - Your input is a task conforming to the `enhanced-ui-task-template.json` schema.
   - **First Action**: Read the files specified in the `ui_control_specifications` and `component_specifications` sections of the task.
   - **Required Reading**:
     - `ui-specs/design-system/design-tokens.json`
     - The component specification file (e.g., `ui-specs/components/auth-components-spec.json`)
     - The layout pattern file (e.g., `ui-specs/layouts/page-layouts.json`)

### 2. **Generate Component Files**
   - Create the required files as specified in `component_specifications.components_to_create.required_files`.
   - **Example**:
     - `frontend/src/app/components/auth/login/login.component.ts`
     - `frontend/src/app/components/auth/login/login.component.html`
     - `frontend/src/app/components/auth/login/login.component.scss`

### 3. **Populate the HTML File**
   - Locate the correct component entry in the specification file (e.g., `LoginComponent`).
   - **Action**: Copy the **entire `required_structure` object** and translate it into a `.html` file.
   - **Constraint**: This must be a **1:1, verbatim copy**. Do not add, remove, or reorder any elements. Do not modify any class names or attributes.

### 4. **Populate the SCSS File**
   - **Action**: Create the `.scss` file.
   - **Constraint**: This file **must remain empty** or contain only the following comment:
     ```scss
     /* This file is intentionally left blank. All styling is driven by design tokens and utility classes referenced in the HTML structure. */
     ```

### 5. **Implement TypeScript Logic**
   - This is your **only** area of implementation.
   - **Actions**:
     - Create the component class (e.g., `export class LoginComponent`).
     - Import `ReactiveFormsModule` and other necessary Angular modules.
     - Construct the `FormGroup` and `FormControl`s as required by the component's purpose.
     - Implement the validation rules specified in the component spec's `validation_rules` section using Angular's `Validators`.
     - Create methods for event handling (e.g., `onSubmit()`).
     - Integrate with any required services.

### 6. **Validate Before Completion**
   - **Final Action before a successful exit**: Execute the validation script.
   - **Command**: `npm run validate:ui -- --component=<path_to_your_component>`
   - **Constraint**: The script must exit with a **100% pass rate**. If it fails, you must analyze the error report, correct your implementation (likely in the `.html` file if you deviated from the spec), and re-run validation until it passes.

---

## **Decision Matrix**

| Subject | Your Level of Freedom | Action |
| :--- | :--- | :--- |
| **HTML Structure** | **NONE** | Copy `required_structure` exactly. |
| **CSS / SCSS** | **NONE** | Do not write any styles. |
| **Layout & Positioning**| **NONE** | Use classes from the spec only. |
| **Colors & Fonts** | **NONE** | Use classes from the spec only. |
| **TypeScript Logic** | **FULL** | Implement business logic as needed. |
| **Form Validation** | **LIMITED** | Implement rules from the spec exactly. |

---

## **FAILURE CONDITIONS (Automatic Rejection)**

Any of the following will result in a failed task:
-   Any deviation in the final HTML structure from the `required_structure` spec.
-   The presence of any CSS class in the HTML that is not in the spec or derived from the design tokens.
-   The presence of any custom styles in the `.scss` file.
-   A validation script result of less than 100%.

Your adherence to this protocol is paramount.