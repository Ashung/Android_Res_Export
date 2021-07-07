const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const util = require('util');

const i10n = require('./lib/i10n');
const sk = require('./lib/sk');

const html = require('../resources/view_nine_patch.html');
const webviewIdentifier = 'view_nine_patch.webview';

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;

    if (selection.length !== 1) {
        ui.message(i10n('select_one_nine_patch_asset'));
        return;
    }

    // Checking nine-patch
    const layer = selection.layers[0];
    let ninePatch;
    if (sk.isGroup(layer)) {
        if (layer.layers.length === 2 && sk.getLayerByNameFromParent('patch', layer) && sk.getLayerByNameFromParent('content', layer)) {
            let patch = sk.getLayerByNameFromParent('patch', layer);
            let content = sk.getLayerByNameFromParent('content', layer);
            let slice = sk.getLayerByNameFromParent('#9patch', content);
            if (patch.layers.length >= 4 && slice && sk.isSlice(slice)) {
                ninePatch = layer;
            } else {
                ui.message(i10n('nine_patch_layer_structure_is_wrong'));
                return;
            }
        } else {
            ui.message(i10n('select_one_nine_patch_asset'));
            return;
        }
    }
    if (!ninePatch) {
        ui.message(i10n('select_one_nine_patch_asset'));
        return;
    }

    // Nine-patch width and height
    let ninePatchWidth = (ninePatch.frame.width - 2) * 2;
    let ninePatchHeight = (ninePatch.frame.height - 2) * 2;

    // Get base64 code of nine-patch asset
    let base64 = sketch.export(ninePatch, {output: false, scales: '2', formats: 'png'}).toString('base64');

    const options = {
        identifier: webviewIdentifier,
        width: 600,
        height: 400,
        show: false,
        title: i10n('view_nine_patch'),
        resizable: false,
        minimizable: false,
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
        const langs = {};
        [
            'tip_bg_light', 'tip_bg_dark', 'tip_bg_white',
            'width', 'height', 'content', 'export', 'cancel'
        ].forEach(key => langs[key] = i10n(key));
        webContents.executeJavaScript(`main('${base64}', ${ninePatchWidth}, ${ninePatchHeight}, '${JSON.stringify(langs)}')`);
    });

    // Save
    webContents.on('export', xml => {
        // TODO: Export
        // let filePath = saveToFolder('');
        // writeContentToFile(filePath, xml);
        ui.message(i10n('export_done'));
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
};