
var fs = require("fs");
var yaml = require("js-yaml");
var Mustache = require("mustache");
var supportLanguages = ["en", "zh_cn"]; //, "zh_Hans", "zh_Hant"
var template = fs.readFileSync("templates/manifest.mustache", "utf8");

for (var i = 0; i < supportLanguages.length; i++) {
    var language = yaml.safeLoad(fs.readFileSync("templates/language_" + supportLanguages[i] + ".yaml", "utf8"));
    var manifest = Mustache.render(template, language);

    try {
        if (JSON.parse(manifest)) {
            fs.writeFileSync("Android_Res_Export.sketchplugin/Contents/Resources/manifest_" + supportLanguages[i] + ".json", manifest);
            if (supportLanguages[i] == "en") {
                fs.writeFileSync("Android_Res_Export.sketchplugin/Contents/Sketch/manifest.json", manifest);
            }
        }

        if (JSON.parse(JSON.stringify(language))) {
            fs.writeFileSync("Android_Res_Export.sketchplugin/Contents/Resources/language_" + supportLanguages[i] + ".json", JSON.stringify(language, null, 4));
        }
    } catch (e) {
        console.error(e);
    }

}
