# AE Sequence Footage Importer

CEP panel for Adobe After Effects. It imports rendered image sequences from a root folder, recreates the source folder structure in the Project panel, and places everything under `Footages`.

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
