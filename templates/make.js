
var fs = require("fs");
var yaml = require("js-yaml");
var Mustache = require("mustache");
var supportLanguages = ["en", "zh"]; //, "zh_Hans", "zh_Hant"
var template = fs.readFileSync("./manifest.mustache", "utf8");

for (var i = 0; i < supportLanguages.length; i++) {
    var language = yaml.safeLoad(fs.readFileSync("templates/language_" + supportLanguages[i] + ".yaml", "utf8"));
    var manifest = Mustache.render(template, language);
    try {
        if (JSON.parse(manifest)) {
            fs.writeFileSync("../resources/manifest_" + supportLanguages[i] + ".json", manifest);
            if (supportLanguages[i] == "en") {
                fs.writeFileSync("../src/manifest.json", manifest);
            }
        }
        if (JSON.parse(JSON.stringify(language))) {
            fs.writeFileSync("../resources/language_" + supportLanguages[i] + ".json", JSON.stringify(language, null, 4));
        }
    } catch (e) {
        console.error(e);
    }
}
