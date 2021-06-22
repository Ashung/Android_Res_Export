const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');
const { Rectangle } = require('sketch/dom');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const sk = require('./lib/sk');

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;

    if (selection.isEmpty) {
        ui.message(i10n('no_selection'));
        return;
    }

    let assetNameType = settings.settingForKey('asset_name_type') || 0;
    let exportFormats = [{
        size: '1x',
        fileFormat: 'png'
    }];
    
    selection.layers.forEach(layer => {
        let name = android.assetName(layer.name, assetNameType);
        let groupNinePatch;
        let groupContent;
        let groupPatch;
        if (sk.isArtboard(layer)) {
            ui.message(i10n('can_not_create_asset_from_artboard'));
        }
        else if (sk.isSymbolMaster(layer)) {
            ui.message(i10n('can_not_create_asset_from_artboard'));
        }
        else if (sk.isHotspot(layer)) {
            ui.message(i10n('can_not_create_asset_from_hot_spot'));
        }
        else if (sk.isSlice(layer)) {
            ui.message(i10n('can_not_create_asset_from_slice'));
        }
        else if (sk.isLayerGroup(layer)) {
            // No content and patch group
            if (sk.getLayerByNameFromParent('content', layer)) {
                groupContent = sk.getLayerByNameFromParent('content', layer);
                groupNinePatch = layer;
            } else {
                groupContent = layer;
                groupContent.name = 'content';
                groupNinePatch = sk.group([groupContent]);
                groupNinePatch.name = name;
            }
        }
        else {
            groupContent = sk.group([layer]);
            groupContent.name = 'content';
            groupNinePatch = sk.group([groupContent]);
            groupNinePatch.name = name;
        }

        sk.removeSliceInGroup(groupContent);

        if (sk.getLayerByNameFromParent('patch', groupNinePatch)) {
            let slice = sk.addSliceIntoGroup(groupNinePatch, '#9patch', exportFormats);
            slice.frame = new Rectangle(
                1,
                1,
                Math.ceil(groupNinePatch.frame.width) - 2,
                Math.ceil(groupNinePatch.frame.height) - 2
            );
            sk.moveLayerIntoGroup(slice, groupContent);
        } else {
            let width = groupContent.frame.width;
            let height = groupContent.frame.height;
            let color = "#000000";
            let patchTop = sk.addRectShape(groupNinePatch, {x: 0, y: -1, width, height: 1}, color, 'top');
            let patchRight = sk.addRectShape(groupNinePatch, {x: width, y: 0, width: 1, height}, color, 'right');
            let patchBottom = sk.addRectShape(groupNinePatch, {x: 0, y: height, width, height: 1}, color, 'bottom');
            let patchLeft = sk.addRectShape(groupNinePatch, {x: -1, y: 0, width: 1, height}, color, 'left');
            groupPatch = sk.group([patchLeft, patchBottom, patchRight, patchTop]);
            groupPatch.name = 'patch';

            sk.addSliceIntoGroup(groupContent, '#9patch', exportFormats);
        }

        sk.selectLayer(groupNinePatch);
    });
}