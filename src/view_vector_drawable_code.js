const BrowserWindow = require('sketch-module-web-view');
const { getWebview, sendToWebview } = require('sketch-module-web-view/remote');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');

const i18n = require('./lib/i18n');
const sk = require('./lib/sk');
const { pasteboardCopy, saveToFolder, writeContentToFile } = require('./lib/fs');

const html = require('../resources/view_vector_drawable_code.html');
const webviewIdentifier = 'view_vector_drawable_code.webview';

export default function () {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    
    if (selection.isEmpty) {
        ui.message(i18n('no_selection'));
        return;
    }

    const layer = selection.layers[0];
    if (layer.width > 200 && layer.height > 200) {
        ui.message(i18n('vector_drawable_limit'))
        return;
    }

    const svg = sk.getSVGFromLayer(layer);




    const options = {
        identifier: 'view_vector_drawable_code.webview',
        width: 600,
        height: 400,
        show: false,
        title: 'View Vector Drawable Code',
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
        const langs = {};
        ['save', 'cancel', 'copy'].forEach(key => langs[key] = i18n(key));
        webContents.executeJavaScript(`main('${svg}', '${JSON.stringify(langs)}')`);

        // let selection = sketch.getSelectedDocument().selectedLayers;
        // if (selection.isEmpty) {
        //     // TODO: remove preview code
        //     // ui.message('No layer selected');
        // } else if (selection.length > 1) {
        //     // ui.message('Select 1 layer');
        // } else {
        //     let layer = selection.layers[0];
        //     let svg = getSVG(layer);

        //     // console.log(svg)
        //     webContents
        //         .executeJavaScript(`svg2vector('${svg}')`)
        //         .catch(console.error);
        // }
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

export function onSelectionChanged(context) {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview) {
        let selection = context.actionContext.newSelection;
        if (selection.count() == 0) {
            // TODO: remove preview code
            // ui.message('!!! No layer selected');
        } else if (selection.count() > 1) {
            // ui.message('!!! Select 1 layer');
        } else {
            let layer = sketch.fromNative(selection.firstObject());
            let svg = getSVG(layer);
            sendToWebview(webviewIdentifier, `svg2vector('${svg}')`);
        }
    }
};
