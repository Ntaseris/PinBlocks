# PinBlocks v0.32.0 RC1 — Beta readiness

Created from a first-time-builder and robustness audit of v0.31.1.

Two real Guided Build regressions were found and fixed:
- Step 3 was still looking for the old `Save Rule` label instead of the current `Create Rule` button.
- Step 4 was looking for old `Make shot:` wording instead of the current Machine Inputs `MAKE SHOT` control.

Automated/static checks:
- All JavaScript parses successfully.
- Python server compiles successfully.
- Guided Build path is present from Shot → 3-hit Counter → Rule → Test → “Your first mode works!” → YAML.
- Existing imported modes retain the export/overwrite safety lock.

Executed disposable-project install test:
- Preview resolved the standard mode path.
- Install created `modes/newbie_test/config/newbie_test.yaml`.
- Install registered the mode in `config/config.yaml`.
- A timestamped backup of config.yaml was created.
- A second install was blocked instead of overwriting the existing mode.

Beta boundary:
This is a release candidate for limited beta testing, not complete MPF coverage. Until more outside projects exercise Install Mode, beta testers should use a copy/backup of their MPF project.
