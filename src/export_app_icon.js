const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');

const i18n = require('./lib/i18n');
const sk = require('./lib/sk');
const { chooseFolder, directoryIsWriteable, writeContentToFile, revealInFinder } = require('./lib/fs');

export default function() {

    const document = sketch.getSelectedDocument();
    const page = document.selectedPage;

    if (!settings.layerSettingForKey(page, 'is_android_app_icon_template')) {
        ui.message(i18n('current_page_is_no_template'));
        return;
    }

    const background = sk.getLayerByNameFromParent('ic_background', page);
    const foreground = sk.getLayerByNameFromParent('ic_foreground', page);
    const iconNormal = sk.getLayerByNameFromParent('ic_launcher', page);
    const iconRound = sk.getLayerByNameFromParent('ic_launcher_round', page);

    if (!background || !foreground || !iconNormal || !iconRound) {
        ui.message(i18n('app_icon_not_find'));
        return;
    }

    sk.resizeLayer(background, 108);
    sk.resizeLayer(foreground, 108);
    sk.resizeLayer(iconNormal, 192);
    sk.resizeLayer(iconRound, 192);

    // Export.
    let exportFolder = chooseFolder();
    if (exportFolder) {
        // ExportFolder is writeable
        if (!directoryIsWriteable(exportFolder)) {
            ui.message(i18n('cannot_export_to_folder'));
            return;
        }
        
        // Hide grid symbol instances
        const gridStatus = {};
        const gridForAdaptiveIcon = sk.getLayerByNameFromParent('icon_grid_android_o', page);
        const gridForLegacyIcon = sk.getLayerByNameFromParent('icon_grid', page);
        gridForAdaptiveIcon.getAllInstances().forEach(instance => {
            gridStatus[String(instance.id)] = instance.hidden;
            instance.hidden = true;
        });
        gridForLegacyIcon.getAllInstances().forEach(instance => {
            gridStatus[String(instance.id)] = instance.hidden;
            instance.hidden = true;
        });

        // Export XML
        const xmlContent = '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n' +
            '    <background android:drawable="@mipmap/ic_launcher_background"/>\n' +
            '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n' +
            '</adaptive-icon>';
        writeContentToFile(`${exportFolder}/mipmap-anydpi-v26/ic_launcher.xml`, xmlContent);

        // Export png
        [
            { layer: background, name: 'ic_launcher_background.png' },
            { layer: foreground, name: 'ic_launcher_foreground.png' }
        ].forEach(layer => {
            [
                { scale: 1, suffix: "mdpi" },
                { scale: 1.5, suffix: "hdpi" },
                { scale: 2, suffix: "xhdpi" },
                { scale: 3, suffix: "xxhdpi" },
                { scale: 4, suffix: "xxxhdpi" }
            ].forEach(option => {
                sk.export(layer.layer, {
                    scale: option.scale,
                    format: 'png',
                    output: `${exportFolder}/mipmap-${option.suffix}/${layer.name}`
                });
            });
        });

        [
            { layer: iconNormal, name: "ic_launcher.png" },
            { layer: iconRound, name: "ic_launcher_round.png" }
        ].forEach(layer => {
            [
                { scale: 0.25, suffix: "mdpi" },
                { scale: 0.375, suffix: "hdpi" },
                { scale: 0.5, suffix: "xhdpi" },
                { scale: 0.75, suffix: "xxhdpi" },
                { scale: 1, suffix: "xxxhdpi" }
            ].forEach(option => {
                sk.export(layer.layer, {
                    scale: option.scale,
                    format: 'png',
                    output: `${exportFolder}/mipmap-${option.suffix}/${layer.name}`
                });
            });
        });

        const googlePlayIcon = sk.getLayerByNameFromParent('google_play_icon', page);
        if (googlePlayIcon) {
            sk.resizeLayer(googlePlayIcon, 512);
            sk.export(googlePlayIcon, {
                scale: 1,
                format: 'png',
                output: `${exportFolder}/google_play_icon.png`
            });
        }

        // Restore grid layer status
        for (let layerID in gridStatus) {
            sk.layerWidthID(layerID).hidden = gridStatus[layerID];
        }

        // Reveal in Finder
        if (settings.settingForKey('reveal_in_finder_after_export')) {
            revealInFinder(exportFolder);
        }

    }
}
