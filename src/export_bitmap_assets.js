const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');
const util = require('util');

const i18n = require('./lib/i18n');
const android = require('./lib/android');
const sk = require('./lib/sk');
const { chooseFolder, directoryIsWriteable, revealInFinder } = require('./lib/fs');

const document = sketch.getSelectedDocument();
const assetNameType = settings.settingForKey('asset_name_type') || 0;
const exportDpis = settings.settingForKey('export_dpi') || Object.keys(android.DPIS);

export default function() {

    const identifier = String(__command.identifier());
    const showUI = document.selectedLayers.length === 0 ? true : false;
    const exportAssets = getBitmapAsset();

    if (exportAssets.length === 0) {
        ui.message(i18n('no_bitmap_asset'));
        return;
    }
    
    const format = identifier === 'export_bitmap_assets_png' ? 'png' : 'webp';
    let exportFolder;

    if (!showUI) {
        exportFolder = chooseFolder();
        if (exportFolder) {
            // ExportFolder is writeable
            if (!directoryIsWriteable(exportFolder)) {
                ui.message(i18n('cannot_export_to_folder'));
                return;
            }
            exportAssets.forEach(layer => {
                exportDpis.forEach(dpi => {
                    sk.export(layer, {
                        output: `${exportFolder}/drawable-${dpi}/${android.assetName(layer.name, assetNameType)}.${format}`,
                        formats: format,
                        scale: android.dpiToScale(dpi)
                    });
                });
            });
            if (settings.settingForKey('reveal_in_finder_after_export')) {
                revealInFinder(exportFolder);
            }
        }
    } else {
        const options = {
            identifier: 'export_assets.webview',
            width: 600,
            height: 400,
            show: false,
            title: identifier === 'export_bitmap_assets_png' ? i18n('export_bitmap_assets_png') : i18n('export_bitmap_assets_webp'),
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
            const assets = exportAssets.map(layer => {
                const buffer = sketch.export(layer, {
                    output: false,
                    scales: '2',
                    formats: 'png'
                });
                return {
                    name: android.assetName(layer.name, assetNameType),
                    id: layer.id,
                    data: buffer.toString('base64')
                }
            });
            const langs = {};
            ['select_all', 'export', 'cancel'].forEach(key => langs[key] = i18n(key));
            webContents.executeJavaScript(`main(assets'${JSON.stringify()}', '${JSON.stringify(langs)}')`);
        });
    
        // Export
        webContents.on('export', assetIds => {
            if (assetIds.length === 0) {
                ui.message(i18n('select_asset_to_export'));
                return;
            }
            exportFolder = chooseFolder();
            if (exportFolder) {
                // ExportFolder is writeable
                if (!directoryIsWriteable(exportFolder)) {
                    ui.message(i18n('cannot_export_to_folder'));
                    return;
                }
                exportAssets.forEach(layer => {
                    if (assetIds.includes(layer.id)) {
                        exportDpis.forEach(dpi => {
                            sk.export(layer, {
                                output: `${exportFolder}/drawable-${dpi}/${android.assetName(layer.name, assetNameType)}.${format}`,
                                formats: format,
                                scale: android.dpiToScale(dpi)
                            });
                        });
                    }
                });
                if (settings.settingForKey('reveal_in_finder_after_export')) {
                    revealInFinder(exportFolder);
                }
                browserWindow.close();
            }
        });
    
        // Close
        webContents.on('cancel', () => {
            browserWindow.close();
        });
    
        browserWindow.loadURL(require('../resources/export_assets.html'));

    }
}

function getBitmapAsset() {
    let assets = [];
    let predicate = NSPredicate.predicateWithFormat(
        'className == "MSSliceLayer" && name != "#9patch" && (exportOptions.firstFormat == "png" || exportOptions.firstFormat == "webp")'
    );
    let selectedLayers = util.toArray(document.sketchObject.documentData().selectedLayers().layers());
    if (selectedLayers.length > 0) {
        selectedLayers.forEach(layer => {
            let slices = util.toArray(layer.children().filteredArrayUsingPredicate(predicate)).map(sketch.fromNative);
            assets = assets.concat(slices);
        });
        return assets;
    } else {
        return util.toArray(document.sketchObject.allExportableLayers().filteredArrayUsingPredicate(predicate)).map(sketch.fromNative);
    }
}