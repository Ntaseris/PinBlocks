# PinBlocks v0.32.0 Beta 1

Thanks for testing PinBlocks. This beta is meant to find confusing workflows and packaging problems before a wider release.

## Before you start
Use a **copy or backed-up version** of your MPF project. PinBlocks is read-only until you explicitly choose **Install Mode**, but the install feature intentionally writes a new mode file and may update the machine's mode registry.

## Which download?
- **PinBlocks-macOS-arm64** — Apple Silicon Macs (M1, M2, M3, M4 and newer Apple chips)
- **PinBlocks-macOS-intel** — Intel Macs
- **PinBlocks-Windows-x64** — 64-bit Windows
- **PinBlocks-Linux-x64** — 64-bit Linux

No Python installation or terminal is required for the packaged builds. PinBlocks starts a local server and opens your default browser at 127.0.0.1:8765.

## macOS
The beta is not yet Apple-signed/notarized, so Gatekeeper may block the first launch.

If macOS offers only **Close** or **Move to Trash**, choose **Close**, then open **System Settings → Privacy & Security**, find the PinBlocks blocked-app message, and choose **Open Anyway**. Authenticate and confirm Open if prompted.

If a replacement build says PinBlocks cannot be opened, quit the previous PinBlocks process first. Open **Activity Monitor**, search for **PinBlocks**, select it, and Force Quit it. Beta 1 also refuses to silently connect a new build to an older PinBlocks server.

## Windows
The beta is not yet code-signed, so Microsoft Defender SmartScreen may warn that the publisher is unknown. Confirm that the file came from the official PinBlocks beta distribution, then use the Windows option to show more information and run it if you choose to continue.

## Linux
Extract the tar.gz and run the bundled PinBlocks executable. The folder chooser uses Zenity when available. If your distribution does not include Zenity, use PinBlocks' manual project-path field.

## First test
1. Open PinBlocks and confirm your browser opens automatically.
2. Choose a backed-up MPF game folder.
3. Run **Build Your First Mode** from beginning to end.
4. Confirm the Guided Build reaches **TEST ✓ COMPLETE** after the third shot.
5. Build a small mode of your own and review the generated YAML.
6. On a disposable/copy project, test **Install Mode**. Confirm the preview shows the expected paths before installing.

## Install Mode safety
PinBlocks will not overwrite an existing target mode YAML. When it needs to add the new mode to `config/config.yaml`, it creates a timestamped `config.yaml.pinblocks-backup-...` first.

## Please report
Tell us:
- operating system and, for Mac, Apple Silicon vs Intel;
- PinBlocks version shown in the upper-right;
- what you were trying to do;
- what you expected;
- what happened instead;
- a screenshot if the problem is visual;
- whether the exported/installed mode actually ran in MPF, when applicable.

The beta is intentionally not a complete visual editor for every MPF feature.
