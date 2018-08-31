/* =========================================================
    Android
========================================================= */

var ASSET_NAME_TYPES = [
    "Base name. (a / b / c -> c)",
    "Full name. (a / b / c -> a_b_c)"
];

var VECTORDRAWABLE_FOLDERS = [
    "drawable",
    "drawable-anydpi",
    "drawable-v21",
    "drawable-v24",
    "drawable-anydpi-v21",
    "drawable-anydpi-v24"
];

var LANGUAGES = {
    "en": "English",
    "zh_cn": "简体中文"
};

var DPIS = {
    "mdpi": 1,
    "hdpi": 1.5,
    "xhdpi": 2,
    "xxhdpi": 3,
    "xxxhdpi": 4
};

function dpiToScale(dpi) {
    if (DPIS[dpi]) {
        return DPIS[dpi];
    }
    return 1;
}

function assetName(name, type) {
    var nameArray = String(name).split(/\s*\/\s*/);
    // base name
    if (type == 0 || type == null) {
        return cleanName(nameArray.pop()).replace(/^\d+_*/, "");
    }
    // full name
    else {
        var nameParts = [];
        nameArray.forEach(function(part) {
            nameParts.push(cleanName(part));
        });
        return nameParts.join("_").replace(/^\d+_*/, "");
    }
}

function cleanName(name) {
    // Latin to ascii
    var latinToAsciiMapping = {
        "ae": "ä|æ|ǽ",
        "oe": "ö|œ",
        "ue": "ü",
        "Ae": "Ä",
        "Ue": "Ü",
        "Oe": "Ö",
        "A": "À|Á|Â|Ã|Ä|Å|Ǻ|Ā|Ă|Ą|Ǎ",
        "a": "à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª",
        "C": "Ç|Ć|Ĉ|Ċ|Č",
        "c": "ç|ć|ĉ|ċ|č",
        "D": "Ð|Ď|Đ",
        "d": "ð|ď|đ",
        "E": "È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě",
        "e": "è|é|ê|ë|ē|ĕ|ė|ę|ě",
        "G": "Ĝ|Ğ|Ġ|Ģ",
        "g": "ĝ|ğ|ġ|ģ",
        "H": "Ĥ|Ħ",
        "h": "ĥ|ħ",
        "I": "Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ",
        "i": "ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı",
        "J": "Ĵ",
        "j": "ĵ",
        "K": "Ķ",
        "k": "ķ",
        "L": "Ĺ|Ļ|Ľ|Ŀ|Ł",
        "l": "ĺ|ļ|ľ|ŀ|ł",
        "N": "Ñ|Ń|Ņ|Ň",
        "n": "ñ|ń|ņ|ň|ŉ",
        "O": "Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ",
        "o": "ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º",
        "R": "Ŕ|Ŗ|Ř",
        "r": "ŕ|ŗ|ř",
        "S": "Ś|Ŝ|Ş|Š",
        "s": "ś|ŝ|ş|š|ſ",
        "T": "Ţ|Ť|Ŧ",
        "t": "ţ|ť|ŧ",
        "U": "Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ",
        "u": "ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ",
        "Y": "Ý|Ÿ|Ŷ",
        "y": "ý|ÿ|ŷ",
        "W": "Ŵ",
        "w": "ŵ",
        "Z": "Ź|Ż|Ž",
        "z": "ź|ż|ž",
        "AE": "Æ|Ǽ",
        "ss": "ß",
        "IJ": "Ĳ",
        "ij": "ĳ",
        "OE": "Œ",
        "f": "ƒ",
    };
    for (var i in latinToAsciiMapping) {
        var regexp = new RegExp(latinToAsciiMapping[i], "g");
        name = name.replace(regexp, i);
    }
    // Remove no ascii character
    name = name.replace(/[^\u0020-\u007E]/g, "");
    // Remove unsupport character
    name = name.replace(/[\u0021-\u002B\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007E]/g, "");
    // Unix hidden file
    name = name.replace(/^\./, "");
    // , - . _ to space
    name = name.replace(/[\u002C-\u002E\u005F]/g, "_");
    // Replace space to _
    name = name.trim();
    name = name.replace(/\s+/g, "_");
    name = name.toLowerCase();
    return name;
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

function addSliceInToGroup(layerGroup, name, format, useInfluenceRect) {

    removeSliceInGroup(layerGroup);

    var slice = MSSliceLayer.sliceLayerFromLayer(layerGroup);
    if (useInfluenceRect) {
        slice.absoluteRect().setRect(layerGroup.absoluteInfluenceRect());
    }
    slice.setName(name);
    slice.moveToLayer_beforeLayer(layerGroup, layerGroup.firstLayer());
    slice.exportOptions().setLayerOptions(2);

    if (slice.exportOptions().exportFormats().count() > 0) {
        var exportOption = slice.exportOptions().exportFormats().firstObject();
    } else {
        var exportOption = slice.exportOptions().addExportFormat();
    }

    exportOption.setFileFormat(format);
    exportOption.setName("");
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
        parent.insertLayer_beforeLayer(shapeGroup, beforeLayer);
    } else {
        parent.addLayer(shapeGroup);
    }

    return shapeGroup;
}

function getLayerWithNameFromParent(name, parent) {
    var predicate = NSPredicate.predicateWithFormat("name == %@", name);
    var layers = parent.layers().filteredArrayUsingPredicate(predicate);
    return layers.firstObject();
}

/* =========================================================
    Utilities
========================================================= */

function toast(context, message) {
    context.document.showMessage(message);
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

function saveToFolder(fileName) {
    var panel = NSSavePanel.savePanel();
    panel.setNameFieldStringValue(fileName);
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

    var windowWidth = 720,
        windowHeight = 480;
    var window = NSWindow.alloc().init();
    window.setTitle(title);
    window.setFrame_display(NSMakeRect(0, 0, windowWidth, windowHeight), false);
    window.setStyleMask(NSTitledWindowMask | NSClosableWindowMask);
    window.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    window.standardWindowButton(NSWindowZoomButton).setHidden(true);

    var closeButton = window.standardWindowButton(NSWindowCloseButton);
    closeButton.setCOSJSTargetFunction(function(sender) {
        NSApp.stopModal();
        NSApp.endSheet(window);
        context.document.documentWindow().makeKeyAndOrderFront(nil);
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
            if (/^#windowOnFocus_.*/.test(locationHash)) {
                if (window.currentEvent().window() == window) {
                    var point = window.currentEvent().locationInWindow();
                    var x = point.x;
                    var y = windowHeight - point.y - 24;
                    scriptObject.evaluateWebScript("clickAtPoint(" + x + ", " + y + ")");
                }
            }
            didChangeLocationFunction(window, locationHash);
        })
    });
    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setMainFrameURL_(context.plugin.urlForResourceNamed(htmlPath).path());

    window.contentView().addSubview(webView);
    window.center();

    return NSApp.runModalForWindow(window);
}

function showCodeWindow(context, code, saveAction) {
    window(
        context,
        localizedString(context, "code_preview"),
        "code_preview.html",
        function(scriptObject) {

            // Translation HTML
            var currentLanguageSetting = getPreferences(context, "language");
            if (currentLanguageSetting != "en") {
                var languageJSON = {
                    "cancel": localizedString(context, "cancel"),
                    "save": localizedString(context, "save"),
                    "copy": localizedString(context, "copy")
                };
                scriptObject.evaluateWebScript('i18n(' + JSON.stringify(languageJSON) + ')');
            }

            var codeForHTML = code.replace(/\n/g, "\\n");
            scriptObject.evaluateWebScript("previewCode('" + codeForHTML + "')");
        },
        function(nswindow, locationHash) {

            if (locationHash == "#save") {
                NSApp.stopModal();
                NSApp.endSheet(nswindow);
                context.document.documentWindow().makeKeyAndOrderFront(nil);

                saveAction(code);
            }

            if (locationHash == "#cancel") {
                NSApp.stopModal();
                NSApp.endSheet(nswindow);
                context.document.documentWindow().makeKeyAndOrderFront(nil);
            }

            if (locationHash == "#copy") {
                var pasteboard = NSPasteboard.generalPasteboard();
                pasteboard.clearContents();
                pasteboard.setString_forType(code, NSStringPboardType);
            }
        }
    );
}
