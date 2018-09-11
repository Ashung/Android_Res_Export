![](android_res_export.png)

**[中文说明](https://github.com/Ashung/Android_Res_Export/blob/master/README_zh.md)**

Export Android resources in Sketch.

## Features

- Export PNG or WebP assets into multiple sizes.
- Preview and export nine-patch assets into multiple sizes.
- Export vector drawable asset, support gradient and mask.
- Export app launcher icon for Android 8 and older version.
- View and export shape drawable XML code from selected layer.
- View and export color resource XML code from selected layers.

## Installation

### Install plugin

- Search "Android Res Export" from [Sketch Runner](http://sketchrunner.com/).
- Download [master.zip](https://github.com/Ashung/Android_Res_Export/archive/master.zip) and unzip, then double-click "Android_Res_Export.sketchplugin" to install.

## How it Works

Design at MDPI (1x) size, NOT support for other sizes.

You need to create new asset from selected layers, by run "Plugins" - "Android Res Export" - "New ...", then run "Export ..." to export them. while you have selected layers, the export feature will only export the layer which is selected, and deselected all to export all assets in current document.

For export bitmap and nine-patch assets, you can choose what dpi will exported in "Android Res Export" - "Preferences" dialog.

For export vector drawable, you need to install [Node.js](https://nodejs.org/en/) (8.11.4 LTS or latest version) and [svg2vectordrawable](https://github.com/Ashung/svg2vectordrawable) (2.0.0+)first, you can choose which folder to save vector assets in "Android Res Export" - "Preferences" dialog.

## License

MIT

## Donate

[Buy me a coffee](https://www.buymeacoffee.com/ashung) or donate [$5.00](https://www.paypal.me/ashung/5) [$10.00](https://www.paypal.me/ashung/10) via PayPal.
