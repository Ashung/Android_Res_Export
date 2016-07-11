

function save_path(context) {
    var doc = context.document;
    if(doc.fileURL()) {
        var defaultDir = [[doc fileURL] URLByDeletingLastPathComponent];
        var panel = [NSOpenPanel openPanel];
            [panel setMessage:"Where do you want to export the assets?"];
            [panel setCanChooseDirectories: true];
            [panel setCanChooseFiles: false];
            [panel setCanCreateDirectories: true];
            [panel setDirectoryURL:defaultDir];
        if ([panel runModal] == NSOKButton) {
            return [panel filename];
        }
    } else {
        log("NO")
    }

// log( [doc fileURL])






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




}

function convert_iconset_to_icns(iconsetPath, iconPath) {
	var createCmd  = "iconutil -c icns \"" + iconsetPath + "\" -o \"" + iconPath + "\""
	var createTask = [[NSTask alloc] init]
	[createTask setLaunchPath:@"/bin/bash"]
	[createTask setArguments:["-c", createCmd]]
	[createTask launch]
	[createTask waitUntilExit]

	if ([createTask terminationStatus] == 0) {
		[doc showMessage:@"Done"]
	} else {
		[doc showMessage:@"Failed:" + [createTask terminationReason]]
	}
}
