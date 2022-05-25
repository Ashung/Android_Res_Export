const svg2vectordrawable = require('svg2vectordrawable/src/main.browser');

const highlight = require('highlight.js/lib/core');
const xml = require('highlight.js/lib/languages/xml');
highlight.registerLanguage('xml', xml);

const main = document.getElementById('main');
const labelTint = document.getElementById('label_tint');
const labelXml = document.getElementById('label_xml_declaration');
const codeViewAvd = document.getElementById('code-view-avd');
const codeViewSvg = document.getElementById('code-view-svg');
const checkboxAddXml = document.getElementById('xml_declaration');
const tintColorHex = document.getElementById('tint_color');
const tintColorAlpha = document.getElementById('tint_color_alpha');
const tintColorSwitch = document.getElementById('tint_color_switch');
const tempSVGElement = document.getElementById('tempSVG');
const tempXMLElement = document.getElementById('tempXML');
const codeElement = document.getElementById("code");
const copyButton = document.getElementById('copy');
const saveButton = document.getElementById('save');
const cancelButton = document.getElementById('cancel');

let warning = '';

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
copyButton.addEventListener('click', () => {
    if (codeViewAvd.checked) {
        window.postMessage('copyCode', tempXMLElement.value);
    }
    if (codeViewSvg.checked) {
        window.postMessage('copyCode', tempSVGElement.value);
    }
});

saveButton.addEventListener('click', () => {
    window.postMessage('saveCode', tempXMLElement.value);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

checkboxAddXml.addEventListener('click', async (event) => {
    window.postMessage('add_xml_declaration', event.target.checked);
    await convert(tempSVGElement.value);
});

tintColorHex.addEventListener('change', async (event) => {
    window.postMessage('tint_color', event.target.value.trim());
    if (tintColorSwitch.checked) {
        await convert(tempSVGElement.value);
    }
});

tintColorAlpha.addEventListener('change', async (event) => {
    window.postMessage('tint_color_alpha', event.target.value);
    if (tintColorSwitch.checked) {
        await convert(tempSVGElement.value);
    }
});

tintColorSwitch.addEventListener('click', async (event) => {
    window.postMessage('tint', event.target.checked);
    await convert(tempSVGElement.value);
});

document.querySelectorAll('input[name="view"]').forEach(node => {
    node.onclick = (event) => {
        let code = '';
        if (event.target.value === 'avd') {
            code = tempXMLElement.value;
            codeElement.innerHTML = highlight.highlight(code, {language: 'xml'}).value;
            tooLongPathWarning(code, warning);
        } else {
            code = tempSVGElement.value;
            codeElement.innerHTML = highlight.highlight(code, {language: 'xml'}).value;
        }
    };
});

main.style.opacity = '0';

window.main = async (svg, json, addXml, tint, tintColor, tintAlpha) => {

    // i18n
    if (json) {
        const langs = JSON.parse(json);
        labelXml.textContent = langs.add_xml_declaration;
        labelTint.textContent = langs.tint_color;
        saveButton.textContent = langs.save;
        cancelButton.textContent = langs.cancel;
        copyButton.textContent = langs.copy;
        warning = langs.very_long_vector_path;
    }

    tempSVGElement.value = svg;
    checkboxAddXml.checked = addXml || false;
    tintColorHex.value = tintColor || '000000';
    tintColorAlpha.value = tintAlpha || 100;
    tintColorSwitch.checked = tint || false;
    tintColorHex.blur();
    tintColorAlpha.blur();
    
    await convert(svg, warning);

    main.style.opacity = '1';
}

async function convert(svg, warning) {
    const option = {}
    if (checkboxAddXml.checked) option.xmlTag = true;
    if (tintColorSwitch.checked) option.tint = toAndroidColor(tintColorHex.value, tintColorAlpha.value);
    const avd = await svg2vectordrawable(svg, option);
    if (codeViewAvd.checked) {
        tempXMLElement.value = avd;
        codeElement.innerHTML = highlight.highlight(avd, {language: 'xml'}).value;
        tooLongPathWarning(avd, warning);
    }
    if (codeViewSvg.checked) {
        tempSVGElement.value = svg;
        codeElement.innerHTML = highlight.highlight(svg, {language: 'xml'}).value;
    }
}

function toAndroidColor(hex, alpha) {
    if (!/^[a-f0-9]{6}$/i.test(hex)) {
        hex = '000000';
    }
    if (parseInt(alpha) === 100) {
        return '#' + hex;
    } else {
        return '#' + Math.round(parseInt(alpha) * 255 / 100).toString(16).padStart(2, '0') + hex;
    }
}

function tooLongPathWarning(avd, warning) {
    const searchResult = avd.match(/android:pathData="(.*)"/g);
    if (searchResult) {
        const paths = searchResult.map(path => {
            return path.substring(18, path.length - 1);
        });
        const nodes = document.querySelectorAll('.hljs-string');
        nodes.forEach(node => {
            const text = node.textContent.replace(/"/g, '');
            if (paths.includes(text) && text.length >= 800) {
                node.style.backgroundColor = 'rgba(255, 255, 102, 0.6)';
                node.setAttribute('title', warning.replace(/\%/, text.length));
            }
        });
    }
}