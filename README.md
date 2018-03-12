# Android Res Export

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export.png?raw=true)

[中文说明](https://github.com/Ashung/Android_Res_Export/blob/master/README_zh.md)

Export Android resources in Sketch – PNG assets, app icon, nine-patch image, shape XML, color resource xml and vector drawable.

## Features

- Export PNG assets into multiple sizes.
- Preview and export nine-patch assets into multiple sizes.
- Export app launcher icon for Android 8 and older version.
- View and export shape drawable XML code.
- Export vector drawable asset.
- Compress PNGs after export use ImageOptim.
- View and export color resource XML code from Sketch document colors or selected layers.

## Installation

### Install plugin

- Search "Android Res Export" from [Sketch Runner or [Sketchpacks](https://sketchpacks.com/).
- Download [master.zip](https://github.com/Ashung/Android_Res_Export/archive/master.zip) and unzip, then double-click "Android_Res_Export.sketchplugin" to install.

### Nine-patch support configure

Install Command Line Tools.

```shell
xcode-select --install
```

Install [Homebrew](http://brew.sh/).

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

After hombrew installed, use this command to install ImageMagick.

```bash
brew install imagemagick
```

### Vector drawable support configure

Install [Node.js](https://nodejs.org/en/). Then use this command to install [SVGO](https://github.com/svg/svgo) and [svg2vectordrawable](https://github.com/Ashung/svg2vectordrawable).

```bash
npm install -g svgo svg2vectordrawable
```

## How it Works

Design at MDPI (1x) size, NOT support for other sizes. Download [demo.sketch](https://github.com/Ashung/Android_Res_Export/blob/develop/demo.sketch)

Use menu "Plugins" - "Android Res Export" - "New PNG Asset" to create PNG assets.

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_1.gif?raw=true)

Use menu "Plugin" - "Android Res Export" - "New Nine-Patch Asset" to create a nine-patch asset. Run "Nine-Patch Preview " for preview the nine-patch assset.

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_2.gif?raw=true)

Use menu "Plugin" - "Android Res Export" - "New Vector Drawable Asset" to create a vector drawable asset. 

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_3.gif?raw=true)

If you want to support Android API < 24 (7.0), select the shape layers in vector drawable group, click the settings icon in fill property panel, and choose "Non-Zero".

Before export the assets, you must create them use "New ... Asset" in plugin menu. Selected the spical asset layer group, then run "Export ... Assets" to export them, and deselected all to export all assets.

For app icons, you need to selected the template page, before run the "Export App Icon".

## License

Apache 2.0

## Donate

Donate[$2.00](https://www.paypal.me/ashung/2), [$5.00](https://www.paypal.me/ashung/5) [$10.00](https://www.paypal.me/ashung/10) via PayPal.
