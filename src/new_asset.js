const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const sk = require('./lib/sk');

export default function(context) {
    
    const Group = sketch.Group;
    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    const identifier = String(__command.identifier());

    if (selection.isEmpty) {
        ui.message(i10n('no_selection'));
        return;
    }

    selection.layers.forEach(layer => {
        let format = 'png';
        if (identifier === 'new_bitmap_asset') {
            format = 'png';
        }
        if (identifier === 'new_vector_asset') {
            format = 'svg';
        }
        newAsset(layer, format);
    });

}

function newAsset(layer, format) {
    let assetNameType = settings.settingForKey('asset_name_type') || 0;
    let name = android.assetName(layer.name, assetNameType);


    

    // let layerGroup;
    if (sk.isGroup(layer)) {
        // Group round to pixel
        
    } else {

    }
    //     layerGroup = layer;
    // } else if (sk.isSlice(layer)) {
    //     if (sk.isGroup(layer.parent)) {
    //         layerGroup = layer.parent;
    //     }
    // } else if (sk.isHotSpot(layer)) {
    //     layerGroup = undefined;
    // } else {
    //     layerGroup = new Group({
    //         name,
    //         layers: [layer]
    //     });
    // }
    // if (layerGroup) {
    //     sk.addSliceIntoGroup(layerGroup, name, format);
    // }
}