const VECTORDRAWABLE_FOLDERS = [
    'drawable',
    'drawable-anydpi',
    'drawable-anydpi-v21',
    'drawable-anydpi-v24'
];

const DPIS = {
    'mdpi': 1,
    'hdpi': 1.5,
    'xhdpi': 2,
    'xxhdpi': 3,
    'xxxhdpi': 4
};

function dpiToScale(dpi) {
    if (DPIS[dpi]) {
        return DPIS[dpi];
    }
    return 1;
}

function assetName(layerName, type, defaultName) {
    let nameArray = layerName.split(/\s*\/\s*/);
    let name;
    // Valid last part of layer name.
    if (type == 0 || type == null) {
        name = cleanName(nameArray[nameArray.length - 1]).replace(/^\d+_*/, '');
    }
    // Valid full layer name
    else if (type == 1) {
        let nameParts = [];
        nameArray.forEach(function(part) {
            nameParts.push(cleanName(part));
        });
        name = nameParts.join('_').replace(/^\d+_*/, '');
    }
    // Last part of layer name.
    else if (type == 2) {
        name = nameArray[nameArray.length - 1];
        name = name.replace(/[`~!@#$%^&*+=:;,<>?|(){}\[\]\\]/g, '');
        name = name.trim();
    }
    // Full layer name
    else if (type == 3) {
        name = layerName.replace(/\s*\/\s*/g, '_');
        name = name.replace(/[`~!@#$%^&*+=:;,<>?|(){}\[\]\\]/g, '');
        name = name.trim();
    }
    if (
        name == '' ||
        (name.match(/_/g) != null && name.match(/_/g).length == name.length)
    ) {
        return defaultName || 'untitled_asset';
    }
    return name.toLowerCase();
}

function cleanName(name) {
    // Latin to ascii
    const latinToAsciiMapping = {
        'ae': 'ä|æ|ǽ',
        'oe': 'ö|œ',
        'ue': 'ü',
        'Ae': 'Ä',
        'Ue': 'Ü',
        'Oe': 'Ö',
        'A': 'À|Á|Â|Ã|Ä|Å|Ǻ|Ā|Ă|Ą|Ǎ',
        'a': 'à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª',
        'C': 'Ç|Ć|Ĉ|Ċ|Č',
        'c': 'ç|ć|ĉ|ċ|č',
        'D': 'Ð|Ď|Đ',
        'd': 'ð|ď|đ',
        'E': 'È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě',
        'e': 'è|é|ê|ë|ē|ĕ|ė|ę|ě',
        'G': 'Ĝ|Ğ|Ġ|Ģ',
        'g': 'ĝ|ğ|ġ|ģ',
        'H': 'Ĥ|Ħ',
        'h': 'ĥ|ħ',
        'I': 'Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ',
        'i': 'ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı',
        'J': 'Ĵ',
        'j': 'ĵ',
        'K': 'Ķ',
        'k': 'ķ',
        'L': 'Ĺ|Ļ|Ľ|Ŀ|Ł',
        'l': 'ĺ|ļ|ľ|ŀ|ł',
        'N': 'Ñ|Ń|Ņ|Ň',
        'n': 'ñ|ń|ņ|ň|ŉ',
        'O': 'Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ',
        'o': 'ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º',
        'R': 'Ŕ|Ŗ|Ř',
        'r': 'ŕ|ŗ|ř',
        'S': 'Ś|Ŝ|Ş|Š',
        's': 'ś|ŝ|ş|š|ſ',
        'T': 'Ţ|Ť|Ŧ',
        't': 'ţ|ť|ŧ',
        'U': 'Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ',
        'u': 'ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ',
        'Y': 'Ý|Ÿ|Ŷ',
        'y': 'ý|ÿ|ŷ',
        'W': 'Ŵ',
        'w': 'ŵ',
        'Z': 'Ź|Ż|Ž',
        'z': 'ź|ż|ž',
        'AE': 'Æ|Ǽ',
        'ss': 'ß',
        'IJ': 'Ĳ',
        'ij': 'ĳ',
        'OE': 'Œ',
        'f': 'ƒ',
    };
    for (let i in latinToAsciiMapping) {
        let regexp = new RegExp(latinToAsciiMapping[i], 'g');
        name = name.replace(regexp, i);
    }
    // Remove no ascii character
    name = name.replace(/[^\u0020-\u007E]/g, '');
    // Remove unsupport character
    name = name.replace(/[\u0021-\u002B\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007E]/g, '');
    // Unix hidden file
    name = name.replace(/^\./, '');
    // , - . _ to space
    name = name.replace(/[\u002C-\u002E\u005F]/g, '_');
    // Replace space to _
    name = name.trim();
    name = name.replace(/\s+/g, '_');
    name = name.toLowerCase();
    return name;
}

function mscolorToAndroid(mscolor) {
    let color = mscolor.immutableModelObject().hexValue();
    let alpha = mscolor.alpha();
    if (alpha < 1) {
        color = Math.round(alpha * 255).toString(16).padStart(2, '0') + color;
    }
    return ('#' + color).toUpperCase();
}

function colorToAndroid(color) {
    // RRGGBBAA to AARRGGBB
    // 8 digit hex code
    if (/^#[0-9a-f]{8}$/i.test(color)) {
        if (color.substr(7, 2).toLowerCase() === 'ff') {
            color = '#' + color.substr(1, 6);
        } else {
            color = '#' + color.substr(7, 2) + color.substr(1, 6);
        }
    }
    // RGBA to AARRGGBB
    // 4 digit hex code
    else if (/^#[0-9a-f]{4}$/i.test(color)) {
        if (color[4].toLowerCase() === 'f') {
            color = '#' + color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2);
        } else {
            color = '#' + color[4].repeat(2) + color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2);
        }
    }
    else if (/^#[0-9a-f]{6}$/i.test(color)) {
        color = '#' + color.substr(1, 6);
    }
    else if (/^#[0-9a-f]{3}$/i.test(color)) {
        color = '#' + color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2);
    }
    else {
        color = '#000000';
    }
    return color.toUpperCase();
}

module.exports.VECTORDRAWABLE_FOLDERS = VECTORDRAWABLE_FOLDERS;
module.exports.DPIS = DPIS;
module.exports.dpiToScale = dpiToScale;
module.exports.assetName = assetName;
module.exports.cleanName = cleanName;
module.exports.mscolorToAndroid = mscolorToAndroid;
module.exports.colorToAndroid = colorToAndroid;
