import BrowserWindow from 'sketch-module-web-view';
import { getWebview, sendToWebview } from 'sketch-module-web-view/remote';
import sketch from 'sketch/dom';
import ui from 'sketch/ui';
import { pasteboardCopy, saveToFolder, writeContentToFile } from './lib/fs';

const webviewIdentifier = 'view_vector_drawable_code.webview';
const html = require('../resources/view_vector_drawable_code.html');

export default function () {

    const options = {
        identifier: webviewIdentifier,
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
        let selection = sketch.getSelectedDocument().selectedLayers;
        if (selection.isEmpty) {
            // TODO: remove preview code
            // ui.message('No layer selected');
        } else if (selection.length > 1) {
            // ui.message('Select 1 layer');
        } else {
            let layer = selection.layers[0];
            let svg = getSVG(layer);

            // console.log(svg)
            webContents
                .executeJavaScript(`svg2vector('${svg}')`)
                .catch(console.error);
        }
    });

    // Copy
    webContents.on('copyCode', xml => {
        pasteboardCopy(xml);
        ui.message('Copied.');
    })

    // TODO: Save
    webContents.on('saveCode', xml => {
        let filePath = saveToFolder('');
        writeContentToFile(filePath, xml);
        ui.message('Done.');
    })

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

function getSVG(layer) {
    const options = { formats: 'svg', output: false };
    const buffer = sketch.export(layer, options);
    return buffer.toString().replace(/\n/g, '').replace(/\s{2,}/g, '');
}