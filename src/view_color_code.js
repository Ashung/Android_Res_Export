const BrowserWindow = require('sketch-module-web-view');
const { getWebview, sendToWebview } = require('sketch-module-web-view/remote');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i18n = require('./lib/i18n');
const android = require('./lib/android');
const { pasteboardCopy, saveToFolder, writeContentToFile, revealInFinder } = require('./lib/fs');

const html = require('../resources/view_code.html');
const webviewIdentifier = 'view_color_code.webview';

const document = sketch.getSelectedDocument();
const selection = document.selectedLayers;
const identifier = String(__command.identifier());
const assetNameType = settings.settingForKey('asset_name_type') || 0;

export default function() {

    if (selection.isEmpty && identifier === 'view_color_code_from_selected_layers') {
        ui.message(i18n('no_selection'));
        return;
    }

    if (document.swatches.length === 0 && identifier === 'view_color_code_from_color_variables') {
        ui.message(i18n('no_color_variables'));
        return;
    }

    let colors;
    if (identifier === 'view_color_code_from_selected_layers') {
        colors = colorsFromSelectedLayers();
    }
    if (identifier === 'view_color_code_from_color_variables') {
        colors = colorsFromDocument();
    }

    if (Object.keys(colors).length === 0) {
        ui.message(i18n('no_colors_in_selection'));
        return;
    }

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
        options.title = i18n('color_xml_from_layers');
    }
    if (identifier === 'view_color_code_from_color_variables') {
        options.title = i18n('color_xml_from_color_variables');
    }

    const browserWindow = new BrowserWindow(options);

    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    // Main
    webContents.on('did-finish-load', () => {
        const xml = colorsToXml(colors);
        const langs = {};
        ['save', 'cancel', 'copy'].forEach(key => langs[key] = i18n(key));
        webContents.executeJavaScript(`main('${xml}', '${JSON.stringify(langs)}')`);
    });

    // Copy
    webContents.on('copy', xml => {
        pasteboardCopy(xml);
        ui.message(i18n('copied'));
    });

    // Save
    webContents.on('save', xml => {
        let filePath = saveToFolder('');
        if (!/\.xml$/i.test(filePath)) {
            filePath += '.xml';
        }
        const dir = writeContentToFile(filePath, xml);
        if (dir) {
            browserWindow.close();
            if (settings.settingForKey('reveal_in_finder_after_export')) {
                revealInFinder(dir);
            }
        } else {
            ui.message(i18n('no_permission'));
        }
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
};

export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview) {
        existingWebview.close();
    }
};

export function onSelectionChanged() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview && selection.length !== 0) {
        const colors = colorsFromSelectedLayers();
        const xml = colorsToXml(colors);
        sendToWebview(webviewIdentifier, `main('${xml}')`);
    }
};

function colorsFromSelectedLayers() {
    let colors = {}
    let namesAndCount = {};
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
        // Text layer
        if (layer.type === 'Text') {
            colors['text_' + name] = android.colorToAndroid(layer.style.textColor);
        }
    });
    return colors;
}

function colorsFromDocument() {
    let colors = {}
    let namesAndCount = {};
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
    return colors;
}

function colorsToXml(colors) {
    let xml = '<resources>\\n';
    Object.keys(colors).forEach(key => {
        xml += '    <color name="' + key + '">' + colors[key] + '</color>\\n';
    });
    xml += '</resources>';
    return xml;
}

