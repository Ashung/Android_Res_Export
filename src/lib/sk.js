const util = require('util');
const sketch = require('sketch/dom');
const { Document, Slice, Rectangle, ShapePath } = require('sketch/dom');
const appVersion = sketch.version.sketch;

module.exports.isGroup = function(layer) {
    const types = ['Group', 'Artboard', 'SymbolMaster'];
    return types.includes(layer.type);
}

module.exports.isShape = function(layer) {
    const types = ['Shape', 'ShapePath'];
    return types.includes(layer.type);
}

module.exports.isRectangleShape = function(layer) {
    return layer.sketchObject.className() == 'MSRectangleShape';
}

module.exports.isLayerGroup = function(layer) {
    return layer.type === 'Group';
}

module.exports.isArtboard = function(layer) {
    return layer.type === 'Artboard';
}

module.exports.isSymbolMaster = function(layer) {
    return layer.type === 'SymbolMaster';
}

module.exports.isSlice = function(layer) {
    return layer.type === 'Slice';
}

module.exports.isHotspot = function(layer) {
    return layer.type === 'HotSpot';
}

module.exports.isPage = function(layer) {
    return layer.type === 'Page';
}

module.exports.isImage = function(layer) {
    if (layer.type === 'Image') {
        return true;
    }
    if (layer.style && layer.style.fills.some(fill => fill.fillType === 'Pattern' && fill.enabled)) {
        return true;
    }
    return false;
}

module.exports.roundToPixel = function(layer) {
    layer.frame = new Rectangle(
        Math.round(layer.frame.x),
        Math.round(layer.frame.y),
        Math.ceil(layer.frame.width),
        Math.ceil(layer.frame.height)
    );
}

module.exports.addSliceIntoGroup = function(group, sliceName, exportFormats) {
    let slice = new Slice({
        name: sliceName,
        parent: group,
        frame: new Rectangle(0, 0, Math.ceil(group.frame.width), Math.ceil(group.frame.height)),
        exportFormats: exportFormats
    });
    this.exportGroupContentOnly(slice);
    this.sendToBack(slice);
    return slice;
}

module.exports.addSliceBeforeLayer = function(layer, sliceName, exportFormats) {
    let slice = new Slice({
        name: sliceName,
        parent: layer.parent,
        frame: new Rectangle(
            Math.round(layer.frame.x),
            Math.round(layer.frame.y),
            Math.ceil(layer.frame.width),
            Math.ceil(layer.frame.height)
        ),
        exportFormats: exportFormats
    });
    let msLayer = slice.sketchObject;
    msLayer.moveToLayer_beforeLayer(msLayer.parentGroup(), layer.sketchObject);
    return slice;
}

module.exports.removeSliceInGroup = function(group) {
    group.sketchObject.children().forEach(child => {
        if (child.class() == 'MSSliceLayer') {
            child.removeFromParent();
        }
    });
}

module.exports.group = function(layers) {
    let group;
    if (appVersion >= 84) {
        group = MSLayerGroup.groupWithLayers(layers.map(layer => layer.sketchObject));
    } else {
        let layerArray = MSLayerArray.arrayWithLayers(layers.map(layer => layer.sketchObject));
        if (appVersion >= 83) {
            group = MSLayerGroup.groupWithLayers(layerArray.layers());
        } else if (appVersion >= 52) {
            group = MSLayerGroup.groupWithLayers(layerArray);
        } else {
            group = MSLayerGroup.groupFromLayers(layerArray);
        }
    }
    return sketch.fromNative(group);
}

module.exports.exportGroupContentOnly = function(slice) {
    let msLayer = slice.sketchObject;
    msLayer.exportOptions().setLayerOptions(2);
}

module.exports.sendToBack = function(layer) {
    let msLayer = layer.sketchObject;
    msLayer.moveToLayer_beforeLayer(msLayer.parentGroup(), msLayer.parentGroup().firstLayer());
}

module.exports.getLayerByNameFromParent = function(name, parent) {
    return parent.layers.find(layer => layer.name === name);
}

module.exports.addRectShape = function(parent, frame, color, name) {
    let shape = new ShapePath({
        name,
        parent,
        frame: new Rectangle(frame.x, frame.y, frame.width, frame.height),
        style: {
            fills: [color]
        }
    });
    return shape;
}

module.exports.fitGroup = function(group) {
    group.sketchObject.fixGeometryWithOptions(1);
}

module.exports.selectLayer = function(layer) {
    const document = Document.getSelectedDocument();
    const selection = document.selectedLayers;
    selection.clear();
    layer.selected = true;
}

module.exports.moveLayerIntoGroup = function(layer, group) {
    layer.sketchObject.moveToLayer_beforeLayer(group.sketchObject, group.sketchObject.firstLayer());
}

module.exports.getSVGFromLayer = function(layer) {
    const options = { formats: 'svg', output: false };
    const buffer = sketch.export(layer, options);
    return buffer.toString().replace(/\n/g, '\\n');
}

module.exports.getOriginalSVGFromLayer = function(layer) {
    const options = { formats: 'svg', output: false };
    const buffer = sketch.export(layer, options);
    return buffer.toString();
}

module.exports.getBase64FromLayer = function(layer) {
    const buffer = sketch.export(layer, {
        output: false,
        scales: '2',
        formats: 'png'
    });
    return buffer.toString('base64');
}

module.exports.export = function(layer, option) {
    const ancestry = layer.sketchObject.ancestry();
    const exportRequest = MSExportRequest.exportRequestsFromLayerAncestry(ancestry).firstObject();
    exportRequest.setFormat(option.format || 'png');
    exportRequest.setScale(option.scale || 1);
    Document.getSelectedDocument().sketchObject.saveExportRequest_toFile(exportRequest, option.output);
}

module.exports.collapse = function(layer) {
    layer.sketchObject.setLayerListExpandedType(1);
}

module.exports.resizeLayer = function(layer, size) {
    let { width, height } = size
    layer.frame.width = width || size;
    layer.frame.height = height || size;
}

module.exports.layerWidthID = function(id) {
    let layer = Document.getSelectedDocument().sketchObject.documentData().layerWithID(id);
    return sketch.fromNative(layer);
}

module.exports.childOfLayer = function(layer) {
    return util.toArray(layer.sketchObject.children()).map(sketch.fromNative);
}

module.exports.recursivelyChildOfLayer = function(layer) {
    function traversing(layer) {
        return util.toArray(layer.sketchObject.children()).map(_child => {
            let child = sketch.fromNative(_child);
            if (child.type === "SymbolInstance") {
                return traversing(child.master);
            } else {
                return child;
            }
        });
    }
    return traversing(layer).flat(Infinity);
}

module.exports.countChildOfLayer = function(layer) {
    let count = 0;
    function traversing(layer) {
        if (layer.layers && layer.type !== 'Shape') {
            layer.layers.forEach(child => {
                traversing(child);
            });
        } else if (layer.type === "SymbolInstance") {
            traversing(layer.master);
        } else if (!['Slice', 'HotSpot', 'Group', 'SymbolMaster', 'Artboard'].includes(layer.type)) {
            count ++;
        }
    }
    traversing(layer);
    return count;
}

module.exports.hasShadow = function(layer) {
    return layer.style && layer.style.shadows.some(shadow => shadow.enabled);
}

module.exports.hasInnerShadow = function(layer) {
    return layer.style && layer.style.innerShadows.some(shadow => shadow.enabled);
}

module.exports.hasBlur = function(layer) {
    return layer.style && layer.style.blur.enabled;
}