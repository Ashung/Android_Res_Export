# Android Res Export

用于导出 Android 各种资源的 Sketch 插件，包括 PNG 资源、App 图标、点九图和 vector drawable XML 文件。

## 安装步骤

1. [下载](https://github.com/Ashung/Android_Res_Export/releases) 并解压。

2. 双击 "Android_Res_Export.sketchplugin" 文件。

3. 导出点九图功能依赖 [ImageMagick](http://www.imagemagick.org/script/index.php)，推荐使用 [Homebrew](http://brew.sh/index_zh-cn.html) 来安装 ImageMagick。也可以 [MacPorts](https://www.macports.org/) 来安装 ImageMagick，MacPorts 安装较 Homebrew 复杂，以下只介绍使用 Homebrew 的安装方法。

   首先打开终端，粘贴 [Homebrew](http://brew.sh/index_zh-cn.html) 主页上的代码后，按下回车。

   安装完毕之后，在终端输入以下命名用来安装 ImageMagick。

   ```bash
   brew install imagemagick
   ```

4. 导出 Vector Drawable 功能使用 [SVGO](https://github.com/svg/svgo) 优化代码。您需要先安装 [Node.js](https://nodejs.org/en/)，从 Node.js 主页上下载 PKG 安装包，按照安装向导安装 Node.js，这个过程很简单，只需要一路点下一步。

   安装完成后，打开终端输入以下命名用来安装 SVGO。

   ```bash
   sudo npm install svgo -g
   ```

## 如何使用

下载演示文件 [demo.sketch](https://raw.githubusercontent.com/Ashung/Android_Res_Export/master/demo.sketch)。

1. 设计稿必须是 MDPI (1x) 尺寸, 目前不支持以后也不会支持其他尺寸的设计稿。
2. 普通的 PNG 资源使用 "Make Exportable" 或者加切片的方式来表示此图层将会被导出。
   ![](img/export_png_assets.png)
3. 需要导出点九图的内容必须是一个组，并且组内必须包含两个名称分别为 "path" 和 "content" 的组，分别用来绘制点九的线和内容。"content" 组下必须包含一个命名为 "#9patch" 的切片，切片区域紧接着点九的线。
   ![](img/export_nine_patch.png)
4. 需要导出 Vector drawable 的内容必须是一个组，组内需要一个命名为 "#" 的矩形图层，此图层用于表示切图的边界。
   ![](img/export_vector_drawable.png)
5. App 图标必须在 192x192px 的画板内，选中图标画板，然后导出。
6. 导出全部或导出选中内容。导出 PNG 和点九功能，在执行之前，如果文档中选中的图层，则只会导出选中的内容，否则将导出当前页面中的所有资源。导出 Vector drawable 则必须要求选中需要导出的内容。
7. 命名问题。部分不合法的字符会被替换为下滑线。
   普通资源，命名在 "Exportable" 图层或切片图层上。
   点九和 Vector drawable 资源命名最外层的分组上。
   App 图标则命名再画板上。
8. 导出资源路径位于当前文档的同级目录下。
9. 导出到特殊前缀的文件夹。将文件夹的前缀写在分页的命名上，以 "@" 开头，多个文件夹使用 "," 分割线。
   ![](img/export_to_qualifier_folder.png)

## 声明

CC-BY-SA 4.0

[![cc-by-sa-4.0](https://i.creativecommons.org/l/by-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-sa/4.0/)