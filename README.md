# PinBlocks

**Visual MPF mode builder for homebrew pinball**

Current release candidate: **v0.32.1 Beta 1**

PinBlocks is a beginner-first desktop and browser tool for building Mission Pinball Framework gameplay modes visually. Load an MPF project, create shots, counters and timers, connect gameplay with WHEN → DO rules, simulate the logic, and review the generated YAML. The desktop app can install a new mode into a backed-up MPF project; the browser beta downloads YAML without changing local project files.

## Browser beta

The static web edition can load a local MPF game folder entirely in the browser or start with a built-in demo machine. Builder state can be saved as a portable `.pinblocks` file and reopened later. See [WEB_BETA_DEPLOYMENT.md](WEB_BETA_DEPLOYMENT.md) for preview deployment, verification, and the approval-gated Houseball subdomain steps.

Run `npm test` to rebuild the JavaScript bundle and verify the browser/desktop feature paths.

## Beta 1 status
The packaged macOS Apple Silicon build has completed an end-to-end test against MPF 0.80.0: project loading, visual mode creation, simulation, YAML generation, Install Mode, project registration, backup creation, MPF startup, and generated gameplay logic.

Windows, Intel macOS and Linux packages are built automatically but still need runtime testing on those platforms.

## Testing
Please read [BETA_TESTERS.md](BETA_TESTERS.md) before testing. **Use a copy or backup of your MPF project.**

PinBlocks is intentionally not a complete visual editor for every MPF feature yet.
