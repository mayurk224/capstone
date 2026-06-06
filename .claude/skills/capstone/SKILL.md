```markdown
# capstone Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `capstone` JavaScript repository. You will learn how to structure files, write code, follow commit conventions, and manage testing in this codebase. The repository does not use a framework, so patterns are vanilla JavaScript.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.js`, `dataFetcher.js`

### Import Style
- Use **relative imports** for modules.
  - Example:
    ```javascript
    import fetchData from './dataFetcher';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```javascript
    // In dataFetcher.js
    const fetchData = () => { /* ... */ };
    export default fetchData;
    ```

### Commit Messages
- Follow **Conventional Commits** with the `feat` prefix for new features.
  - Example:
    ```
    feat: add user authentication to login page
    ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature-development`

1. Create a new JavaScript file using camelCase naming.
2. Implement the feature logic.
3. Use relative imports to include dependencies.
4. Export the main function or component as default.
5. Write or update corresponding test files (`*.test.*`).
6. Commit changes with a message starting with `feat:` and a concise description.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Run your preferred JavaScript test runner (framework not specified).
3. Review test results and fix any failing cases.

## Testing Patterns

- Test files are named with the `*.test.*` pattern (e.g., `userProfile.test.js`).
- The specific testing framework is not specified; use your preferred JavaScript test runner.
- Example test file structure:
  ```javascript
  import fetchData from './dataFetcher';

  test('fetchData returns expected data', () => {
    // Arrange
    // Act
    // Assert
  });
  ```

## Commands
| Command               | Purpose                                 |
|-----------------------|-----------------------------------------|
| /feature-development  | Guide for adding a new feature          |
| /run-tests            | Steps to run and verify tests           |
```
