# v0.19.0 Refactor Notes

## Why
By v0.18.1, unrelated systems lived in one large `index.html`. Small edits could break Test, Random Mode, or component editing because every feature shared one file.

## Boundaries
- `app.js`: application shell and rule-builder interaction
- `components.js`: component editing and lifecycle UI
- `validation.js`: diagnostics and health
- `simulator.js`: internal visual test engine
- `compiler.js`: generated MPF YAML
- `random_generator.js`: constrained random-mode creation

These remain classic browser scripts rather than ES modules for now. That preserves the existing shared global state and minimizes behavior changes during the refactor.

## Next
After v0.19 is user-tested, compiler correctness should be investigated against real MPF documentation/config examples before expanding the supported gameplay surface.
