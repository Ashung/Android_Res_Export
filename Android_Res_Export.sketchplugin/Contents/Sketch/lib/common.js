/*----------------------------------------------------------

Android Res Export
https://github.com/Ashung/Android_Res_Export

Copyright 2017 Ashung Hung (Ashung.hung@gmail.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
----------------------------------------------------------*/

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

function colorToAndroid(mscolor) {
    var alpha = mscolor.alpha();
    var hex = mscolor.immutableModelObject().hexValue();
    if (alpha < 1) {
        var alphaHex = Math.round(alpha * 255).toString(16);
        if (alphaHex.length == 1) {
            alphaHex = "0" + alphaHex;
        }
        return "#" + alphaHex.toUpperCase() + hex;
    } else {
        return "#" + hex;
    }
}

function gradientStopsToColorArray(stops) {
    var result = [];
    var loop = stops.objectEnumerator();
    while (stop = loop.nextObject()) {
        result.push(colorToAndroid(stop.color()));
    }
    return result;
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

function addSliceInToGroup(layerGroup, name, useInfluenceRect) {

    removeSliceInGroup(layerGroup);

    var slice = MSSliceLayer.sliceLayerFromLayer(layerGroup);
    if (useInfluenceRect) {
        slice.absoluteRect().setRect(layerGroup.absoluteInfluenceRect());
    }
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
        shapeGroup.style().fills().firstObject().setColor(colorObject);
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

    if (MSApplicationMetadata.metadata().appVersion < 47) {
        var imageData = MSImageData.alloc().initWithImage_convertColorSpace(image, false);
    } else {
        var imageData = MSImageData.alloc().initWithImage(image);
    }

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
    return context.document.askForUserInput_initialValue(tip, defaultValue + "");
}

function toast(context, message) {
    if (message) {
        context.document.showMessage(message + "");
    }
}

function getPluginPath(context) {
    return context.plugin.url().path();
}

function alert(context, title, content) {
    var dialog = COSAlertWindow.alloc().init();
    dialog.setMessageText(title);
    dialog.setInformativeText(content);
    var iconPath = context.plugin.urlForResourceNamed("icon.png").path();
    var iconNSImage = NSImage.alloc().initWithContentsOfFile(iconPath);
    dialog.setIcon(iconNSImage);
    dialog.addButtonWithTitle("OK");
    dialog.addButtonWithTitle("Cancel");
    return dialog.runModal();
}

function fileExists(path) {
    return NSFileManager.defaultManager().fileExistsAtPath_(path);
}

function getContentFromFile(filePath) {
    return NSString.stringWithContentsOfFile_encoding_error_(
        filePath, NSUTF8StringEncoding, nil
    );
}

function writeContentToFile(filePath, content) {
    var parentDir = NSString.stringWithString(filePath).stringByDeletingLastPathComponent();
    mkdir(parentDir);
    content = NSString.stringWithString(content);
    return content.writeToFile_atomically_encoding_error_(
        filePath, true, NSUTF8StringEncoding, null
    );
}

function mkdir(path) {
    if (!fileExists(path)) {
        return NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error_(
            path, true, nil, nil
        );
    }
}

function rm(path) {
    return NSFileManager.defaultManager().removeItemAtPath_error_(path, nil);
}

function mv(srcPath, dstPath) {
    return NSFileManager.defaultManager().moveItemAtPath_toPath_error_(srcPath, dstPath, nil);
}

function directoryIsWriteable(path) {
    return NSFileManager.defaultManager().isWritableFileAtPath(path);
}

function getJSONFromPath(path) {
    if (fileExists(path)) {
        var content = NSString.stringWithContentsOfFile_encoding_error_(path, NSUTF8StringEncoding, nil);
        try {
            return JSON.parse(content);
        } catch (e) {
            log(e);
            return null;
        }
    } else {
        return null;
    }
}

function getRemoteJson(url) {
    var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
    var response = NSURLConnection.sendSynchronousRequest_returningResponse_error_(request, nil, nil);
    if (response) {
        var content = NSString.alloc().initWithData_encoding_(response, NSUTF8StringEncoding);
        try {
            return JSON.parse(content);
        } catch (e) {
            log(e);
            return null;
        }
    } else {
        return null;
    }
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

function showInFinder(path) {
    return NSWorkspace.sharedWorkspace().openFile_withApplication(path, "Finder");
}

function openInFinder(path) {
    var fileManager =  NSFileManager.defaultManager();
    var workspace = NSWorkspace.sharedWorkspace();
    var attributesOfFile = fileManager.attributesOfItemAtPath_error(path, nil);
    if (attributesOfFile) {
        var fileType = attributesOfFile.objectForKey("NSFileType");
        if (fileType == "NSFileTypeSymbolicLink") {
            var symbolicLinkPath = fileManager.destinationOfSymbolicLinkAtPath_error(path, nil);
            var url = NSURL.alloc().initWithString(path);
            var absolutePath = NSURL.fileURLWithPath_relativeToURL(symbolicLinkPath, url).path();
            if (fileManager.fileExistsAtPath(absolutePath)) {
                var fileTypeOfSymbolicLink = fileManager.attributesOfItemAtPath_error(absolutePath, nil).objectForKey("NSFileType");
                if (fileTypeOfSymbolicLink == "NSFileTypeRegular") {
                    return workspace.selectFile_inFileViewerRootedAtPath(path, nil);
                }
                if (fileTypeOfSymbolicLink == "NSFileTypeDirectory") {
                    return workspace.openFile(path);
                }
            } else {
                return workspace.selectFile_inFileViewerRootedAtPath(path, nil);
            }
        } else if (fileType == "NSFileTypeRegular") {
            return workspace.selectFile_inFileViewerRootedAtPath(path, nil);
        } else if (fileType == "NSFileTypeDirectory") {
            return workspace.openFile(path);
        }
    }
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
        task.setLaunchPath(command);
        task.setArguments(args);
        task.setStandardOutput(pipe);
        task.setStandardError(errPipe);
        task.launch();
        task.waitUntilExit();
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
    if (fileExists("/Applications/ImageOptim.app")) {
        return runCommand("/bin/bash", ["-l", "-c", " open -a ImageOptim '" + image + "'"]);
    }
}

/* =========================================================
    Google Analytics
========================================================= */

function ga(context, eventCategory, eventAction, eventLabel, eventValue) {

    var uuidKey = 'google.analytics.uuid';
    var uuid = NSUserDefaults.standardUserDefaults().objectForKey(uuidKey);
    if (!uuid) {
        uuid = NSUUID.UUID().UUIDString();
        NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, uuidKey);
    }

    var trackingID = "UA-99098773-1",
        appName = encodeURI(context.plugin.name()),
        appId = context.plugin.identifier(),
        appVersion = context.plugin.version();

    var url = "https://www.google-analytics.com/collect?v=1";
    // Tracking ID
    url += "&tid=" + trackingID;
    // Source
    url += "&ds=sketch" + MSApplicationMetadata.metadata().appVersion;
    // Client ID
    url += "&cid=" + uuid;
    // User GEO location
    url += "&geoid=" + NSLocale.currentLocale().countryCode();
    // User language
    url += "&ul=" + NSLocale.currentLocale().localeIdentifier().toLowerCase();
    // pageview, screenview, event, transaction, item, social, exception, timing
    url += "&t=event";
    // App Name
    url += "&an=" + appName;
    // App ID
    url += "&aid=" + appId;
    // App Version
    url += "&av=" + appVersion;
    // Event category
    url += "&ec=" + encodeURI(eventCategory);
    // Event action
    url += "&ea=" + encodeURI(eventAction);
    // Event label
    if (eventLabel) {
        url += "&el=" + encodeURI(eventLabel);
    }
    // Event value
    if (eventValue) {
        url += "&ev=" + encodeURI(eventValue);
    }

    var session = NSURLSession.sharedSession();
    var task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
    task.resume();

}

/* =========================================================
    Window
========================================================= */
function window(context, title, htmlPath, didFinishLoadFunction, didChangeLocationFunction) {

    var windowWidth = 800,
        windowHeight = 600;
    var window = NSWindow.alloc().init();
    window.setTitle(title);
    window.setFrame_display(NSMakeRect(0, 0, windowWidth, windowHeight), false);
    window.setStyleMask(NSTitledWindowMask | NSClosableWindowMask);
    window.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    window.standardWindowButton(NSWindowZoomButton).setHidden(true);

    var closeButton = window.standardWindowButton(NSWindowCloseButton);
    closeButton.setCOSJSTargetFunction(function(sender) {
        NSApp.stopModal();
    });

    var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, windowWidth, windowHeight - 22));
    webView.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(248/255, 248/255, 248/255, 1));
    var scriptObject = webView.windowScriptObject();

    var delegate = new MochaJSDelegate({
        "webView:didFinishLoadForFrame:": (function(webView, webFrame) {
            didFinishLoadFunction(scriptObject);
        }),
        "webView:didChangeLocationWithinPageForFrame:": (function(webView, webFrame) {
            var locationHash = scriptObject.evaluateWebScript("window.location.hash");
            if (locationHash == "#focus") {
                var point = colorPicker.currentEvent().locationInWindow();
                var x = point.x;
                var y = windowHeight - point.y - 22;
                if (x > 0 && y > 0) {
                    windowObject.evaluateWebScript("clickAtPoint(" + x + ", " + y + ")");
                }
            }
            didChangeLocationFunction(locationHash);
        })
    });
    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setMainFrameURL_(context.plugin.urlForResourceNamed(htmlPath).path());

    window.contentView().addSubview(webView);
    window.autorelease();
    window.center();

    return NSApp.runModalForWindow(window);
}
