# PinBlocks desktop distribution

PinBlocks remains a local web app, but beta testers should not need Python, a terminal, or a GitHub account.

## Beta 1
Current desktop version: **v0.32.0 Beta 1**.

Double-clicking PinBlocks starts its local server and opens the default browser to `127.0.0.1:8765`. Static assets are served with no-cache headers so a new desktop build does not reuse an older browser bundle.

If port 8765 is occupied, the launcher checks `/api/app-info`. It will reopen the browser only when the already-running PinBlocks server is the **same version**. A different PinBlocks version is treated as a version collision instead of silently opening stale code.

## Automated builds
`.github/workflows/build-desktop.yml` builds:
- macOS Apple Silicon
- macOS Intel
- Windows x64
- Linux x64

Run the workflow manually from GitHub Actions for test artifacts. The resulting platform files can be downloaded and redistributed directly to testers; testers do not need GitHub.

## Beta security warning
Beta 1 builds are unsigned. macOS Gatekeeper and Windows SmartScreen may warn testers. Public polished distribution should add Apple Developer ID signing/notarization and Windows code signing.

## Install Mode release check
Before distributing a build widely, test Install Mode against a disposable MPF project from the **packaged binary**, not only source:
1. preview the install;
2. confirm the target mode path and machine config path;
3. install;
4. confirm the mode YAML exists;
5. confirm the machine `modes:` registry contains the mode;
6. confirm a timestamped machine-config backup was created when the registry changed;
7. attempt the same install again and confirm overwrite is refused.

## Linux
The current beta is a tar.gz on purpose. The Linux folder chooser uses Zenity when available; the manual path field remains the fallback. AppImage can be added after the packaged Linux build is tested on actual pinball-development machines.

## Local source fallback
Developers can still run `python pinblocks_app.py`; desktop packaging does not remove that workflow.
