const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const sk = require('./lib/sk');

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    const identifier = String(__command.identifier());

    if (selection.isEmpty) {
        ui.message(i10n('no_selection'));
        return;
    }

    let assetNameType = settings.settingForKey('asset_name_type') || 0;
    selection.layers.forEach(layer => {
        let format = 'png';
        if (identifier === 'new_bitmap_asset') {
            format = 'png';
        }
        if (identifier === 'new_vector_asset') {
            format = 'svg';
        }
        let name = android.assetName(layer.name, assetNameType);
        newAsset(layer, name, format);
    });

}

function newAsset(layer, name, format) {
    
    let exportFormats = [{
        size: '1x',
        fileFormat: format
    }];

    if (sk.isGroup(layer)) {
        // Group round to pixel
        sk.roundToPixel(layer);
        // Add slice into group
        sk.removeSliceInGroup(layer);
        sk.addSliceIntoGroup(layer, name, exportFormats);
    } else {
        // HotSpot layer
        if (sk.isHotspot(layer)) {
            ui.message(i10n('can_not_create_asset_from_hot_spot'));
        }
        
        // Slice layer
        else if (sk.isSlice(layer)) {
            if (sk.isGroup(layer.parent)) {
                sk.roundToPixel(layer);
                layer.name = name;
                layer.exportFormats = exportFormats;
                sk.exportGroupContentOnly(layer);
            } else {
                ui.message(i10n('can_not_create_asset_from_hot_spot'));
            }
        }

        else {
            let slice = sk.addSliceBeforeLayer(layer, name, exportFormats);
            if (!sk.isGroup(layer.parent)) {
                let group = sk.group([slice, layer]);
                group.name = name;
            }
            sk.exportGroupContentOnly(slice);
        }

    }
}