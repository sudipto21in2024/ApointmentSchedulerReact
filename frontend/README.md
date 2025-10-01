# Frontend Application

Welcome to the Frontend Application for the Appointment Booking System.

## **IMPORTANT: A New Way of Working**

This project follows a strict, **specification-driven** UI development workflow. Unlike traditional projects, creative freedom in visual implementation (HTML structure, CSS styling) is **zero**. Your primary role as a developer is to implement business logic in TypeScript, while the visual structure is dictated by a central design repository.

**DO NOT manually edit HTML or write custom CSS/SCSS.** All visual aspects are controlled by specifications and validated automatically.

## The Golden Rule

> The **HTML structure and CSS classes** are an exact, verbatim copy from the component specification file. Your focus is **100% on the TypeScript (`.ts`) file** to implement the logic and behavior.

## Development Workflow

1.  **Receive a Task**: Your task will be based on an "Enhanced Task Template" and will contain links to all the specifications you need.
2.  **Find Your Spec**: The task will point you to a component specification file in the `/ui-specs` directory (e.g., `ui-specs/components/auth-components-spec.json`).
3.  **Scaffold the Component**:
    -   You can generate the component files using the Angular CLI (`ng generate component ...`).
    -   Alternatively, use the custom generator script: `npm run generate:component -- --spec=auth-components-spec.json#LoginComponent`. This will create the files and pre-populate the HTML for you.
4.  **Implement Logic**:
    -   Open the `.ts` file.
    -   Build the `FormGroup` and `FormControl`s.
    -   Add the validators required by the spec.
    -   Write the methods to handle form submission and other user interactions.
    -   Integrate with backend services.
5.  **Validate Your Work**:
    -   Before committing, run the local validation script:
        ```bash
        npm run validate:ui -- --component=src/app/components/path/to/your-component
        ```
    -   You **must** achieve a 100% pass rate. The CI/CD pipeline will reject any commit that fails this check.
6.  **Commit and Push**: Once validation passes, you can commit your code.

## Key Scripts

-   `npm run start`: Starts the local development server.
-   `npm run build`: Builds the application for production.
-   `npm run test`: Runs unit tests.
-   `npm run validate:ui`: Validates UI components against their specifications.
-   `npm run generate:component`: (Optional) Scaffolds a new component from a specification.

## Project Structure Quick Guide

-   `/`: The root of this Angular application.
-   `src/app/components`: All UI components live here.
-   `/ui-specs` (in project root): **This is the source of truth.** All design tokens, component structures, and layout patterns are defined here. You will read from this directory often.
-   `/scripts` (in project root): Contains the validation and generation scripts.

For a complete breakdown of the architecture and workflow, please review the documents in the `/docs/Architecture/UI` and `/docs/Process` directories.