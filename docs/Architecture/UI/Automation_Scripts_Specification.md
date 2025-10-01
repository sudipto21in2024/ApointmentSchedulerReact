# Automation Scripts: Technical Specification

## 1. Introduction

This document provides the technical specification for the Node.js scripts that form the backbone of the UI Control System's automation and validation capabilities. These scripts are critical for enforcing design consistency and streamlining the development process.

## 2. Script 1: Validation Engine (`scripts/validate-ui.js`)

This script is the heart of the quality gate. It validates a given component against its formal specification.

### 2.1. Invocation

The script will be executable via `npm` and will accept command-line arguments.

```bash
# Example
npm run validate:ui -- --component=src/app/components/auth/login
```

-   **`--component`**: (Required) The path to the component's directory. The script will derive the paths to the `.html` and `.ts` files from this.

### 2.2. Core Logic & Sub-routines

The script will be class-based (`UIValidator`) and orchestrate several validation sub-routines.

#### **`constructor(componentPath)`**

-   Parses the `componentPath` to determine the component's name (e.g., `login`).
-   Locates the relevant spec file (e.g., `ui-specs/components/auth-components-spec.json`). This may require a mapping configuration if the naming convention isn't direct.
-   Loads the component's spec (e.g., `authSpec.components.LoginComponent`) into memory.
-   Loads the component's HTML file content.
-   Loads the global `validation-rules.json` and `design-tokens.json` into memory.

#### **`run()`**

-   Executes all validation routines in sequence.
-   Aggregates errors from each routine.
-   Calls `generateReport()` at the end.
-   Exits with code `1` if errors are found, `0` otherwise.

#### **`validateHTMLStructure()`**

-   **Input**: Component HTML content, component's `required_structure` spec.
-   **Process**:
    1.  Use `cheerio` to load the HTML content.
    2.  Implement a recursive function `(specNode, parentElement)` that traverses the `required_structure` tree.
    3.  For each `specNode`, build a CSS selector based on its `element` and `classes`.
    4.  Search for this selector within the `parentElement`. If not found, log a "Missing Element" error.
    5.  For each child in `specNode.children`, recursively call the function with the child spec and the current found element.
    6.  Check against `forbidden_elements` from the global validation rules.
-   **Output**: An array of error objects.

#### **`validateCSSClasses()`**

-   **Input**: Component HTML content, `design-tokens.json`, global `validation-rules.json`.
-   **Process**:
    1.  Create an `allowedClasses` Set. Populate it with every class name found in the `required_structure` of the spec, all class names derivable from the design tokens (e.g., `text-primary-500`, `p-4`), and any utility classes defined in the validation rules.
    2.  Use `cheerio` to select all elements (`$('*')`).
    3.  Iterate over every element and every class on that element.
    4.  If a class is not in the `allowedClasses` Set, log an "Unauthorized Class" error.
    5.  Check for forbidden patterns (e.g., `custom-*`) from the global rules.
-   **Output**: An array of error objects.

#### **`generateReport(errors)`**

-   **Input**: An aggregated array of all error objects from the validation routines.
-   **Process**:
    1.  Construct a JSON report object containing:
        -   `timestamp`
        -   `componentPath`
        -   `status`: 'PASS' or 'FAIL'
        -   `errorCount`
        -   `errors`: The array of error objects. Each error should have a `type` (e.g., 'MissingElement', 'UnauthorizedClass') and a descriptive `message`.
    2.  Print the JSON report to `stdout`.
    3.  Optionally, write the report to a file in a `validation-reports/` directory.

## 3. Script 2: Component Generator (`scripts/generate-component.js`)

This script is a developer productivity tool that scaffolds a new component from a specification.

### 3.1. Invocation

```bash
# Example
npm run generate:component -- --spec=auth-components-spec.json#LoginComponent
```

-   **`--spec`**: (Required) A reference to the component specification. The format is `fileName#componentName`.

### 3.2. Core Logic

#### **`constructor(specReference)`**

-   Parses the `specReference` to get the file name and component name.
-   Loads the specified file (e.g., `ui-specs/components/auth-components-spec.json`).
-   Loads the specific component's spec object.
-   Determines the target path for the new component (e.g., `frontend/src/app/components/auth/login`).

#### **`run()`**

-   Creates the target directory.
-   Calls `generateHTMLFile()`.
-   Calls `generateTSFile()`.
-   Calls `generateSCSSFile()`.
-   Logs a success message to the console.

#### **`generateHTMLFile()`**

-   **Process**:
    1.  Implement a recursive function that takes a `specNode` from the `required_structure` and returns an HTML string.
    2.  This function will construct the opening tag with all its classes, recursively call itself for all children, and then add the closing tag.
    3.  Properly indent the output for readability.
    4.  Write the resulting string to the `.html` file.

#### **`generateTSFile()`**

-   **Process**:
    1.  Create a template string for a basic Angular component.
    2.  Inject the component's name (e.g., `LoginComponent`).
    3.  **Bonus**: Parse the `validation_rules` from the spec to pre-populate a `FormGroup` with `FormControl`s and their basic validators.
    4.  Write the resulting string to the `.ts` file.

#### **`generateSCSSFile()`**

-   **Process**:
    1.  Create the `.scss` file. It can be empty or contain a single comment block.
    2.  `/* This file is intentionally left blank. All styling is driven by design tokens and utility classes. */`

## 4. Dependencies

-   `Node.js` (LTS version)
-   `cheerio`: For server-side DOM manipulation.
-   `yargs` or `commander`: For robust command-line argument parsing.
-   `fs-extra`: For convenient file system operations.