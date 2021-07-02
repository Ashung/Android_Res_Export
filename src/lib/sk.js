const sketch = require('sketch/dom');
const { Document, Slice, Rectangle, Group, Shape } = require('sketch/dom');

module.exports.isGroup = function(layer) {
    const types = ['Group', 'Artboard', 'SymbolMaster'];
    return types.includes(layer.type);
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
    var layerArray = MSLayerArray.arrayWithLayers(layers.map(layer => layer.sketchObject));
    var group = MSLayerGroup.groupWithLayers(layerArray);
    return Group.fromNative(group);
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

module.exports.getChildByNameFromParent = function(name, parent) {

}

module.exports.addRectShape = function(parent, frame, color, name) {
    let shape = new Shape({
        name,
        parent,
        frame: new Rectangle(frame.x, frame.y, frame.width, frame.height),
        style: {
            fills: [color]
        }
    });
    return shape;
    // var rectangle = MSRectangleShape.alloc().init();
    // rectangle.setRect(CGRectMake(posX, posY, width, height));
    // var shapeGroup;
    // if (MSApplicationMetadata.metadata().appVersion >= 52) {
    //     shapeGroup = rectangle;
    // } else {
    //     shapeGroup = MSShapeGroup.shapeWithPath(rectangle);
    // }
    // shapeGroup.setName(name);

    // if (color) {
    //     // color #rrggbb
    //     var colorObject = MSColor.colorWithRed_green_blue_alpha(
    //         parseInt(color.substr(1, 2), 16) / 255,
    //         parseInt(color.substr(3, 2), 16) / 255,
    //         parseInt(color.substr(4, 2), 16) / 255,
    //         1.0
    //     );
    //     shapeGroup.style().addStylePartOfType(0);
    //     shapeGroup.style().fills().firstObject().setColor(colorObject);
    // }

    // if (beforeLayer) {
    //     parent.insertLayer_beforeLayer(shapeGroup, beforeLayer);
    // } else {
    //     parent.addLayer(shapeGroup);
    // }

    // return shapeGroup;
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
    return buffer.toString().replace(/\n/g, '\\n'); //.replace(/\s{2,}/g, '');
}