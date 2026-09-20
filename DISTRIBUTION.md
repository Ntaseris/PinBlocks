# PinBlocks desktop distribution

## Beta 1
Current desktop version: **v0.32.1 Beta 1**.

PinBlocks is packaged as a standalone desktop application. Testers do not need Python, a terminal, or a GitHub account to run the packaged builds.

## Automated builds
`.github/workflows/build-desktop.yml` builds:
- macOS Apple Silicon
- macOS Intel
- Windows x64
- Linux x64

The workflow generates the PinBlocks application icons and packages each platform build. Run it manually from GitHub Actions for test artifacts.

## Beta security warning
Beta 1 builds are unsigned. macOS Gatekeeper and Windows SmartScreen may warn testers. Public polished distribution should add Apple Developer ID signing/notarization and Windows code signing.

## Install Mode release check
The packaged macOS Apple Silicon build has been tested end-to-end against a disposable MPF 0.80.0 project: generated YAML, install preview, mode creation, machine registry update, backup creation, MPF startup, and generated shot/counter/timer/scoring logic all worked.

Before wider distribution, testers should still use a copy or backup of their MPF project. PinBlocks refuses to overwrite an existing target mode YAML.

## Linux
The current beta is a tar.gz. AppImage can be added after the packaged Linux build is tested on actual pinball-development machines.

## Local source fallback
Developers can still run `python pinblocks_app.py`; desktop packaging does not remove that workflow.
