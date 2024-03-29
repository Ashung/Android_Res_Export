const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');
const util = require('util');

const i18n = require('./lib/i18n');
const android = require('./lib/android');
const sk = require('./lib/sk');
const { chooseFolder, directoryIsWriteable, revealInFinder, writeContentToFile } = require('./lib/fs');

const document = sketch.getSelectedDocument();
const assetNameType = settings.settingForKey('asset_name_type') || 0;
const vectorFolder = android.VECTORDRAWABLE_FOLDERS[settings.settingForKey('vector_drawable_folder') || 2];
const showUI = document.selectedLayers.length === 0 ? true : false;
const appVersion = sketch.version.sketch;

const langs = {};
['select_all', 'export', 'cancel'].forEach(key => langs[key] = i18n(key));

export default function() {

    const exportAssets = getVectorDrawableAsset();

    if (exportAssets.length === 0) {
        ui.message(i18n('no_vector_drawable_asset'));
        return;
    }

    const options = {
        identifier: 'export_vector_drawable.webview',
        width: 600,
        height: 400,
        show: false,
        title: i18n('export_vector_assets'),
        resizable: false,
        minimizable: false,
        remembersWindowFrame: true,
        acceptsFirstMouse: true,
        alwaysOnTop: true
    };

    const browserWindow = new BrowserWindow(options);

    if (showUI) {
        browserWindow.once('ready-to-show', () => {
            browserWindow.show();
        });
    }

    const webContents = browserWindow.webContents;

    // Main
    webContents.on('did-finish-load', () => {
        let supportedExportAssets = exportAssets.filter(layer => {
            return isSupported(layer);
        });
        if (supportedExportAssets.length !== exportAssets.length) {
            ui.message(i18n('ignore_not_support_layer'));
        }
        if (showUI) {
            const assets = supportedExportAssets.map(layer => {
                return {
                    name: android.assetName(layer.name, assetNameType),
                    data: sk.getBase64FromLayer(layer),
                    svg: encodeURIComponent(sk.getOriginalSVGFromLayer(layer))
                }
            });
            webContents.executeJavaScript(`main('${JSON.stringify(assets)}', '${JSON.stringify(langs)}')`);
        } else {
            const assets = supportedExportAssets.map(layer => {
                return {
                    name: android.assetName(layer.name, assetNameType),
                    svg: encodeURIComponent(sk.getOriginalSVGFromLayer(layer))
                }
            });
            webContents.executeJavaScript(`exportSelection('${JSON.stringify(assets)}')`);
        }
    });

    // Export
    webContents.on('export', assets => {
        if (assets.length === 0) {
            ui.message(i18n('select_asset_to_export'));
            return;
        }
        let exportFolder = chooseFolder();
        if (exportFolder) {
            // ExportFolder is writeable
            if (!directoryIsWriteable(exportFolder)) {
                ui.message(i18n('cannot_export_to_folder'));
                return;
            }

            assets.forEach(({name, xml}) => {
                writeContentToFile(`${exportFolder}/${vectorFolder}/${name}.xml`, xml);
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
    
    browserWindow.loadURL(require('../resources/export_vector_assets.html'));

}

function getVectorDrawableAsset() {
    let assets = [];
    let predicate = NSPredicate.predicateWithFormat(
        'className == "MSSliceLayer" && exportOptions.firstFormat == "svg"'
    );
    let nativeSelectedLayers;
    if (appVersion >= 84) {
        nativeSelectedLayers = document.sketchObject.documentData().selectedLayers();
    } else {
        nativeSelectedLayers = document.sketchObject.documentData().selectedLayers().layers();
    }
    let selectedLayers = util.toArray(nativeSelectedLayers);
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

function isSupported(layer) {
    if (layer.hidden) {
        return false;
    }
    if (layer.frame.width > 200 && layer.frame.height > 200) {
        return false;
    }
    if (sk.countChildOfLayer(layer) > 20) {
        return false;
    }
    for (let child of sk.recursivelyChildOfLayer(layer)) {
        if (sk.isImage(child) && !layer.hidden) {
            return false;
        }
        if ((sk.hasShadow(child) || sk.hasInnerShadow(child))  && !layer.hidden) {
            return false;
        }
        if (sk.hasBlur(child) && !layer.hidden) {
            return false;
        }
    }
    return true;
}