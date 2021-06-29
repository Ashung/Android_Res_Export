const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const util = require('util');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const { pasteboardCopy, saveToFolder, writeContentToFile } = require('./lib/fs');

const html = require('../resources/view_code.html');
const webviewIdentifier = 'view_shape_code.webview';

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    const layer = selection.layers[0];
    
    if (selection.isEmpty) {
        ui.message(i10n('no_selection'));
        return;
    }

    // XML from layer
    // Android Shape Drawable References
    // https://developer.android.com/guide/topics/resources/drawable-resource.html#Shape
    let layerInfo = getLayerInfo(layer.sketchObject);
    if (layerInfo.support === false) {
        ui.message(i10n(layerInfo.msg));
        return;
    }
    
    let xml = `<shape xmlns:android="http://schemas.android.com/apk/res/android"\\n    android:shape="${layerInfo.type}"`;

    if (layerInfo.type == "ring" && layerInfo.thickness && layerInfo.innerRadius) {
        xml += `\\n    android:thickness="${layerInfo.thickness}"\\n    android:innerRadius="${layerInfo.innerRadius}"`;
    }

    xml += '\\n    android:useLevel="false">\\n';

    if (layerInfo.width && layerInfo.height) {
        xml += `<!--    <size-->\\n<!--        android:width="${layerInfo.width}"-->\\n<!--        android:height="${layerInfo.height}"/>-->\\n`;
    }

    if (layerInfo.solid) {
        xml += `    <solid\\n       android:color="${layerInfo.solid}"/>\\n`;
    }

    if (layerInfo.gradientType) {
        xml += `    <gradient\\n        android:type="${layerInfo.gradientType}"\\n`;
        if (layerInfo.gradientAngle) {
            xml += `        android:angle="${layerInfo.gradientAngle}"\\n`;
        }
        if (layerInfo.gradientStops) {
            if (layerInfo.gradientStops.length === 2) {
                xml += `        android:startColor="${layerInfo.gradientStops[0]}"\\n        android:endColor="${layerInfo.gradientStops[1]}"`;
            }
            if (layerInfo.gradientStops.length === 3) {
                xml += `        android:startColor="${layerInfo.gradientStops[0]}"\\n        android:centerColor="${layerInfo.gradientStops[1]}"\\n        android:endColor="${layerInfo.gradientStops[2]}"`;
            }
        }
        if (layerInfo.gradientRadius) {
            xml += `\\n        android:gradientRadius="${layerInfo.gradientRadius}"`;
        }
        xml += '/>\\n';
    }

    if (layerInfo.cornersRadius) {
        xml += `    <corners\\n        android:radius="${layerInfo.cornersRadius}"/>\\n`;
    }

    if (layerInfo.cornersRadiusTopLeft || layerInfo.cornersRadiusTopRight || layerInfo.cornersRadiusBottomRight || layerInfo.cornersRadiusBottomLeft) {
        xml += '    <corners';
        if (layerInfo.cornersRadiusTopLeft) {
            xml += `\\n        android:topLeftRadius="${layerInfo.cornersRadiusTopLeft}"`;
        }
        if (layerInfo.cornersRadiusTopRight) {
            xml += `\\n        android:topRightRadius="${layerInfo.cornersRadiusTopRight}"`;
        }
        if (layerInfo.cornersRadiusBottomRight) {
            xml += `\\n        android:bottomRightRadius="${layerInfo.cornersRadiusBottomRight}"`;
        }
        if (layerInfo.cornersRadiusBottomLeft) {
            xml += `\\n        android:bottomLeftRadius="${layerInfo.cornersRadiusBottomLeft}"`;
        }
        xml += '/>\\n';
    }

    if (layerInfo.strokeWidth) {
        xml += `    <stroke\\n        android:width="${layerInfo.strokeWidth}"`;
        if (layerInfo.strokeColor) {
            xml += `\\n        android:color="${layerInfo.strokeColor}"`;
        }
        if (layerInfo.strokeDashWidth) {
            xml += `\\n        android:dashWidth="${layerInfo.strokeDashWidth}"`;
        }
        if (layerInfo.strokeDashGap) {
            xml += `\\n        android:dashGap="${layerInfo.strokeDashGap}"`;
        }
        xml += '/>\\n';
    }

    xml += '</shape>\\n';

    const options = {
        identifier: webviewIdentifier,
        width: 600,
        height: 400,
        show: false,
        title: i10n('view_shape_drawable_from_selected_layer'),
        resizable: false,
        remembersWindowFrame: true,
        acceptsFirstMouse: true,
        alwaysOnTop: true
    };

    const browserWindow = new BrowserWindow(options);

    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    // Main
    webContents.on('did-finish-load', () => {
        webContents.executeJavaScript(`main('${xml}')`);
    });

    // Copy
    webContents.on('copy', xml => {
        pasteboardCopy(xml);
        ui.message(i10n('copied'));
    });

    // Save
    webContents.on('save', xml => {
        let filePath = saveToFolder('');
        writeContentToFile(filePath, xml);
        ui.message('Done.');
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
};

function getLayerInfo(layer) {
    var result = {};
    if (
        layer.class() == "MSShapeGroup" ||
        layer.class() == "MSRectangleShape" ||
        layer.class() == "MSOvalShape"
    ) {

        // Not support layer style
        if (
            layer.style().hasEnabledShadow() ||
            layer.style().enabledInnerShadows().count() > 0 ||
            layer.style().blur().isEnabled()
        ) {
            result.support = false;
            result.msg = "not_support_layer_style";
            return result;
        }

        // Fills
        var fills = layer.style().enabledFills();
        if (fills.count() > 0) {
            if (fills.lastObject().fillType() == 0) {
                result.support = true;
                result.solid = android.mscolorToAndroid(fills.lastObject().color());
            } else if (fills.lastObject().fillType() == 1) {
                result.support = true;
                var gradient = fills.lastObject().gradient();
                if (gradient.stops().count() < 4) {

                    // Gradient type
                    var gradientType = gradient.gradientType();
                    switch (gradientType) {
                        case 2:
                            result.gradientType = "sweep";
                            break;
                        case 1:
                            result.gradientType = "radial";
                            result.gradientRadius = Math.round(layer.frame().width() / 2) + "dp";
                            break;
                        case 0:
                            result.gradientType = "linear";
                            break;
                        default:
                            result.gradientType = "linear";
                    }

                    // Gradient stops
                    var sortByPosition = NSSortDescriptor.sortDescriptorWithKey_ascending("position", true);
                    gradient.stops().sortUsingDescriptors(NSArray.arrayWithObject(sortByPosition));
                    result.gradientStops = util.toArray(gradient.stops()).map(stop => {
                        return android.mscolorToAndroid(stop.color());
                    });

                    // Sweep
                    if (result.gradientType == "sweep" && gradient.stops().count() == 2) {
                        var pos1 = gradient.stops().firstObject().position();
                        var pos2 = gradient.stops().lastObject().position();
                        var pos1Color = android.mscolorToAndroid(gradient.stops().firstObject().color());
                        var pos2Color = android.mscolorToAndroid(gradient.stops().lastObject().color());
                        if (pos1 > 0.3 && pos2 > 0.7) {
                            result.gradientStops = [pos1Color].concat(result.gradientStops);
                        }
                        if (pos1 < 0.3 && pos2 < 0.7) {
                            result.gradientStops.push(pos2Color);
                        }
                    }

                    // Gradient angle
                    if (result.gradientType == "linear") {
                        var x1 = gradient.from().x * layer.frame().width();
                        var y1 = gradient.from().y * layer.frame().height();
                        var x2 = gradient.to().x * layer.frame().width();
                        var y2 = gradient.to().y * layer.frame().height();
                        var angle = Math.round(Math.atan(Math.abs(y1 - y2) / Math.abs(x1 - x2)) * 180 / Math.PI / 45) * 45;
                        switch (true) {
                            case x1 > x2 && y1 > y2:
                                result.gradientAngle = angle + 90;
                                break;
                            case x1 >= x2 && y1 <= y2:
                                result.gradientAngle = angle + 180;
                                break;
                            case x1 < x2 && y1 < y2:
                                result.gradientAngle = angle + 275;
                                break;
                            default:
                                // x1 <= x2 && y1 >= y2:
                                result.gradientAngle = angle;
                        }
                    }

                } else {
                    result.support = false;
                    result.msg = "too_many_color_stop";
                    return result;
                }

            } else {
                result.support = false;
                result.msg = "no_support_fill_type";
                return result;
            }
        } else {
            result.support = true;
        }

        // borders
        var borders = layer.style().enabledBorders();
        if (borders.count() > 0) {
            if (borders.lastObject().fillType() == 0) {
                result.strokeWidth = borders.lastObject().thickness() + "dp";
                result.strokeColor = android.mscolorToAndroid(borders.lastObject().color());

                var dashPattern = layer.style().borderOptions().dashPattern();
                if (dashPattern.count() > 0) {
                    result.strokeDashWidth = dashPattern.firstObject() + "dp";
                    if (dashPattern.count() == 1) {
                        result.strokeDashGap = dashPattern.firstObject() + "dp";
                    } else {
                        result.strokeDashGap = dashPattern.objectAtIndex(1) + "dp";
                    }
                }

            } else {
                result.support = false;
                result.msg = "no_support_stroke_type";
                return result;
            }
        }


        if (layer.children().count() == 2 || layer.children().count() == 1) {

            var shapePath;
            if (sketch.version.sketch >= 52) {
                shapePath = layer;
            } else if (sketch.version.sketch >= 49) {
                shapePath = layer.children().lastObject();
            } else {
                shapePath = layer.children().firstObject();
            }

            if (shapePath.class() == "MSRectangleShape" || shapePath.class() == "MSOvalShape") {

                if (result.support) {
                    if (shapePath.class() == "MSRectangleShape") {
                        result.type = "rectangle"

                        // Radius
                        var points;
                        if (sketch.version.sketch >= 49) {
                            points = shapePath.points();
                        } else {
                            points = shapePath.path().points();
                        }

                        var radius = 0,
                            radiusTopLeft = Math.round(points.objectAtIndex(0).cornerRadius()),
                            radiusTopRight = Math.round(points.objectAtIndex(1).cornerRadius()),
                            radiusBottomRight = Math.round(points.objectAtIndex(2).cornerRadius()),
                            radiusBottomLeft = Math.round(points.objectAtIndex(3).cornerRadius());
                        if (
                            radiusTopLeft == radiusTopRight &&
                            radiusTopLeft == radiusBottomRight &&
                            radiusTopLeft == radiusBottomLeft
                        ) {
                            radius = radiusTopLeft;
                        } else {
                            result.cornersRadiusTopLeft = radiusTopLeft + "dp";
                            result.cornersRadiusTopRight = radiusTopRight + "dp";
                            result.cornersRadiusBottomRight = radiusBottomRight + "dp";
                            result.cornersRadiusBottomLeft = radiusBottomLeft + "dp";
                        }
                        if (radius != 0) {
                            result.cornersRadius = radius + "dp";
                        }
                    } else {
                        result.type = "oval";
                    }
                }

            } else {
                result.support = false;
                result.msg = "no_support_shape";
                return result;
            }
        } else if (layer.children().count() == 3) {

            if (
                layer.children().objectAtIndex(0).class() == "MSOvalShape" &&
                layer.children().objectAtIndex(1).class() == "MSOvalShape"
            ) {
                result.support = true;
                result.type = "ring";

                var diameter1 = layer.children().objectAtIndex(0).frame().width(),
                    diameter2 = layer.children().objectAtIndex(1).frame().width();

                result.thickness = Math.abs(diameter1 - diameter2) + "dp";
                result.innerRadius = Math.min(diameter1, diameter2) + "dp";

            } else {
                result.support = false;
                result.msg = "no_support_shape";
                return result;
            }

        } else {
            result.support = false;
            result.msg = "no_support_shape";
            return result;
        }
    } else {
        result.support = false;
        result.msg = "no_shape_layer";
        return result;
    }

    // Size
    result.width = Math.round(layer.frame().width()) + "dp";
    result.height = Math.round(layer.frame().height()) + "dp";

    return result;

}