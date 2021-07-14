const BrowserWindow = require('sketch-module-web-view');
const { getWebview, sendToWebview } = require('sketch-module-web-view/remote');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i18n = require('./lib/i18n');
const sk = require('./lib/sk');
const { pasteboardCopy, saveToFolder, writeContentToFile } = require('./lib/fs');

const html = require('../resources/view_vector_drawable_code.html');
const webviewIdentifier = 'view_vector_drawable_code.webview';

const document = sketch.getSelectedDocument();
const selection = document.selectedLayers;

const langs = {};
['add_xml_declaration', 'tint_color', 'save', 'cancel', 'copy'].forEach(key => langs[key] = i18n(key));
const addXml = settings.settingForKey('add_xml_declaration') || false;
const tint = settings.settingForKey('tint') || false;
const defaultTint = settings.settingForKey('tint_color') || '000000';
const defaultAlpha = settings.settingForKey('tint_color_alpha') || 100;

export default function () {
    
    if (selection.length !== 1) {
        ui.message(i18n('select_one_layer'));
        return;
    }

    const layer = selection.layers[0];
    if (!isSupported(layer)) return;

    const options = {
        identifier: 'view_vector_drawable_code.webview',
        width: 600,
        height: 400,
        show: false,
        title: i18n('view_vector_drawable_from_selected_layer'),
        resizable: false,
        minimizable: false,
        remembersWindowFrame: true,
        acceptsFirstMouse: true,
        alwaysOnTop: true
    };

    const browserWindow = new BrowserWindow(options);

    // only show the window when the page has loaded to avoid a white flash
    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    // page loads
    webContents.on('did-finish-load', () => {
        const svg = sk.getSVGFromLayer(layer);
        webContents.executeJavaScript(`main('${svg}', '${JSON.stringify(langs)}', ${addXml}, ${tint}, '${defaultTint}', ${defaultAlpha})`);
    });

    // Save
    webContents.on('saveCode', xml => {
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

    // Copy
    webContents.on('copyCode', xml => {
        pasteboardCopy(xml);
        ui.message(i18n('copied'));
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    webContents.on('add_xml_declaration', checked => {
        settings.setSettingForKey('add_xml_declaration', checked);
    });

    webContents.on('tint_color', value => {
        settings.setSettingForKey('tint_color', value);
    });

    webContents.on('tint_color_alpha', value => {
        settings.setSettingForKey('tint_color_alpha', parseInt(value));
    });

    webContents.on('tint', value => {
        settings.setSettingForKey('tint', value);
    });

    browserWindow.loadURL(html);
};

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview) {
        existingWebview.close();
    }
};

export function onSelectionChanged() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview && selection.length === 1) {
        const layer = selection.layers[0];
        if (!isSupported(layer)) return;
        const svg = sk.getSVGFromLayer(layer);
        sendToWebview(webviewIdentifier, `main('${svg}', '${JSON.stringify(langs)}', ${addXml}, ${tint}, '${defaultTint}', ${defaultAlpha})`);
    }
};

function isSupported(layer) {
    if (layer.hidden) {
        ui.message(i18n('hidden_layer'));
        return false;
    }

    if (layer.frame.width > 200 && layer.frame.height > 200) {
        ui.message(i18n('vector_drawable_limit'));
        return false;
    }

    if (sk.countChildOfLayer(layer) > 20) {
        ui.message(i18n('vector_drawable_too_many_layer'));
        return false;
    }

    for (let child of sk.recursivelyChildOfLayer(layer)) {
        if (sk.isImage(child) && !layer.hidden) {
            ui.message(i18n('vector_drawable_not_support_bitmap_layer'));
            return false;
        }
        if ((sk.hasShadow(child) || sk.hasInnerShadow(child))  && !layer.hidden) {
            ui.message(i18n('vector_drawable_not_support_shadow'));
            return false;
        }
        if (sk.hasBlur(child) && !layer.hidden) {
            ui.message(i18n('vector_drawable_not_support_blur'));
            return false;
        }
    }

    return true;
}