const BrowserWindow = require('sketch-module-web-view');
const settings = require('sketch/settings');

const i18n = require('./lib/i18n');
const android = require('./lib/android');

const html = require('../resources/preferences.html');
const webviewIdentifier = 'preferences.webview';

export default function() {

    const preferences = {
        'export_dpi': settings.settingForKey('export_dpi') || Object.keys(android.DPIS),
        'asset_name_type': settings.settingForKey('asset_name_type') || 0,
        'vector_drawable_folder': settings.settingForKey('vector_drawable_folder') || 2,
        'reveal_in_finder_after_export': settings.settingForKey('reveal_in_finder_after_export') || false,
        'webp_quality': settings.globalSettingForKey('WebPQuality'),
        'available_asset_name_type': [
            i18n('asset_name_type_0'),
            i18n('asset_name_type_1'),
            i18n('asset_name_type_2'),
            i18n('asset_name_type_3'),
        ],
        'available_folders': android.VECTORDRAWABLE_FOLDERS,
        'version': String(__command.pluginBundle().version()),
        'i18n': {}
    };

    [
        'export_dpis', 'asset_name_type', 'vector_drawable_folder', 'others',
        'reveal_in_finder_after_export', 'webp_quality', 'ok', 'cancel'
    ].forEach(key => {
        preferences.i18n[key] = i18n(key);
    });

    const options = {
        identifier: webviewIdentifier,
        width: 400,
        height: 600,
        show: false,
        title: i18n('preferences'),
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
        webContents.executeJavaScript(`main('${JSON.stringify(preferences)}')`);
    });

    // Save
    webContents.on('save', (json) => {
        const preferences = JSON.parse(json);

        settings.setSettingForKey('export_dpi', preferences.export_dpi);
        settings.setSettingForKey('asset_name_type', preferences.asset_name_type);
        settings.setSettingForKey('vector_drawable_folder', preferences.vector_drawable_folder);
        settings.setSettingForKey('reveal_in_finder_after_export', preferences.reveal_in_finder_after_export);
        settings.setGlobalSettingForKey('WebPQuality', preferences.webp_quality);

        browserWindow.close();
    });

    // Close
    webContents.on('cancel', () => {
        browserWindow.close();
    });

    browserWindow.loadURL(html);
}