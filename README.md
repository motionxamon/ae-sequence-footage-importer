# AE Sequence Footage Importer

CEP panel for Adobe After Effects that batch-imports rendered image sequences from a root folder, recreates the source folder structure in the Project panel, and places everything under `Footages`.

Built for motion-design and 3D render workflows where a render folder contains many nested shot/pass/version folders.

## Features

- Drag-and-drop root folder selection.
- Recursive scan through nested folders.
- Imports numbered image sequences as footage.
- Recreates the source folder hierarchy inside After Effects.
- Places imported footage under a top-level `Footages` folder.
- Optional source-root folder inside `Footages`.
- Optional skip for sequences that are already imported by source path.
- Optional manual FPS conform for imported sequences.

## Compatibility

- Adobe After Effects with CEP extension support.
- Windows-focused install notes. The panel itself is standard CEP HTML/CSS/JS plus ExtendScript.

## Install

1. Copy `AE_Sequence_Footage_Importer` to:
   `%APPDATA%\Adobe\CEP\extensions\AE_Sequence_Footage_Importer`
2. Enable unsigned CEP extensions if needed:
   - Open Registry Editor.
   - Go to `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`.
   - Create a string value named `PlayerDebugMode` with value `1`.
   - For newer AE/CEP versions, repeat for `CSXS.12` or higher if that key exists.
3. Restart After Effects.
4. Open `Window > Extensions > Sequence Footage Importer`.

## Use

Drop a root folder onto the panel or click `Choose Folder`, then click `Import Sequences`.

Use `Sequence FPS` to keep After Effects' default interpretation or conform imported sequences to a manual frame rate such as `23.976`, `24`, `25`, `29.97`, or `30`.

The panel detects numbered image sequences like:

```text
shot010_beauty.0001.exr
shot010_beauty.0002.exr
shot010_beauty.0003.exr
```

Supported image extensions include `exr`, `dpx`, `png`, `jpg`, `tif`, `tga`, `psd`, `bmp`, `rla`, `rpf`, `sgi`, `iff`, and `cin`.

## Notes

- This is an unsigned CEP extension, so `PlayerDebugMode` may be required.
- CEP is Adobe's older extension platform. The import logic is kept in ExtendScript so the core behavior can be reused if the UI is migrated later.
- The sequence detector expects filenames ending in frame numbers before the extension.

## Status

Experimental production helper. Test on a copy of a project before using it on critical work.
