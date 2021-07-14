const { fileExists, copyFileTo } = require('./lib/fs');

export function onOpenDocument() {
    
    const sketchLanguage = String(NSUserDefaults.standardUserDefaults().objectForKey('AppleLanguages').firstObject()).replace(/-\w*/g, '');
    const languageFile = __command.pluginBundle().urlForResourceNamed(`manifest_${sketchLanguage}.json`).path();
    const manifestFilePath = __command.pluginBundle().url().path() + '/Contents/Sketch/manifest.json';

    if (fileExists(languageFile)) {
        NSFileManager.defaultManager().removeItemAtPath_error(manifestFilePath, nil);
        NSFileManager.defaultManager().copyItemAtPath_toPath_error(languageFile, manifestFilePath, nil);
        AppController.sharedInstance().pluginManager().reloadPlugins();
    }
}