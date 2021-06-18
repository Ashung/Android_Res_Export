
const { Slice, Rectangle } = require('sketch/dom');

module.exports.isGroup = function(layer) {
    const types = ['Group', 'Artboard', 'SymbolMaster'];
    return types.includes(layer.type);
}

module.exports.isSlice = function(layer) {
    return layer.type === 'Slice';
}

module.exports.isHotSpot = function(layer) {
    return layer.type === 'HotSpot';
}

module.exports.isPage = function(layer) {
    return layer.type === 'Page';
}

module.exports.roundToPixel = function(layer) {
    layer.frame = new Rectangle(
        Math.round(layer.frame.x),
        Math.round(layer.frame.y),
        Math.ceil(group.frame.width),
        Math.ceil(group.frame.height)
    );
}

module.exports.addSliceIntoGroup = function(group, sliceName, format) {
    let slice = new Slice({
        name: sliceName,
        parent: group,
        frame: new Rectangle(0, 0, Math.ceil(group.frame.width), Math.ceil(group.frame.height)),
        exportFormats: [{
            size: '1x',
            fileFormat: format
        }]
    });
    // Export group contents only
    slice.sketchObject.exportOptions().setLayerOptions(2);
    return slice;
}

