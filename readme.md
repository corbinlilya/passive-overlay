# Passive Overlay

A tiny Electron app that shows an image above all windows and ignores clicks when not editing. You can load an image, adjust opacity from the tray, and tweak X, Y, and Scale from a small popup panel.

## Features

* Always on top
* Click through by default
* Load image from tray menu or hotkey
* Edit Mode with sliders for X, Y, and Scale
* Settings saved locally
* Works on Windows. macOS and Linux may require compositor settings

## Requirements

* Node.js LTS (18 or newer recommended)
* npm

## Quick start

```bash
# in a new folder that contains package.json, main.js, preload.js, index.html
npm install
npm start
```

## Keyboard shortcuts

* `Ctrl + Alt + O`  Load image
* `Ctrl + Alt + H`  Show or hide overlay
* `Ctrl + Alt + E`  Toggle Edit Mode

## Tray menu

* Load Image...
* Opacity

  * 100%
  * 85%
  * 70%
  * 50%
* Edit Overlay
* Open DevTools
* Show or Hide
* Quit

## Using the app

1. Start the app with `npm start`
2. Use the tray icon near the system clock
3. Pick an image with the tray menu or press `Ctrl + Alt + O`
4. Enter Edit Mode with `Ctrl + Alt + E`
5. Use the sliders to adjust X, Y, and Scale
6. Click Done in the panel to exit Edit Mode and return to click through

## File layout

```
your-folder/
  package.json
  main.js
  preload.js
  index.html
  README.md
```

## How it works

* The overlay window is borderless, transparent, always on top, and click through
* Images are sent from the main process to the renderer as a data URL
* A tiny alpha value on the background helps Windows reliably paint transparent content
* Edit Mode temporarily allows clicks so the panel can be used

## Troubleshooting

* Image does not appear

  * Try a local PNG or JPG from your Pictures folder
  * Use tray menu → Open DevTools and check the console for errors
  * Make sure the window is not hidden with `Ctrl + Alt + H`

* Only a white box shows

  * This build already uses a data URL and a tiny alpha background to improve painting on Windows
  * If you still see issues, try lowering opacity from the tray to force a repaint

* Sliders do not work

  * You must be in Edit Mode. Press `Ctrl + Alt + E`

* Overlay not above games

  * Exclusive fullscreen apps can sit above everything. Borderless windowed mode usually works

## Build a distributable (optional)

You can package the app for distribution.

Using electron packager:

```bash
npm i -D electron-packager
npx electron-packager . PassiveOverlay
```

Using electron builder:

```bash
npm i -D electron-builder
npx electron-builder
```

## Privacy

* Images are read from your disk and shown locally
* No network requests are made

## License

MIT
