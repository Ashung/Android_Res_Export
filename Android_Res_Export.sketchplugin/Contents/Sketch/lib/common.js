//
// Android Res Export
// Homepage: https://github.com/Ashung/Android_Res_Export
// Author: Ashung Hung
// Email: Ashung.hung@gmail.com
// License: https://creativecommons.org/licenses/by-sa/4.0


/* =========================================================
    Android
========================================================= */

function getExportConfigFromPageName(pageName) {
    var exportConfig = [
        { scale : 1,   qualifier : "mdpi" },
        { scale : 1.5, qualifier : "hdpi" },
        { scale : 2,   qualifier : "xhdpi" },
        { scale : 3,   qualifier : "xxhdpi" },
        { scale : 4,   qualifier : "xxxhdpi" }
    ];

    if (/^@/.test(pageName)) {
        exportConfig = [];
        var configs = pageName.replace(/^@/, "").replace(/\s/g, "").split(",");
        for (var i = 0; i < configs.length; i ++) {
            var dpi = "";
            if (/(no|l|m|h|xh|xxh|xxxh|any|tv|\d+)dpi/i.test(configs[i])) {
                dpi = configs[i].match(/[^-]+dpi/i)[0];
            }
            exportConfig.push({
                scale : dpiToScale(dpi),
                qualifier : configs[i]
            });
        }
    }

    return exportConfig;
}

function androidResName(name) {
    // .replace(/[\u0000-\u0031\/\\\|\?\"\*\:\<\>\.]/g, "_")
    // .replace(/[^A-Za-z0-9\$\_]/g, "_")
    return name.replace(/[\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/g, "_")
        .replace(/^\d+/, "")
        .toLowerCase()
        .substring(0, 255);
}

function dpiToScale(dpi) {
    if (/^\d+/.test(dpi)) {
        var dpiValue = dpi.match(/\d+/)[0];
        var size = dpiValue / 160;
        return Number.isInteger(size) ? size : size.toFixed(2);
    } else {
        switch (dpi) {
            case "ldpi" :
                return 0.75;
                break;
            case "mdpi" :
                return 1;
                break;
            case "hdpi" :
                return 1.5;
                break;
            case "xhdpi" :
                return 2;
                break;
            case "xxhdpi" :
                return 3;
                break;
            case "xxxhdpi" :
                return 4;
                break;
            case "tvdpi" :
                return 1.33;
                break;
            case "anydpi" :
                return 1;
                break;
            case "nodpi" :
                return 1;
                break;
            default:
                return 1;
        }
    }
}

/* =========================================================
    Sketch
========================================================= */

function groupFromSelection(context) {
    var selection = context.selection;
    var group = MSLayerGroup.groupFromLayers(MSLayerArray.arrayWithLayers(selection));
    return group;
}

function groupFromLayers(layers) {
    var group = MSLayerGroup.groupFromLayers(MSLayerArray.arrayWithLayers(layers));
    return group;
}

function addSliceInToGroup(layerGroup, name) {

    removeSliceInGroup(layerGroup);

    var slice = MSSliceLayer.sliceLayerFromLayer(layerGroup);
    slice.absoluteRect().setRect(layerGroup.absoluteInfluenceRect());
    slice.setName(name);
    slice.moveToLayer_beforeLayer(layerGroup, layerGroup.firstLayer());
    slice.exportOptions().setLayerOptions(2);

    var exportOption = slice.exportOptions().addExportFormat();
    exportOption.setFileFormat("png");
    exportOption.setName("@android_res_export");
    exportOption.setScale(1);

    return slice;
}

function removeSliceInGroup(layerGroup) {
    var loop = layerGroup.children().objectEnumerator();
    var layer;
    while (layer = loop.nextObject()) {
        if (layer.class() == "MSSliceLayer") {
            layer.removeFromParent();
        }
    }
}

function addRectShape(parent, beforeLayer, posX, posY, width, height, color, name) {

    var rectangle = MSRectangleShape.alloc().init();
    rectangle.setRect(CGRectMake(posX, posY, width, height));
    var shapeGroup = MSShapeGroup.shapeWithPath(rectangle);
    shapeGroup.setName(name);

    if (color) {
        // color #rrggbb
        var colorObject = MSColor.colorWithRed_green_blue_alpha(
            parseInt(color.substr(1, 2), 16) / 255,
            parseInt(color.substr(3, 2), 16) / 255,
            parseInt(color.substr(4, 2), 16) / 255,
            1.0
        );
        shapeGroup.style().addStylePartOfType(0);
        shapeGroup.style().fill().setColor(colorObject);
    }

    if (beforeLayer) {
        parent.insertLayers_beforeLayer([shapeGroup], beforeLayer);
    } else {
        parent.addLayers([shapeGroup]);
    }

    return shapeGroup;
}

function insertImageLayer_fromResource(context, layerParent, rect, resName) {
    var imagePath = context.plugin.urlForResourceNamed(resName).path();
    var image = NSImage.alloc().initWithContentsOfFile(imagePath);
    var imageData = MSImageData.alloc().initWithImage_convertColorSpace(image, false);
    var imageLayer = MSBitmapLayer.alloc().initWithFrame_image(rect, imageData);
    imageLayer.setName(resName.replace(/\.png$/i, ""));
    if (layerParent.containsLayers()) {
        layerParent.insertLayers_afterLayer([imageLayer], layerParent.firstLayer());
    } else {
        layerParent.insertLayers_afterLayer([imageLayer], nil);
    }
    return imageLayer;
}

/* =========================================================
    Utilities
========================================================= */

function ask(context, tip, defaultValue) {
    var doc = context.document;
    return doc.askForUserInput_initialValue(tip, defaultValue + "");
}

function toast(context, message) {
    var doc = context.document;
    if (message) {
        doc.showMessage(message + "");
    }
}

function getPluginPath(context) {
    var path = context.plugin.url().path();
    return path;
}

function alert(title, content) {
    var app = NSApplication.sharedApplication();
    app.displayDialog_withTitle_(content, title);
}

function fileExists(path) {
    return NSFileManager.defaultManager().fileExistsAtPath_(path);
}

function getContentFromFile(filePath) {
    var content = NSString.stringWithContentsOfFile_encoding_error_(
        filePath, NSUTF8StringEncoding, nil
    );
    return content;
}

function writeContentToFile(filePath, content) {
    content = NSString.stringWithFormat('%@', content);
    content.writeToFile_atomically_encoding_error_(
        filePath, true, NSUTF8StringEncoding, null
    );
}

function mkdir(path) {
    if (!fileExists(path)) {
        NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error_(
            path, true, nil, nil
        );
    }
}

function rm(path) {
    if (fileExists(path)) {
        NSFileManager.defaultManager().removeItemAtPath_error_(
            path, nil
        );
    }
}

function mv(srcPath, dstPath) {
    if (fileExists(srcPath)) {
        NSFileManager.defaultManager().moveItemAtPath_toPath_error_(
            srcPath, dstPath, nil
        )
    }
}

function getJSONFromPath(path) {
    var data = NSData.dataWithContentsOfFile(path);
    return NSJSONSerialization.JSONObjectWithData_options_error(data, NSJSONReadingMutableContainers, nil);
}

function localizedString(context, langKey) {
    var currentLanguageSetting = getPreferences(context, "language");
    var languageFilePath = context.plugin.urlForResourceNamed("language_" + currentLanguageSetting + ".json").path();
    var langString = getJSONFromPath(languageFilePath)[langKey];
    for (var i = 2; i < arguments.length; i++) {
        var regExp = new RegExp("\%" + (i-1), "g");
        langString = langString.replace(regExp, arguments[i]);
    }
    return langString;
}

function chooseFolder() {
    var panel = NSOpenPanel.openPanel();
    panel.setCanChooseDirectories(true);
    panel.setCanChooseFiles(false);
    panel.setCanCreateDirectories(true);
    if (panel.runModal() == NSOKButton) {
        return panel.URL().path();
    }
}

function openInFinder(path) {
    NSWorkspace.sharedWorkspace().selectFile_inFileViewerRootedAtPath(path, nil);
}

function getPreferences(context, key) {
    var identifier = context.plugin.identifier();
    var userDefaults = NSUserDefaults.standardUserDefaults();
    if (!userDefaults.dictionaryForKey(identifier)) {
        var defaultPreferences = NSMutableDictionary.alloc().init();
        defaultPreferences.setObject_forKey("en", "language");
        defaultPreferences.setObject_forKey(true, "show_in_finder_after_export");
        defaultPreferences.setObject_forKey(false, "use_imageoptim_after_export");
        userDefaults.setObject_forKey(defaultPreferences, identifier);
        userDefaults.synchronize();
    }
    return userDefaults.dictionaryForKey(identifier).objectForKey(key);
}

function setPreferences(context, key, value) {
    var identifier = context.plugin.identifier();
    var userDefaults = NSUserDefaults.standardUserDefaults();
    if (!userDefaults.dictionaryForKey(identifier)) {
        var preferences = NSMutableDictionary.alloc().init();
    } else {
        var preferences = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(identifier));
    }
    preferences.setObject_forKey(value, key);
    userDefaults.setObject_forKey(preferences, identifier);
    userDefaults.synchronize();
}

/* =========================================================
    Command line tools
========================================================= */

function which(command) {
    var path = "";
    runCommand("/bin/bash", ["-l", "-c", "which " + command], function(status, msg) {
        if (status && msg != "") {
            path += msg;
            path = path.replace(/\s*$/g, "");
        }
    });
    return path;
}

function runCommand(command, args, callback) {
    var task = NSTask.alloc().init();
    var pipe = NSPipe.pipe();
    var errPipe = NSPipe.pipe();
        task.launchPath = command;
        task.arguments = args;
        task.standardOutput = pipe;
        task.standardError = errPipe;
        task.launch();
    var errorData = errPipe.fileHandleForReading().readDataToEndOfFile();
    if (errorData != nil && errorData.length()) {
        var message = NSString.alloc().initWithData_encoding_(errorData, NSUTF8StringEncoding);
        if (callback && typeof(callback) == "function") {
            callback(
                task.terminationStatus() == 0,
                message
            );
            return;
        } else {
            return NSException.raise_format_("failed", message);
        }
    }
    var data = pipe.fileHandleForReading().readDataToEndOfFile();
    if (callback && typeof(callback) == "function") {
        callback(
            task.terminationStatus() == 0,
            NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding)
        );
    }
}

function imageOptim(image) {
    runCommand("/bin/bash", ["-l", "-c", " open -a ImageOptim '" + image + "'"]);
}

/* =========================================================
    Google Analytics
========================================================= */

function ga(trackingID, appName, appId, appVersion, eventCategory, eventAction) {

    var uuidKey = 'google.analytics.uuid';
    var uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey);
    if (!uuid) {
        uuid = NSUUID.UUID().UUIDString();
        NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, uuidKey);
    }

    var url = "https://www.google-analytics.com/collect?";
    url += "v=1" + "&";
    // Tracking ID
    url += "tid=" + trackingID + "&";
    // Source
    url += "ds=sketch" + MSApplicationMetadata.metadata().appVersion + "&";
    // Client ID
    url += "cid=" + uuid + "&";
    // User GEO location
    url += "geoid=" + NSLocale.currentLocale().countryCode() + "&";
    // User language
    url += "ul=" + NSLocale.currentLocale().localeIdentifier().toLowerCase() + "&";
    // pageview, screenview, event, transaction, item, social, exception, timing
    url += "t=event" + "&";
    // App Name
    url += "an=" + appName + "&";
    // App ID
    url += "aid=" + appId + "&";
    // App Version
    url += "av=" + appVersion + "&";
    // Event category
    url += "ec=" + eventCategory + "&";
    // Event action
    url += "ea=" + eventAction;

    var session = NSURLSession.sharedSession();
    var task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
    task.resume();

}
