//
// Author: Ashung Hung
// Email: Ashung.hung@gmail.com

// sketchtool
var sketchtool = NSBundle
    .mainBundle()
    .pathForResource_ofType_inDirectory("sketchtool", nil, "sketchtool/bin");
var sketchmigrate = NSBundle
    .mainBundle()
    .pathForResource_ofType_inDirectory("sketchmigrate", nil, "sketchtool/bin");

// ImageMagick
var convert = which("convert");

// SVGO
var svgo = which("svgo");

/* =========================================================
    Android
========================================================= */

var exportConfig = [
    { scale : 1,   qualifier : "mdpi" },
    { scale : 1.5, qualifier : "hdpi" },
    { scale : 2,   qualifier : "xhdpi" },
    { scale : 3,   qualifier : "xxhdpi" },
    { scale : 4,   qualifier : "xxxhdpi" }
];

function resetExportConfig(pageName) {
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
}

function androidResName(name) {
    // .replace(/[\u0000-\u0031\/\\\|\?\"\*\:\<\>\.]/g, "_")
    // .replace(/[^A-Za-z0-9\$\_]/g, "_")
    return name.replace(/[\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/g, "_")
        .replace(/^\d+/, "_")
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

function scaleToSuffix(size) {
    var r = "";
    if (size > 0 && size < 0.05) {
        r = "@0.0x";
    } else if (size >= 0.05 && size <= 0.15) {
        r = "@0.1x";
    } else if (size > 0.15 && size <= 0.25) {
        r = "@0.2x";
    } else if (size > 0.25 && size <= 0.35) {
        r = "@0.3x";
    } else if (size > 0.35 && size < 0.45) {
        r = "@0.4x";
    } else if (size >= 0.45 && size < 0.65) {
        r = "@0.5x";
    } else if (size >= 0.55 && size < 0.65) {
        r = "@0.6x";
    } else if (size >= 0.65 && size < 0.75) {
        r = "@0.7x";
    } else if (size >= 0.75 && size <= 0.85) {
        r = "@0.8x";
    } else if (size > 0.85 && size <= 0.95) {
        r = "@0.9x";
    } else if (size > 0.95 && size < 1) {
        r = "@1.0x";
    } else if (size > 1) {
        r = "@" + Math.floor(size) + "x";
    }
    return r;
}

/* =========================================================
    Sketch
========================================================= */

function group(context) {
    var doc = context.document;
    var selection = context.selection;
    var groupAction = doc.actionsController().actionWithID("MSGroupAction");
    if (groupAction.validate()) {
        groupAction.group(nil);
    }
}

function addSliceFromGroup(context, layerGroup, name) {
    var doc = context.document;
    var slice = MSSliceLayer.new();
    slice.frame().setX(0);
    slice.frame().setY(0);
    slice.frame().setWidth(layerGroup.frame().width());
    slice.frame().setHeight(layerGroup.frame().height());
    slice.setName(name);
    layerGroup.addLayers([slice]);
    // Send slice to back
    slice.select_byExpandingSelection(true, false);
    NSApp.sendAction_to_from_("moveToBack:", nil, doc);
    // Select layerGroup
    layerGroup.select_byExpandingSelection(true, false);
}

function addRectShape(parent, posX, posY, width, height, color, name) {
    var rectangle = MSRectangleShape.alloc().init();
    rectangle.frame = MSRect.rectWithRect(NSMakeRect(posX, posY, width, height));
    var shapeGroup = MSShapeGroup.shapeWithPath(rectangle);
    shapeGroup.setName(name);
    shapeGroup.style().addStylePartOfType(0);
    shapeGroup.style().fill().setColor(MSColor.colorWithSVGString(color));
    parent.addLayers([shapeGroup]);
    return shapeGroup;
}

/* =========================================================
    Utilities
========================================================= */

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

function getFilePath(context) {
    var doc = context.document;
    if (doc.fileURL()) {
        return doc.fileURL().path();
    } else {
        alert(context.plugin.name(), "Save your document first.");
        return null;
    }
}

function alert(title, content) {
    var app = NSApplication.sharedApplication();
    app.displayDialog_withTitle_(content, title);
}

function askForUserInput(context, title, initial) {
    var doc = context.document;
    var result = doc.askForUserInput_initialValue(title, initial);
    return result;
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

/* =========================================================
    Command line tools
========================================================= */

function clipboard() {
    var content = "";
    runCommand("/bin/bash", ["-l", "-c", "pbpaste"], function(status, msg) {
        if (status && msg != "") {
            content = msg.replace(/\n/, "");
        }
    });
    return content;
}

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

function mvUseShell(formPath, toPath, callback) {
    var command = "/bin/bash";
    var args = [
        "-l",
        "-c",
        'mv "' + formPath + '" "' + toPath + '"'
    ];
    runCommand(command, args, callback);
}

function rmUseShell(file, callback) {
    var command = "/bin/bash";
    var args = [
        "-l",
        "-c",
        'rm "' + file + '"'
    ];
    runCommand(command, args, callback);
}

function mkdirUseShell(dirPath, callback) {
    var command = "/bin/bash";
    var args = [
        "-l",
        "-c",
        'mkdir -p "' + dirPath + '"'
    ];
    runCommand(command, args, callback);
}

function optimizeSVG(svg) {
    var code = "";
    runCommand("/bin/bash", ["-l", "-c", svgo + " -s '" + svg + "' -p 2 -o -"], function(status, msg) {
        if (status && msg != "") {
            code = msg;
        }
    });
    return code;
}

function sketchtoolExport(exportType, sketchFile, scales, formats, itemIds, useIdForName, outputFolder, callback) {
    // sketcktool export
    //     slices|layers|pages|artboards
    //     <file.sketch>
    //     --scales="1, 1.5, 2, 3, 4"
    //     --items="<id>,<id>"
    //     --formats="png"
    //     --use-id-for-name="yes|no"
    //     --group-contents-only="yes"
    //     --overwritin="yes"
    //     --output="<dir>"
    var command = "/bin/bash";
    var args = [
        "-c",
        sketchtool + ' export ' + exportType
            + ' "' + sketchFile + '"'
            + ' --scales="' + scales.toString() + '"'
            + ' --formats="' + formats.toString() + '"'
            + ' --use-id-for-name="' + useIdForName + '"'
            + ' --group-contents-only="yes"'
            + ' --save-for-web="no"'
            + ' --overwritin="yes"'
    ];
    if (itemIds.length > 1) {
        args[1] += ' --items="' + itemIds.toString() + '"';
    } else {
        args[1] += ' --item="' + itemIds[0] + '"';
    }
        args[1] += ' --output="' + outputFolder + '"';
    runCommand(command, args, callback);
}

function createMdpiPatchLines(cwd, width, height, mdpiPatchId, callback) {
    var command = "/bin/bash";
    var args = [
        "-l",
        "-c",
        'cd "' + cwd + '" && '
            + convert + ' -crop ' + Math.floor(width) + 'x1+1+0 '
                + mdpiPatchId + '.png ' + mdpiPatchId + '_top.png && '
            + convert + ' -crop 1x' + Math.floor(height) + '+' + (Math.floor(width)+1) + '+1 '
                + mdpiPatchId + '.png ' + mdpiPatchId + '_right.png && '
            + convert + ' -crop ' + Math.floor(width) + 'x1+1+' + (Math.floor(height)+1) + ' '
                + mdpiPatchId + '.png ' + mdpiPatchId + '_bottom.png && '
            + convert + ' -crop 1x' + Math.floor(height) + '+0+1 '
                + mdpiPatchId + '.png ' + mdpiPatchId + '_left.png'
    ];
    runCommand(command, args, callback);
}

function createNinePath(cwd, scale, suffix, width, height, contentId, patchId, callback) {
    var newWidth = Math.floor(width * scale);
    var newHeight = Math.floor(height * scale);
    var temp = contentId + "_temp" + suffix + ".png";
    var content = contentId + suffix + ".png";
    var patchTop = patchId + "_top.png";
    var patchRight = patchId + "_right.png";
    var patchBottom = patchId + "_bottom.png";
    var patchLeft = patchId + "_left.png";
    var command = "/bin/bash";
    var args = [
        "-l",
        "-c",
        'cd "' + cwd + '" && '
            + convert + ' -size ' + (newWidth + 2) + 'x' + (newHeight + 2) + ' xc:none '
            + content + ' -gravity Center -composite '
            + '\\( -resize ' + newWidth + 'x1! -filter point -interpolate Nearest '
                + patchTop + ' \\) -gravity North -composite '
            + '\\( -resize 1x' + newHeight + '! -filter point -interpolate Nearest '
                + patchRight + ' \\) -gravity East -composite '
            + '\\( -resize ' + newWidth + 'x1! -filter point -interpolate Nearest '
                + patchBottom + ' \\) -gravity South -composite '
            + '\\( -resize 1x' +  newHeight + '! -filter point -interpolate Nearest '
                + patchLeft + ' \\) -gravity West -composite '
            + temp
    ];
    runCommand(command, args, callback);
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
