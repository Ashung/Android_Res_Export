# Android Res Export

![](img/android_res_export.png)

用于导出 Android 各种资源的 Sketch 插件，包括 PNG 资源、App 图标、点九图和 vector drawable XML 文件。

## 安装步骤

1,  [下载 Source code (zip)](https://github.com/Ashung/Android_Res_Export/releases) 并解压。

2, 双击 "Android_Res_Export.sketchplugin" 文件。

3, 使用 [Homebrew](http://brew.sh/index_zh-cn.html) 安装 [ImageMagick](http://www.imagemagick.org/script/index.php)。打开终端，粘贴 [Homebrew](http://brew.sh/index_zh-cn.html) 主页上的代码后，按下回车。安装完毕之后，在终端输入以下命令安装 ImageMagick。

```bash
brew install imagemagick
```

4, 安装 [SVGO](https://github.com/svg/svgo)。首先从 [Node.js](https://nodejs.org/en/) 官网下载安装包，按照安装向导安装 Node.js。安装完成后，打开终端输入以下命令安装 SVGO。

```bash
sudo npm install svgo -g
```

## 如何使用

下载演示文件 [demo.sketch](https://raw.githubusercontent.com/Ashung/Android_Res_Export/master/demo.sketch)。

设计稿必须是 MDPI (1x) 尺寸, 目前不支持以后也不会支持其他尺寸的设计稿。

普通的 PNG 资源使用 "Make Exportable" 或者添加切片的方式来表示此图层将会被导出。或者选择图层从菜单执行 "Plugin" - "Android Res Export" - "New" - "PNG Asset"，来创建一个 PNG 资源。

![](img/android_res_export_for_sketch_1.gif)

选择图层，然后从菜单执行 "Plugin" - "Android Res Export" - "New" - "9-Patch Asset"，来创建一个点九资源。

![](img/android_res_export_for_sketch_2.gif)

选择图层从菜单执行 "Plugin" - "Android Res Export" - "New" - "Vector drawable Asset"，来创建一个 Vector drawable 资源。

选择 Vector drawable 资源组内所有的形状图层，在属性面板的填充中点击设置图标，选择 "Non-Zero"，然后从菜单 "Layer" - "Paths" - "Reverse Order" 执行反转路径顺序。

![](img/android_res_export_for_sketch_3.gif)

App 图标必须在 192x192px 的画板内，选中图标画板，然后执行 "Plugin" - "Android Res Export" - "Export" - "Vector drawable Asset"，导出。

导出 PNG 和点九功能，在执行之前，如果文档中选中的图层，则只会导出选中的内容，否则将导出当前页面中的所有资源。导出 Vector drawable 则必须要求选中需要导出的内容。

部分不合法的字符会被替换为下滑线。普通资源，命名在 "Exportable" 图层或切片图层上。点九和 Vector drawable 资源命名在最外层的分组上。App 图标则命名在画板上。被修改和重复的资源命名，在导出时会保存到资源目录下的 "report.txt" 文件内。

导出到特殊前缀的文件夹。将文件夹的前缀写在分页的命名上，以 "@" 开头，多个文件夹使用 "," 分隔。


## 声明

CC-BY-SA 4.0

[![cc-by-sa-4.0](https://i.creativecommons.org/l/by-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-sa/4.0/)

## 捐助

使用微信或支付宝捐助作者。

![](http://ashung.github.io/assets/img/wechat_rmb_2.png)

![](http://ashung.github.io/assets/img/alipay_rmb_2.png)