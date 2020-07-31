import BrowserWindow from 'sketch-module-web-view';
import { getWebview, sendToWebview } from 'sketch-module-web-view/remote';
import sketch from 'sketch/dom';
import UI from 'sketch/ui';
// import { toArray } from 'util';
import { pasteboardCopy } from '../modules/sketch/io';

const webviewIdentifier = 'android-resources-export.view-vector-drawable-code.webview';
const html = require('../resources/view-vector-drawable-code.html');

export default function () {

    const options = {
        identifier: webviewIdentifier,
        width: 420,
        height: 400,
        show: false,
        title: 'View Vector Drawable Code',
        resizable: false,
        remembersWindowFrame: true,
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
        let selection = sketch.getSelectedDocument().selectedLayers;
        if (selection.isEmpty) {
            // TODO: remove preview code
            // UI.message('No layer selected');
        } else if (selection.length > 1) {
            // UI.message('Select 1 layer');
        } else {
            let layer = selection.layers[0];
            let svg = getSVG(layer);
            webContents
                .executeJavaScript(`svg2vector('${svg}')`)
                .catch(console.error);
        }
    });

    // Copy
    webContents.on('copyCode', xml => {
        pasteboardCopy(xml);
        UI.message('Copied.');
    })

    // TODO: Save

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
            // UI.message('!!! No layer selected');
        } else if (selection.count() > 1) {
            // UI.message('!!! Select 1 layer');
        } else {
            let layer = sketch.fromNative(selection.firstObject());
            let svg = getSVG(layer);
            console.log(svg);
            sendToWebview(webviewIdentifier, `svg2vector('${svg}')`);
        }
    }
};

function getSVG(layer) {
    const options = { formats: 'svg', output: false };
    const buffer = sketch.export(layer, options);
    return buffer.toString().replace(/\n/g, '').replace(/\s{2,}/g, '');
}