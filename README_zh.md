# Android Res Export

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export.png?raw=true)

**支持 Sketch 47+ , 支持中文**

用于导出 Android 各种资源的 Sketch 插件，包括 PNG 资源、应用启动图标、点九（Nine-patch）图片、形状 XML 和矢量（Vector Drawable）文件。

## 功能

- 导出多分辨率 PNG 资源。
- 导出多分辨率点九资源。
- 导出 Android 8 及旧版应用图标。
- 导出形状 XML 代码。
- 导出矢量（Vector Drawable）资源。
- 导出图片资源后可以直接使用 ImageOptim 压缩（需安装 ImageOptim）。
- 预览点九资源。**新功能**
- 查看和导出色彩资源代码。**新功能**

## 安装

### 安装插件

- 推荐在 [Sketch Runner](http://sketchrunner.com/)、[Sketchpacks](https://sketchpacks.com/) 或 [Sketch Toolbox](http://sketchtoolbox.com/) 搜索 “Android Res Export”。
- 下载 [master.zip](https://github.com/Ashung/Android_Res_Export/archive/master.zip) ，解压后，双击 "Android_Res_Export.sketchplugin" 文件，安装插件。

### 配置点九宫资源导出支持

首先在复制以下命令到终端，安装 Xcode 命令行工具。

```shell
xcode-select --install
```

复制以下命令到终端，安装 [Homebrew](http://brew.sh/index_zh-cn.html)。

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

安装完成后，在终端输入以下命令安装 [ImageMagick](http://www.imagemagick.org/script/index.php)。

```shell
brew install imagemagick
```

### 配置矢量资源导出支持

首先从 [Node.js](https://nodejs.org/en/) 官网下载安装包，按照安装向导安装 Node.js。如果速度太慢可以从 [国内镜像](https://npm.taobao.org/mirrors/node/)，下载 node-v8(9).x.x.pkg 文件。

安装完成后，打开终端输入以下命令安装 [SVGO](https://github.com/svg/svgo) 和 [svg2vectordrawable](https://github.com/Ashung/svg2vectordrawable)。

```bash
npm install -g svgo svg2vectordrawable
```

## 如何使用

设计稿必须是 MDPI (1x) 尺寸。下载演示文件 [demo.sketch](https://github.com/Ashung/Android_Res_Export/blob/develop/demo.sketch)。

#### 切换语言

执行 "Plugins" - "Android Res Export" - "Help" - "Change Language"。

#### 普通资源

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_1.gif?raw=true)

选择图层或图层组，然后执行 "Plugins" - "Android Res Export" - "New PNG Asset （新建 PNG 资源）"，来创建一个可以导出的 PNG 资源。

#### 点九资源

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_2.gif?raw=true)

选择图层，然后执行 "Plugins" - "Android Res Export" - "New Nine-Patch Asset （新建点九资源）"，来创建一个点九资源。

在 “patch” 组内修改图层 “left”、“right”、“top” 和 “bottom” 的宽或高，这个组内可以增加更多图层，建议使用 1 像素的矩形，填充必须是 #000000 或 #FF0000。

“content” 图层组下的切片图层必须名为 “#9patch”，复制组时请注意此图层名称。

#### 矢量资源

![](https://github.com/Ashung/Android_Res_Export/blob/develop/img/android_res_export_3.gif?raw=true)

选择图层，执行 "Plugins" - "Android Res Export" - "New Vector Drawable Asset（新建矢量资源）"，来创建一个矢量文件资源。

**若要 Vector Drawable 支持低于 API V24 (Android 7) 的设备需要以下操作**。

选择可绘制矢量资源组内所有的形状图层，在属性面板的填充中点击设置图标，选择 "Non-Zero"。

插件暂不支持 API V25+ 的渐变。

#### 应用图标资源

执行 "Plugins" - "Android Res Export" - "New App Icon（新建应用图标）"，来创建一个可绘制矢量文件资源。

#### 导出资源

执行 "Plugins" - "Android Res Export" - "Export ...（导出...） " 分组下的相应菜单导出资源。

在执行之前，如果文档有选中的图层，则只会导出选中的内容，否则将导出当前页面中的所有资源。导出应用图标则必须要求选中需要导出的画板。

部分不合法的字符会被替换为下滑线，执行 "Plugins" - "Android Res Export" - "Asset Name Validator（资源命名校验）" 来查看被改名的资源。

#### 修复切片命名

“#9patch” 和 “#vector" 等同名的切片会因复制而增加 “copy ...” 的字样，执行 "Plugins" - "Android Res Export" - "Fixes Slice Names（修复切片命名） " 来删除多余的 “copy ...” 。

#### 使用 ImageOptim 压缩资源

先安装 [ImageOptim](https://imageoptim.com/mac)，然后在 "Plugins" - "Android Res Export" - "Preferences（参数设置）" 中，勾选 "Optimize Images use ImageOptim After Export.（导出资源后使用 ImageOptim 压缩图片）"。

#### 导出资源到特殊后缀文件夹

可以将文件夹的前缀写在分页的命名上，以 "@" 开头，多个文件夹使用 "," 分隔。

```
@land-xxhdpi, land-xhdpi
@nodpi
@zh-rCN-xxhdpi
@sw600dp-xxhdpi
```

## 声明

Apache 2.o

## 捐助

使用 [微信](http://ashung.github.io/donate.html) 或 [支付宝](http://ashung.github.io/donate.html) 捐助作者。
