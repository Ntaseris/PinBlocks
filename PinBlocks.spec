# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path

ROOT=Path(SPECPATH)
assets=[
    ("index.html","."),
    ("styles.css","."),
    ("app.js","."),
    ("components.js","."),
    ("validation.js","."),
    ("simulator.js","."),
    ("compiler.js","."),
    ("random_generator.js","."),
]
# Include common image assets if present.
for ext in ("*.png","*.jpg","*.jpeg","*.svg","*.ico","*.icns"):
    for p in ROOT.glob(ext):
        assets.append((p.name,"."))

a=Analysis(
    ["pinblocks_launcher.py"],
    pathex=[str(ROOT)],
    binaries=[],
    datas=assets,
    hiddenimports=["yaml","mpf_project_reader"],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz=PYZ(a.pure)
exe=EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="PinBlocks",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
)
coll=COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="PinBlocks",
)
import platform
if platform.system()=="Darwin":
    app=BUNDLE(
        coll,
        name="PinBlocks.app",
        icon=None,
        bundle_identifier="com.houseballamusements.pinblocks",
        info_plist={
            "CFBundleName":"PinBlocks",
            "CFBundleDisplayName":"PinBlocks",
            "CFBundleShortVersionString":"0.32.0",
            "NSHighResolutionCapable":True,
        },
    )
