const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const { pasteboardCopy, saveToFolder, writeContentToFile } = require('./lib/fs');

const html = require('../resources/view_code.html');
const webviewIdentifier = 'view_color_code.webview';

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    const identifier = String(__command.identifier());
    const assetNameType = settings.settingForKey('asset_name_type') || 0;

    if (selection.isEmpty && identifier === 'view_color_code_from_selected_layers') {
        ui.message(i10n('no_selection'));
        return;
    }

    if (document.swatches.length === 0 && identifier === 'view_color_code_from_color_variables') {
        ui.message(i10n('no_color_variables'));
        return;
    }

    let colors = {}
    let namesAndCount = {};

    if (identifier === 'view_color_code_from_selected_layers') {
        selection.layers.forEach(layer => {
            let name = android.assetName(layer.name, assetNameType);
            if (Object.keys(namesAndCount).includes(name)) {
                namesAndCount[name] += 1;
            } else {
                namesAndCount[name] = 1;
            }
            if (namesAndCount[name] > 1) {
                name += '_' + namesAndCount[name];
            }

            // Last enabled fill
            let fill = layer.style.fills.filter(fill => fill.enabled).pop();
            if (fill) {
                if (fill.fillType === 'Color') {
                    colors[name] = android.colorToAndroid(fill.color);
                }
                if (fill.fillType === 'Gradient') {
                    fill.gradient.stops.forEach((stop, idx) => {
                        colors[name + '_gradient_stop_' + idx] = android.colorToAndroid(stop.color);
                    });
                }
            }
        });
    }
    
    if (identifier === 'view_color_code_from_color_variables') {
        document.swatches.forEach(swatch => {
            let name = android.assetName(swatch.name, assetNameType, 'color');
            if (Object.keys(namesAndCount).includes(name)) {
                namesAndCount[name] += 1;
            } else {
                namesAndCount[name] = 1;
            }
            if (namesAndCount[name] > 1) {
                name += '_' + namesAndCount[name];
            }
            colors[name] = android.colorToAndroid(swatch.color);
        });
    }

    if (Object.keys(colors).length === 0) {
        ui.message(i10n('no_colors_in_selection'));
        return;
    }

    let xml = '<resources>\\n';
    Object.keys(colors).forEach(key => {
        xml += '    <color name="' + key + '">' + colors[key] + '</color>\\n';
    });
    xml += '</resources>';

    const options = {
        identifier: webviewIdentifier,
        width: 600,
        height: 400,
        show: false,
        title: '',
        resizable: false,
        minimizable: false,
        remembersWindowFrame: true,
        acceptsFirstMouse: true,
        alwaysOnTop: true
    };
    if (identifier === 'view_color_code_from_selected_layers') {
        options.title = i10n('color_xml_from_layers');
    }
    if (identifier === 'view_color_code_from_color_variables') {
        options.title = i10n('color_xml_from_color_variables');
    }

    const browserWindow = new BrowserWindow(options);

    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    // Main
    webContents.on('did-finish-load', () => {
        webContents.executeJavaScript(`main('${xml}')`);
    });

    // Copy
    webContents.on('copy', xml => {
        pasteboardCopy(xml);
        ui.message(i10n('copied'));
    });

    // Save
    webContents.on('save', xml => {
        let filePath = saveToFolder('');
        writeContentToFile(filePath, xml);
        ui.message('Done.');
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
};
