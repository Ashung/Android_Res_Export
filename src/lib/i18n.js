module.exports = function(langKey) {
    const languages = require('../languages.json');
    // Sketch language
    const sketchLanguage = String(
        NSUserDefaults.standardUserDefaults().objectForKey('AppleLanguages').firstObject()
    ).replace(/-\w*/g, '');

    if (languages[langKey]) {
        let langString = languages[langKey][sketchLanguage];
        for (let i = 1; i < arguments.length; i++) {
            let regExp = new RegExp('\%' + i, 'g');
            langString = langString.replace(regExp, arguments[i]);
        }
        return langString;
    }
    return '';
} 
