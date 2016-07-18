var svg = '<svg width="83px" height="66px" viewBox="116 15 83 66" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n\
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->\n\
<desc>Created with Sketch.</desc>\n\
<defs></defs>\n\
<circle id="Oval-3" stroke="none" fill="#F20505" fill-rule="evenodd" cx="131" cy="30" r="15"></circle>\n\
    <rect id="Rectangle-13" stroke="none" fill="#144AF2" fill-rule="evenodd" x="131" y="27" width="30" height="30"></rect>\n\
    <ellipse id="Oval-4" stroke="none" fill="#00ED46" fill-rule="evenodd" cx="169" cy="51" rx="30" ry="15"></ellipse>\n\
    <path d="M120,66.7014268 C123.74705,66.2913772 132.506826,64.2952579 135.141602,69.6662706 C136.406605,72.2449906 135.327122,78.9368117 140.331055,78.562755 C146.003118,78.1387538 152.08128,73.480305 157.196289,75.9680284" id="Path-1" stroke="#000000" stroke-width="3" stroke-linecap="round" fill="none"></path>\n\
    <polygon id="Path-2" stroke="none" fill="#FFD700" fill-rule="evenodd" points="167 23 157 45 182 47"></polygon>\n\
    <path d="M161.879258,62.1677217 C161.312732,61.1965294 161,60.1115023 161,59 C161,54.3578644 164.357864,51 169,51 C171.231327,51 173.355959,52.2603102 174.667141,54.3041211 C175.396856,54.105207 176.178309,54 177,54 C180.642136,54 184,57.3578644 184,62 C184,65.6421356 180.642136,69 177,69 C176.417202,69 175.854646,68.9470746 175.316435,68.8473059 C174.152101,71.2205204 171.651374,73 169,73 C164.357864,73 161,69.6421356 161,66 C161,64.5833189 161.312732,63.2862472 161.879258,62.1677217 Z" id="Combined-Shape" stroke="none" fill="#B411E8" fill-rule="evenodd"></path>\n\
    </svg>';

var svg2 = '<svg width="42px" height="39px" viewBox="125 198 42 39" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n\
        <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->\n\
        <desc>Created with Sketch.</desc>\n\
        <defs>\n\
            <rect id="path-1" x="132" y="202" width="35" height="35"></rect>\n\
            <rect id="path-3" x="132" y="202" width="35" height="35"></rect>\n\
        </defs>\n\
        <mask id="mask-2" fill="white">\n\
            <use xlink:href="#path-1"></use>\n\
        </mask>\n\
        <use id="Rectangle-15" stroke="none" fill="#000000" fill-rule="evenodd" xlink:href="#path-1"></use>\n\
        <circle id="Oval-8" stroke="none" fill="#E60A0A" fill-rule="evenodd" mask="url(#mask-2)" cx="141.5" cy="214.5" r="16.5"></circle>\n\
        <mask id="mask-4" fill="white">\n\
            <use xlink:href="#path-3"></use>\n\
        </mask>\n\
        <use id="Rectangle-15" stroke="none" fill="#000000" fill-rule="evenodd" xlink:href="#path-3"></use>\n\
        <circle id="Oval-8" stroke="none" fill="#E60A0A" fill-rule="evenodd" mask="url(#mask-4)" cx="141.5" cy="214.5" r="16.5"></circle>\n\
    </svg>';





// Support SVG Tags
var tags = "rect|ellipse|circle|path|polygon|mask";

svg = svg.replace(/\n*/g, "").replace(/>\s+</g, "><")
    .replace(/<!--[^<]*-->/gi, "")
    .replace(/<desc>[^<]*<\/desc>/gi, "");

if (svg.match(/<mask[^<]*>.*<\/mask>/gi)) {
    var clipPathReg = /(<mask[^<]*><use xlink:href="#)([^"]*)("><\/use><\/mask>)/gi;
    var clipPathIds = svg.match(clipPathReg);
    for (var i = 0; i < clipPathIds.length; i++) {
        var clipPathId = clipPathIds[i].replace(clipPathReg, "$2")
        var patchTagReg = new RegExp('<(' + tags + ')[^<]*id="' + clipPathId + '"[^<]*<\/(' + tags + ')>', 'gi');
        var patchTag = svg.match(patchTagReg)[0];
        svg = svg.replace(
            new RegExp('<use xlink:href="#' + clipPathId + '"><\/use>', 'gi'),
            patchTag.replace(/>/, ' clip="true">')
        );
    }
}

svg = svg.replace(/<use[^<]*<\/use>/gi, "")
    .replace(/<defs>.*<\/defs>/gi, "")
    .replace(/<mask[^<]*>/gi, "")
    .replace(/<\/mask>/gi, "");



var vector = {}
    vector.width = /<svg[^<]*width=\"(\d+)px/i.exec(svg)[1];
    vector.height = /<svg[^<]*height=\"(\d+)px/i.exec(svg)[1];
    vector.paths = [];


var paths = svg.match(new RegExp("<(" + tags + ")[^<]*<\/(" + tags + ")>", 'gi'));
// console.log();

for (var i = 0; i < paths.length; i++) {
    var code = paths[i];
    var tag = /<(\w+)\s/.exec(code)[1];

    vector.paths.push({
        "tag" : tag,
        "pathData" : ""
    });
}

console.log(vector);





// SVG 标签 | Android 标签 | 说明
// --- | --- | ---
// `svg` | `vector` | 主体标签
// `g` | `group` | 分组
// `path/rect/circle/polygon/ellipse` `polyline/line` | `path` | 形状和路径
// `clipPath` | `clip-path` | 蒙板路径
//
// 以下为 SVG 标签属性 与 Android 标签属性的对应关系。
//
// SVG | Android | 说明
// --- | --- | ---
// `name/id` | `android:name `| 定义名称
// `opacity` | `android:alpha` | 透明度 (0-1)
//
// _公共属性_
//
// SVG | Android | 说明
// --- | --- | ---
// `xmlns` | `xmlns` | 命名空间
// `width` | `android:width` | 图像宽度
// `height` | `android:height` | 图像高度
// `viewportWidth` | `android:viewportWidth` | 视图宽度，视图相当于画布
// `viewportHeight` | `android:viewportHeight` | 视图高度
// `-` | `android:tint` | 着色
// `-` | `android:tintMode` | 定义着色混合模式，值为 `src_over src_in src_atop multiply screen add`，默认为 `src_in`
// `-` | `android:autoMirrored` | 设置当系统为 RTL(right-to-left) 布局时，是否自动镜像该图片
//
// _vector 标签属性_
//
// SVG | Android | 说明
// --- | --- | ---
// `transform="rotate(a x y)"` | `android:rotation` | 旋转
// `transform="rotate(a x y)"` | `android:pivotX` | 缩放和旋转时的 X 轴参考点
// `transform="rotate(a x y)"` | `android:pivotY` | 缩放和旋转时的 Y 轴参考点
// `transform="scale(x y)"` | `android:scaleX` | X 轴的缩放倍数
// `transform="scale(x y)"` | `android:scaleY` | Y 轴的缩放倍数
// `transform="translate(x y)"`| `android:translateX` | X 轴的位移
// `transform="translate(x y)"` | `android:translateY` | Y 轴的位移
//
// _group 标签属性_



//
// SVG | Android | 说明
// --- | --- | ---
// `d` | `android:pathData` | 路径信息
// `fill` | `android:fillColor` | 路径填充颜色
// `fill-opacity` | `android:fillAlpha` | 路径填充颜色的透明度
// `stroke` | `android:strokeColor` | 路径描边
// `stroke-width` | `android:strokeWidth` | 路径描边粗细
// `stroke-opacity` | `android:strokeAlpha` | 路径描边透明度
// `stroke-linecap` | `android:strokeLineCap` | 路径线帽的形状，值为 `butt, round, square`
// `stroke-linejoin` | `android:strokeLineJoin` | 路径连接方式，值为 `miter, round, bevel`
// `stroke-miterlimit` | `android:strokeMiterLimit` | 设置斜角的上限
// `-` | `android:trimPathStart` | 从路径起始位置截断路径的比率，取值范围 0-1
// `-` | `android:trimPathEnd` | 从路径结束位置截断路径的比率，取值范围从 0-1
// `-` | `android:trimPathOffset` | 设置路径截取的范围，取值范围从 0-1
//
// _path 标签属性_
//
// SVG | Android | 说明
// --- | --- | ---
// d | android:pathData | 路径信息
//
// _clip-path 标签属性_
//
// 完整的 VectorDrawable 代码，类似以下的示例。
//
// {% highlight xml %}
// <?xml version="1.0" encoding="utf-8"?>
// <vector xmlns:android="http://schemas.android.com/apk/res/android"
//     android:width="48dp"
//     android:height="48dp"
//     android:viewportWidth="48"
//     android:viewportHeight="48">
//     <group>
//         <clip-path android:pathData="..."/>
//         <path android:pathData="..."/>
//     </group>
// </vector>
// {% endhighlight %}
