# AGENTS.md - Developer Guidelines for datalist-css

## Project Overview

This is a lightweight JavaScript library that enables CSS styling of HTML5 `<datalist>` and `<option>` elements. The project uses ES modules, Rollup for bundling, and has no external test/lint dependencies configured.

- **Repository**: https://github.com/craigbuckler/datalist-css
- **Node Version**: v22.21.0 (see `.nvmrc`)
- **Package Manager**: npm

---

## Commands

### Build

```bash
npm run build
```

Builds both standard and minified versions to `dist/`:
- `dist/datalist-css.js` - Standard ES module
- `dist/datalist-css.min.js` - Minified with Terser

### Development Server

```bash
npm run start
```

Starts a development server with live reload using `@web/dev-server`.

### Testing

**No test framework is currently configured.** The project relies on manual testing via `demo.html`.

To add tests in the future, consider adding Vitest or Jest.

### Linting

**No linter is currently configured.** There is no ESLint, Prettier, or other linting setup.

---

## Code Style Guidelines

### General Principles

- Use **ES6+** features (const/let, arrow functions, for-of, destructuring, spread)
- Use **2-space indentation** (per `.editorconfig`)
- Use **single quotes** for strings
- **No semicolons** at line endings
- Use **LF** line endings
- UTF-8 charset

### File Structure

```
src/
  datalist-css.js    # Main source file
dist/
  datalist-css.js    # Built output
  datalist-css.min.js # Minified output
demo.html            # Manual testing page
rollup.config.js     # Build configuration
```

### Naming Conventions

- **Variables/Functions**: `camelCase` (e.g., `inyectDataListCss`, `inputElement`)
- **Constants**: `UPPER_SNAKE_CASE` if truly constant (e.g., `keymap` uses numeric keys)
- **CSS Classes**: `kebab-case` with BEM-like modifiers (e.g., `datalist--visible`)
- **File Names**: `kebab-case` (e.g., `rollup.config.js`, `datalist-css.js`)

### Functions

- Use `function` keyword for top-level functions (not arrow functions)
- Use arrow functions for callbacks and inline functions where appropriate
- Add **JSDoc comments** for public API functions:

```javascript
/**
  * Description of function
  * @param {HTMLElement} paramName - Description
  * @returns {Type} Description
  */
function functionName(paramName) { }
```

### Exports

- Use named exports at end of file or inline:

```javascript
export { functionName };
// or
export function functionName() { }
```

### Error Handling

- Use early returns to avoid nesting
- Validate inputs at function entry
- No try/catch unless absolutely necessary (this is a simple library)

### Imports

- Use ES module syntax only:

```javascript
import terser from "@rollup/plugin-terser";
```

- No default exports in source (clarity over convenience)

### DOM Access

- Use `document` and `window` directly (no framework abstractions)
- Check for `typeof document !== "undefined"` before DOM access for SSR safety

### Event Handling

- Use `addEventListener` for all events
- Use named handler functions (not anonymous functions) for traceability

### CSS Classes

- Prefix with `datalist` to avoid conflicts
- Use modifier pattern: `datalist--visible`, `datalist--hidden`

---

## Working with the Codebase

### Before Committing

1. Run `npm run build` to verify the build works
2. Test changes manually in `demo.html`
3. Ensure no console errors in browser

### Common Tasks

- **Adding a new function**: Add to `src/datalist-css.js`, export it, then build
- **Testing locally**: Run `npm run start` and open the browser
- **Checking Node version**: `node -v` should match `.nvmrc` (v22.21.0)

---

## Notes for AI Agents

- This is a **simple, single-file library** - avoid over-engineering
- No TypeScript, no tests, no linting - keep changes minimal and focused
- The main logic transforms `<datalist>` elements to behave like custom `<div>` dropdowns
- Focus on browser compatibility and keeping bundle size small
- If adding dependencies, consider the impact on the 1.5Kb minified size
- When doing a git commit ,always put a line indicating that was done with
  OpenCode (or Cursor, etc...) and what model was used.
- Never do a git push if the user don't ask it.

