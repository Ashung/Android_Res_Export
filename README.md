# Android Res Export

![](img/android_res_export.png)

[中文说明 (README in Chinese)](https://github.com/Ashung/Android_Res_Export/blob/master/README_zh.md)

Export Android resources in Sketch – PNG assets, app icon, nine-patch image and vector drawable.

## Installation

1, [Download](https://github.com/Ashung/Android_Res_Export/releases) and unzip.

2, Double-click “Android_Res_Export.sketchplugin” to install.

3, Install [ImageMagick](http://www.imagemagick.org/script/index.php) via [Homebrew](http://brew.sh/).

```bash
brew install imagemagick
```

4, Install [Node.js](https://nodejs.org/en/) and [SVGO](https://github.com/svg/svgo).

```bash
sudo npm install svgo -g
```

## How it Works

Download [demo.sketch](https://raw.githubusercontent.com/Ashung/Android_Res_Export/master/demo.sketch)

Design at MDPI (1x) size, NO support for other sizes.

Use “Make Exportable” or “Slice” to create PNG assets.

![](img/android_res_export_for_sketch_1.gif)

Use menu “Plugin” → “Android Res Export” → “New” → “9-Patch Asset” to create a 9-Patch asset.

![](img/android_res_export_for_sketch_2.gif)

Use menu “Plugin” → “Android Res Export” → “New” → “Vector drawable Asset” to create a vector drawable asset. Select the shape layers in vector drawable group, click the settings icon in fill property panel, and choose “Non-Zero”, then apply “Layer” → “Paths” → “Reverse Order” command from the main menu to reverse the path order.

![](img/android_res_export_for_sketch_3.gif)

Use page name to export asset in different folder.

## License

CC-BY-SA 4.0

[![cc-by-sa-4.0](https://i.creativecommons.org/l/by-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-sa/4.0/)

## Donate

Donate [$1.00](https://www.paypal.me/ashung/1) via PayPal.
