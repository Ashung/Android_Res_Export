const sketch = require('sketch/dom');
const ui = require('sketch/ui');

const i18n = require('./lib/i18n');

export default function() {
    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;

    if (selection.isEmpty) {
        ui.message(i18n('no_selection'));
        return;
    }

    selection.layers.forEach(layer => {
        traverse(layer.sketchObject);
    });

}

function traverse(layer) {
    layer.children().forEach(child => {
        const shapeTypes = ['MSShapeGroup', 'MSRectangleShape', 'MSOvalShape', 'MSShapePathLayer', 'MSTriangleShape', 'MSStarShape', 'MSPolygonShape'];
        if (shapeTypes.includes(String(child.className())) && child.parentGroup().className() != 'MSShapeGroup') {
            child.style().setWindingRule(0);
        }
        if (child.className() == 'MSSymbolInstance') {
            if (child.symbolMaster().isForeign()) {
                ui.message(i18n('library_symbol_can_not_change_fill_type'));
            } else {
                traverse(child.symbolMaster());
            }
        }
    });    
}