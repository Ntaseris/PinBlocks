# PinBlocks desktop distribution

PinBlocks remains a local web app, but beta testers should not need Python or a terminal.

## What the packaged app does
Double-clicking PinBlocks starts its local server and opens the user's default browser to `127.0.0.1:8765`.

## Automated builds
`.github/workflows/build-desktop.yml` builds:
- macOS Apple Silicon
- macOS Intel
- Windows x64
- Linux x64

Run the workflow manually from GitHub Actions for test artifacts, or push a `v*` tag to also create a prerelease containing the platform downloads.

## Beta security warning
These RC builds are unsigned. macOS Gatekeeper and Windows SmartScreen may warn testers. Public polished distribution should add Apple Developer ID signing/notarization and Windows code signing.

## Linux
The current beta is a tar.gz on purpose. AppImage can be added after the packaged Linux build is tested on actual pinball-development machines.

## Local source fallback
Developers can still run `python pinblocks_app.py`; desktop packaging does not remove that workflow.
