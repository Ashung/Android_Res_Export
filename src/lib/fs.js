function fileExists(path) {
    return NSFileManager.defaultManager().fileExistsAtPath_(path);
}

function writeContentToFile(filePath, content) {
    const parentDir = NSString.stringWithString(filePath).stringByDeletingLastPathComponent();
    mkdir(parentDir);
    const data = NSString.stringWithString(content);
    data.writeToFile_atomically_encoding_error(
        filePath, true, NSUTF8StringEncoding, null
    );
    return parentDir;
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

function revealInFinder(path) {
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

function pasteboardCopy(text) {
    var pasteboard = NSPasteboard.generalPasteboard();
    pasteboard.clearContents();
    pasteboard.setString_forType(text, NSStringPboardType);
}

function openURL(url) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
}

module.exports.fileExists = fileExists;
module.exports.writeContentToFile = writeContentToFile;
module.exports.mkdir = mkdir;
module.exports.directoryIsWriteable = directoryIsWriteable;
module.exports.chooseFolder = chooseFolder;
module.exports.saveToFolder = saveToFolder;
module.exports.revealInFinder = revealInFinder;
module.exports.openInFinder = openInFinder;
module.exports.pasteboardCopy = pasteboardCopy;
module.exports.openURL = openURL;