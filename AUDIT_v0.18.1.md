# PinBlocks v0.18.1 Stability & UX Audit

## Verified in the actual packaged v0.18.0 source
The app already clamps counters at completion, prevents completed counters from advancing, clamps timers at their end value, stops completed timers, diagnoses missing component references, validates counter/timer direction, and warns about unverifiable external lifecycle events.

## Added in this pass
- Event-chain recursion guard in Test, preventing a circular posted-event setup from freezing the simulator.
- Review warning when multiple shots share one physical switch. This is allowed because it can be intentional.
- Stronger sticky modal controls and simpler Advanced wording.
- Export review reminder.
- Generated-mode audit helper using the same diagnostics engine.

## Architecture finding
The largest regression risk is the monolithic `index.html`. UI, state, component editors, validation, compiler, simulator, and random generation all live together.

Next engineering release should be a behavior-preserving refactor into:
`styles.css`, `app.js`, `components.js`, `validation.js`, `simulator.js`, `compiler.js`, and `random_generator.js`.

Do not combine that refactor with new gameplay features.

## Product scope
Keep the beginner surface centered on modes, switches/simple shots, scoring, counters, timers, posted events, simple shot progression, Test, and YAML export. Specialized MPF concepts should stay progressively disclosed.
