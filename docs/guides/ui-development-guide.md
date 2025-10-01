# The UI Development Guide: Specification-Driven Workflow

## 1. A Shift in Mindset

Welcome to the new UI development process. This guide explains our specification-driven workflow. The core principle is a **strict separation of concerns**:

-   **Designers & Architects** define the "what" and the "look" in machine-readable JSON specification files.
-   **Developers** implement the "how" (the business logic) in TypeScript, without making design decisions.

This approach is designed to produce a 100% consistent UI, eliminate design drift, and maximize the effectiveness of both human and AI developers by providing a single source of truth.

## 2. The Golden Rule: You Only Touch TypeScript

Your entire world of creative problem-solving is within the `.ts` file.

-   **You WILL**:
    -   Implement complex business logic.
    -   Manage component state.
    -   Handle user events.
    -   Integrate with backend services.
    -   Write sophisticated form validations.
-   **You WILL NOT**:
    -   Change HTML tags or their hierarchy.
    -   Add, remove, or change CSS classes.
    -   Write any custom CSS or SCSS.
    -   Make any decisions about colors, spacing, or fonts.

The HTML and CSS are considered **compiled artifacts** from the design specifications. You are implementing the code-behind.

## 3. The End-to-End Workflow

Your development process will follow these steps. For more detail, see the [UI Development Workflow document](../Process/UI_Development_Workflow.md).

1.  **Get Your Task**: You will be assigned a task that is based on the `enhanced-ui-task-template.json`. This task is your complete brief. It contains links to every specification you need.

2.  **Read the Specs**: Before you write a single line of code, open the linked files in the `ui-specs/` directory. Understand the required HTML structure, the validation rules, and the layout patterns.

3.  **Scaffold Your Component**:
    -   You can use the Angular CLI (`ng generate component ...`).
    -   Or, for a head start, use our custom generator:
        ```bash
        npm run generate:component -- --spec=auth-components-spec.json#LoginComponent
        ```
        This will create the component files and pre-populate the `.html` file for you, guaranteeing it's correct from the start.

4.  **Implement the Logic**: This is the core of your work. Open the `.ts` file and bring the component to life.

5.  **Validate Locally**: As you work, and especially before you commit, run the local validation script. It's your best friend and will prevent embarrassing CI failures.
    ```bash
    npm run validate:ui -- --component=src/app/components/auth/login
    ```
    The script will tell you instantly if you've accidentally modified the HTML or used an invalid class. Iterate until it passes.

6.  **Commit and Create a Pull Request**: The CI/CD pipeline will run the same validation script. Because you've already validated locally, it should pass, allowing your PR to be merged.

## 4. The `ui-specs` Repository: Your Source of Truth

All design decisions are codified in the `ui-specs/` directory.

-   `design-system/`: Contains the fundamental `design-tokens.json` (colors, fonts, spacing) and `component-patterns.json`.
-   `components/`: Contains the hyper-detailed specifications for each component family, including their exact HTML structure. This is your primary reference during development.
-   `layouts/`: Defines the larger page structures that your components will live within.
-   `validation/`: Contains the global rules that the validation engine uses.
-   `templates/`: Contains the task templates and AI instructions.

## 5. Benefits of This System

-   **Clarity**: You will never have to guess about a pixel, a color, or a margin. The spec has the answer.
-   **Speed**: You can focus entirely on the functional logic of the application, not the visual presentation.
-   **Consistency**: Every button, card, and form across the entire application will be 100% identical in structure and style.
-   **Confidence**: When the validator passes, you can be confident that your work meets the design requirements, leading to faster PR approvals.

Welcome to a more predictable and efficient way of building UIs.