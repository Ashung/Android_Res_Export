//
// Author: Ashung Hung
// Email: Ashung.hung@gmail.com

// sketchtool
const sketchtool = NSBundle.mainBundle().pathForResource_ofType_inDirectory("sketchtool", nil,"sketchtool/bin");
const sketchmigrate = NSBundle.mainBundle().pathForResource_ofType_inDirectory("sketchmigrate", nil,"sketchtool/bin");

// imageMagick
const composite = "/usr/local/bin/composite";
const convert = "/usr/local/bin/composite";

function convertToAndroidResName(name) {
    // .replace(/[\u0000-\u0031\/\\\|\?\"\*\:\<\>\.]/g, "_")
    // .replace(/[^A-Za-z0-9\$\_]/g, "_")
    return name.replace(/[\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/g, "_")
        .replace(/^\d+/, "_")
        .toLowerCase()
        .substring(0, 255);
}

function toast(context, message) {
    var doc = context.document;
    doc.showMessage(message);
}

function getPluginPath(context) {
    var path = decodeURI(context.plugin.url()).replace("file://", ""));
    return path;
}

function getFilePath(context) {
    var doc = context.document;
    var path = decodeURI(doc.fileURL()).replace("file://", ""));
    return path;
}

function selectFolderDialog(context, message) {
    var doc = context.document;
    if(doc.fileURL()) {
        var defaultDir = [[doc fileURL] URLByDeletingLastPathComponent];
        var panel = [NSOpenPanel openPanel];
            [panel setMessage: message];
            [panel setCanChooseDirectories: true];
            [panel setCanChooseFiles: false];
            [panel setCanCreateDirectories: true];
            [panel setDirectoryURL: defaultDir];
        if ([panel runModal] == NSOKButton) {
            return [panel filename];
        }
    } else {
        toast(context, "Save document first.");
    }
}

function sketchtoolExport(sketchFile, outputFolder, itemIds) {
    var command = sketchtool + ' export slices "' + sketchFile +
        '" --use-id-for-name="yes" --scales="1, 1.5, 2, 3, 4" --group-contents-only="yes" --overwritin="yes"';
    if(itemIds) {
        command += ' --items="' + itemIds + '"';
    }
        command += ' --output="' + outputFolder + '"';

    runCommand(command);
}

function mv(formPath, toPath) {
    var command = 'mv ' + formPath + ' ' + toPath;
    runCommand(command);
}

function mkResDir(rootFolder) {
    var command = 'cd ' + rootFolder + ' && mkdir -p ' +
        'res/drawable-mdpi ' +
        'res/drawable-hdpi ' +
        'res/drawable-xhdpi ' +
        'res/drawable-xxhdpi ' +
        'res/drawable-xxxhdpi';
    runCommand(command);
}

function mkMipmapDir(rootFolder) {
    var command = 'cd ' + rootFolder + ' && mkdir -p ' +
        'res/mipmap-mdpi ' +
        'res/mipmap-hdpi ' +
        'res/mipmap-xhdpi ' +
        'res/mipmap-xxhdpi ' +
        'res/mipmap-xxxhdpi';
    runCommand(command);
}

function runCommand(command) {
    var task = NSTask.alloc().init();
        task.setLaunchPath_(@"/bin/bash");
        task.setArguments_(NSArray.arrayWithObjects_("-c", command, nil));
        task.launch();
        task.waitUntilExit();

    if (task.terminationStatus() != 0) {
        toast(task.terminationReason());
    }
}

////////////

function runCommandWithReturn(command) {
    var task = NSTask.alloc().init();
    var pipe = NSPipe.pipe();
    var errPipe = NSPipe.pipe();

    task.setLaunchPath_(@"/bin/bash");
    task.setArguments_(NSArray.arrayWithObjects_("-c", command, nil));
    task.setStandardOutput_(pipe);
    task.setStandardError_(errPipe);
    task.launch();
    task.waitUntilExit();

    var data = errPipe.fileHandleForReading().readDataToEndOfFile();
    if (data != nil && data.length()) {
      var message = NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding);

      log("11111" + NSException.raise_format_("failed", message))
      return NSException.raise_format_("failed", message);
    }
    data = pipe.fileHandleForReading().readDataToEndOfFile();

    log(NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding))

    return NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding);
}



// var createTask = [[NSTask alloc] init];
// [createTask setLaunchPath:@"/bin/bash"];
// [createTask setArguments:["-c", command]]
// [createTask launch]
// [createTask waitUntilExit]


//     // var curPath = [doc fileURL] ? [[[doc fileURL] path] stringByDeletingLastPathComponent] : @"~";
//     // var curName = [[doc displayName] stringByDeletingPathExtension];
//     var savePanel = [NSSavePanel savePanel];
//
//     [savePanel setTitle:@"Export"];
//     // [savePanel setNameFieldLabel:@"Export To:"];
//     [savePanel setPrompt:@"Export"];
//     // [savePanel setAllowedFileTypes: [NSArray arrayWithObject:@"icns"]];
//     // [savePanel setAllowsOtherFileTypes:false]
//     // ----[savePanel canChooseFiles:false]
//     [savePanel setCanCreateDirectories:true]
//     // [savePanel setDirectoryURL:[NSURL fileURLWithPath:curPath]]
//     [savePanel setDirectoryURL:[[doc fileURL] URLByDeletingLastPathComponent]]
//     // [savePanel setNameFieldStringValue:curName]
//
//     if ([savePanel runModal] != NSOKButton) {
//     	exit
//     }
//
//     // return [[savePanel URL] path]
// return [savePanel filename]
