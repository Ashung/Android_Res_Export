# Android Res Export for Sketch

Export Android resouces in Sketch, include PNG assets, app icon, nine-patch image and vector drawable.

## Installation

1. Download and unzip.


2. Double-click "Android_Res_Export.sketchplugin" to install.

3. Install [ImageMagick](http://www.imagemagick.org/script/index.php) if you want to export Nine-patch image.

   Use [Homebrew](http://brew.sh/) to install ImageMagick.

   ```bash
   brew install imagemagick
   ```

4. Install [Node.js](https://nodejs.org/en/) and [SVGO](https://github.com/svg/svgo) if you want to export vector drawable.

   ```bash
   sudo npm install svgo -g
   ```

## How it Works

1. Design at MDPI (1x) size, NOT support other sizes.
2. Use "Make Exportable" or "Slice" to export PNGs.
3. ​