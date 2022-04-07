const BrowserWindow = require('sketch-module-web-view');
const sketch = require('sketch/dom');
const ui = require('sketch/ui');
const settings = require('sketch/settings');
const util = require('util');

const i18n = require('./lib/i18n');
const android = require('./lib/android');
const { chooseFolder, directoryIsWriteable, revealInFinder, mkdir } = require('./lib/fs');

const document = sketch.getSelectedDocument();
const assetNameType = settings.settingForKey('asset_name_type') || 0;
const exportDpis = settings.settingForKey('export_dpi') || Object.keys(android.DPIS);
const appVersion = sketch.version.sketch;

export default function() {

    const showUI = document.selectedLayers.length === 0 ? true : false;
    const exportAssets = getNinePatchAsset();

    if (exportAssets.length === 0) {
        ui.message(i18n('no_nine_patch_asset'));
        return;
    }
    
    let exportFolder;

    if (!showUI) {
        exportFolder = chooseFolder();
        if (exportFolder) {
            // ExportFolder is writeable
            if (!directoryIsWriteable(exportFolder)) {
                ui.message(i18n('cannot_export_to_folder'));
                return;
            }
            exportAssets.forEach(ninePatch => {
                exportNinePatch(ninePatch, exportFolder);
            });
            if (settings.settingForKey('reveal_in_finder_after_export')) {
                revealInFinder(exportFolder);
            }
        }
    } else {
        const options = {
            identifier: 'export_nine_patch_assets.webview',
            width: 600,
            height: 400,
            show: false,
            title: i18n('export_nine_patch_assets'),
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
            const assets = exportAssets.map(ninePatch => {
                const buffer = sketch.export(sketch.fromNative(ninePatch.group), {
                    output: false,
                    scales: '2',
                    formats: 'png'
                });
                return {
                    name: android.assetName(String(ninePatch.group.name()), assetNameType),
                    id: ninePatch.id,
                    data: buffer.toString('base64')
                }
            });
            const langs = {};
            ['select_all', 'export', 'cancel'].forEach(key => langs[key] = i18n(key));
            webContents.executeJavaScript(`main('${JSON.stringify(assets)}', '${JSON.stringify(langs)}')`);
        });
    
        // Export
        webContents.on('export', assetIds => {
            if (assetIds.length === 0) {
                ui.message(i18n('select_asset_to_export'));
                return;
            }
            exportFolder = chooseFolder();
            if (exportFolder) {
                // ExportFolder is writeable
                if (!directoryIsWriteable(exportFolder)) {
                    ui.message(i18n('cannot_export_to_folder'));
                    return;
                }
                exportAssets.forEach(ninePatch => {
                    if (assetIds.includes(ninePatch.id)) {
                        exportNinePatch(ninePatch, exportFolder);
                    }
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
    
        browserWindow.loadURL(require('../resources/export_assets.html'));

    }
}

function exportNinePatch(ninePatch, exportFolder) {
    var ninePatchGroup = ninePatch.group;
    var ninePatchContent = ninePatch.content;
    var ninePatchPatch = ninePatch.patch;
    var ninePatchName = android.assetName(String(ninePatchGroup.name()), assetNameType);

    // Patch lines round to pixel
    util.toArray(ninePatchPatch.layers()).forEach(line => {
        if (line.className() == 'MSRectangleShape') {
            line.frame().setX(Math.round(line.frame().x()));
            line.frame().setY(Math.round(line.frame().y()));
            line.frame().setWidth(Math.max(1, Math.ceil(line.frame().width())));
            line.frame().setHeight(Math.max(1, Math.ceil(line.frame().height())));
        }
    });

    // Save nine-patch patch NSImage at mdpi
    var nsImageOfPatchTop = imageOfLayer_rect_scale(
        ninePatchPatch,
        CGRectMake(ninePatchPatch.absoluteRect().x() + 1, ninePatchPatch.absoluteRect().y(), ninePatchPatch.absoluteRect().width() - 2, 1),
        1
    );
    var nsImageOfPatchRight = imageOfLayer_rect_scale(
        ninePatchPatch,
        CGRectMake(ninePatchPatch.absoluteRect().x() + ninePatchPatch.absoluteRect().width() - 1, ninePatchPatch.absoluteRect().y() + 1, 1, ninePatchPatch.absoluteRect().height() - 2),
        1
    );
    var nsImageOfPatchBottom = imageOfLayer_rect_scale(
        ninePatchPatch,
        CGRectMake(ninePatchPatch.absoluteRect().x() + 1, ninePatchPatch.absoluteRect().y() + ninePatchPatch.absoluteRect().height() - 1, ninePatchPatch.absoluteRect().width() - 2, 1),
        1
    );
    var nsImageOfPatchLeft = imageOfLayer_rect_scale(
        ninePatchPatch,
        CGRectMake(ninePatchPatch.absoluteRect().x(), ninePatchPatch.absoluteRect().y() + 1, 1, ninePatchPatch.absoluteRect().height() - 2),
        1
    );

    // Export
    exportDpis.forEach(dpi => {
        const scale = android.dpiToScale(dpi);
        if (scale === 1) {
            const exportRequestOfPatchGroup = exportRequestOfLayer_inRect_scale(ninePatchGroup, ninePatchGroup.absoluteRect().rect(), 1);
            document.sketchObject.saveExportRequest_toFile(exportRequestOfPatchGroup, `${exportFolder}/drawable-mdpi/${ninePatchName}.9.png`);
        } else {
            const nsImageOfPatchContent = imageOfLayer_rect_scale(ninePatchContent, ninePatchContent.absoluteRect().rect(), scale);
            const bitmapRepOfPatchContent = bitmapRepFromNSImage_scale(nsImageOfPatchContent, 1);
            const bitmapRepOfPatchTop = bitmapRepFromNSImage_scale(nsImageOfPatchTop, scale);
            const bitmapRepOfPatchRight = bitmapRepFromNSImage_scale(nsImageOfPatchRight, scale);
            const bitmapRepOfPatchBottom= bitmapRepFromNSImage_scale(nsImageOfPatchBottom, scale);
            const bitmapRepOfPatchLeft = bitmapRepFromNSImage_scale(nsImageOfPatchLeft, scale);

            const contentImageSize = nsImageOfPatchContent.size();
            const scaleFactor = NSScreen.mainScreen().backingScaleFactor();
            const resultImageSize = NSMakeSize(Math.round((contentImageSize.width + 2)), Math.round((contentImageSize.height + 2)));
            const resultImage = NSImage.alloc().initWithSize(resultImageSize);
            resultImage.lockFocus();
            NSGraphicsContext.currentContext().setImageInterpolation(NSImageInterpolationNone);
            let transform = NSAffineTransform.transform();
            transform.scaleXBy_yBy(1 / scaleFactor, 1 / scaleFactor);
            transform.concat();
            nsImageOfPatchContent.drawRepresentation_inRect(bitmapRepOfPatchContent, NSMakeRect(1, 1, contentImageSize.width, contentImageSize.height));
            nsImageOfPatchTop.drawRepresentation_inRect(bitmapRepOfPatchTop, NSMakeRect(1, resultImageSize.height - 1, contentImageSize.width, 1));
            nsImageOfPatchRight.drawRepresentation_inRect(bitmapRepOfPatchRight, NSMakeRect(resultImageSize.width - 1, 1, 1, contentImageSize.height));
            nsImageOfPatchBottom.drawRepresentation_inRect(bitmapRepOfPatchBottom, NSMakeRect(1, 1 - bitmapRepOfPatchBottom.pixelsHigh(), contentImageSize.width, 1));
            nsImageOfPatchLeft.drawRepresentation_inRect(bitmapRepOfPatchLeft, NSMakeRect(1 - bitmapRepOfPatchLeft.pixelsWide(), 1, 1, contentImageSize.height));
            const resultImageBitmapRep = NSBitmapImageRep.alloc().initWithFocusedViewRect(NSMakeRect(0, 0, resultImageSize.width, resultImageSize.height));
            resultImage.unlockFocus();

            const imageData = resultImageBitmapRep.representationUsingType_properties(NSPNGFileType, nil);
            const folder = `${exportFolder}/drawable-${dpi}`;
            mkdir(folder);
            imageData.writeToFile_atomically(`${folder}/${ninePatchName}.9.png`, 'NO');
        }
    });
}

function imageOfLayer_rect_scale(layer, rect, scale) {
    const exportRequest = exportRequestOfLayer_inRect_scale(layer, rect, scale);
    const exporter = MSExporter.exporterForRequest_colorSpace(exportRequest, document.sketchObject.colorSpace());
    const image = exporter.image();
    const imageSize = NSMakeSize(Math.round(rect.size.width * scale), Math.round(rect.size.height * scale));
    image.setSize(imageSize);
    return image;
}

function exportRequestOfLayer_inRect_scale(layer, rect, scale) {
    const exportRequest = MSExportRequest.exportRequestsFromLayerAncestry_inRect(layer.ancestry(), rect).firstObject();
    exportRequest.setFormat('png');
    exportRequest.setScale(scale);
    return exportRequest;
}

function bitmapRepFromNSImage_scale(nsImage, scale) {
    const scaledSize = NSMakeSize(Math.round(nsImage.size().width * scale), Math.round(nsImage.size().height * scale));
    const imageData = nsImage.TIFFRepresentation();
    const imageRep = NSBitmapImageRep.imageRepWithData(imageData);
    imageRep.setSize(scaledSize);
    imageRep.setPixelsWide(scaledSize.width);
    imageRep.setPixelsHigh(scaledSize.height);

    const scaleFactor = NSScreen.mainScreen().backingScaleFactor();
    const imageScale = NSImage.alloc().initWithSize(
        NSMakeSize(Math.round(nsImage.size().width * scale / scaleFactor), Math.round(nsImage.size().height * scale / scaleFactor))
    );
    imageScale.lockFocus();
    NSGraphicsContext.currentContext().setImageInterpolation(NSImageInterpolationNone);
    let transform = NSAffineTransform.transform();
    transform.scaleXBy_yBy(1 / scaleFactor, 1 / scaleFactor);
    transform.concat();
    nsImage.drawRepresentation_inRect(imageRep, NSMakeRect(0, 0, imageScale.size().width, imageScale.size().height));
    const bitmapRep = NSBitmapImageRep.alloc().initWithFocusedViewRect(NSMakeRect(0, 0, scaledSize.width, scaledSize.height));
    imageScale.unlockFocus();

    return bitmapRep;
}

function getNinePatchAsset() {
    let assets = [];
    let predicate = NSPredicate.predicateWithFormat(
        'className == "MSSliceLayer" && name == "#9patch" && exportOptions.firstFormat == "png"'
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
            let slices = util.toArray(layer.children().filteredArrayUsingPredicate(predicate));
            slicesToAssets(slices, assets);
        });
    } else {
        let slices = util.toArray(document.sketchObject.allExportableLayers().filteredArrayUsingPredicate(predicate));
        slicesToAssets(slices, assets);
    }
    return assets;
}

function slicesToAssets(slices, assets) {
    slices.forEach(slice => {
        if (isNinePatchLayerGroup(slice)) {
            let group = slice.parentGroup().parentGroup();
            assets.push({
                id: String(group.objectID()),
                group,
                content: slice.parentGroup(),
                patch: util.toArray(group.layers()).find(layer => layer.name() == 'patch')
            });
        } 
    });
}

function isNinePatchLayerGroup(msSlice) {
    const root = msSlice.parentGroup().parentGroup();
    if (
        root &&
        root.class() == 'MSLayerGroup' &&
        msSlice.parentGroup().name() == 'content' && 
        root.layers().count() == 2 &&
        util.toArray(root.layers()).map(layer => String(layer.name())).every(name => ['content', 'patch'].includes(name)) &&
        util.toArray(root.layers()).find(layer => layer.name() == 'patch').layers().count() >= 4
    ) {
        return true;
    }
    return false;
}