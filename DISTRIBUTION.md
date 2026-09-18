# PinBlocks desktop distribution

PinBlocks remains a local web app, but beta testers should not need Python or a terminal.

Double-clicking the packaged application starts its local server and opens the user's default browser to 127.0.0.1:8765.

The GitHub Actions workflow builds macOS Apple Silicon, macOS Intel, Windows x64, and Linux x64 packages. RC builds are currently unsigned, so macOS Gatekeeper and Windows SmartScreen may warn testers.

Linux is distributed as a tar.gz for the first beta. AppImage can be added after the packaged Linux build is tested on actual pinball-development machines.
