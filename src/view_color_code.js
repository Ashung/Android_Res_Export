const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');

const i10n = require('./lib/i10n');
const android = require('./lib/android');
const sk = require('./lib/sk');
const { pasteboardCopy, saveToFolder, writeContentToFile } = require('./lib/fs');

const html = require('../resources/view_code.html');
const webviewIdentifier = 'view_color_code_from_selected_layers.webview';

export default function() {

    const document = sketch.getSelectedDocument();
    const selection = document.selectedLayers;
    const identifier = String(__command.identifier());

    if (selection.isEmpty) {
        ui.message(i10n('no_selection'));
        return;
    }

    const options = {
        identifier: webviewIdentifier,
        width: 720,
        height: 480,
        show: false,
        title: '',
        resizable: false,
        remembersWindowFrame: true,
        acceptsFirstMouse: true,
        alwaysOnTop: true
    };
    if (identifier === 'view_color_code_from_selected_layers') {
        options.title = i10n('color_xml_from_layers');
    }

    const browserWindow = new BrowserWindow(options);

    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
    });

    const webContents = browserWindow.webContents;

    webContents.on('did-finish-load', () => {
    });

    // Copy
    webContents.on('copy', xml => {
        // pasteboardCopy(xml);
        ui.message('Copied.');
    });

    // TODO: Save
    webContents.on('save', xml => {
        // let filePath = saveToFolder('');
        // writeContentToFile(filePath, xml);
        ui.message('Done.');
    });

    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
};