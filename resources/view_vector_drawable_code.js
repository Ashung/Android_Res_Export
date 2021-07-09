const svg2vectordrawable = require('svg2vectordrawable');

const highlight = require('highlight.js/lib/core');
const xml = require('highlight.js/lib/languages/xml');
highlight.registerLanguage('xml', xml);

const main = document.getElementById('main');
const labelTint = document.getElementById('label_tint');
const labelXml = document.getElementById('label_xml_declaration');
const checkboxAddXml = document.getElementById('xml_declaration');
const tintColor = document.getElementById('tint_color');
const tintColorAlpha = document.getElementById('tint_color_alpha');
const tintColorSwitch = document.getElementById('tint_color_switch');
const tempSVGElement = document.getElementById('tempSVG');
const tempXMLElement = document.getElementById('tempXML');
const codeElement = document.getElementById("code");
const copyButton = document.getElementById('copy');
const saveButton = document.getElementById('save');
const cancelButton = document.getElementById('cancel');

// disable the context menu (eg. the right click menu) to have a more native feel
// document.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
// });

// call the plugin from the webview
copyButton.addEventListener('click', () => {
    window.postMessage('copyCode', tempXMLElement.value);
});

saveButton.addEventListener('click', () => {
    window.postMessage('saveCode', tempXMLElement.value);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

checkboxAddXml.addEventListener('click', event => {
    // TODO: svg
    window.postMessage('add_xml_declaration', event.target.checked);
});

tintColor.addEventListener('change', event => {
    // TODO: svg
    if (tintColorSwitch.checked) {

    }
    window.postMessage('tint_color', event.target.value.trim());
});

tintColorAlpha.addEventListener('change', event => {
    // TODO: svg
    if (tintColorSwitch.checked) {
        
    }
    window.postMessage('tint_color_alpha', event.target.value);
});

tintColorSwitch.addEventListener('click', event => {
    // TODO: svg
});

main.style.opacity = '0';

window.main = async (svg, json, addXml, tint, alpha) => {
    const avd = await svg2vectordrawable(svg);
    codeElement.innerText = avd;
    tempXMLElement.value = avd;
    highlight.highlightBlock(codeElement);

    // i18n
    if (json) {
        const langs = JSON.parse(json);
        labelXml.textContent = langs.add_xml_declaration;
        labelTint.textContent = langs.tint_color;
        saveButton.textContent = langs.save;
        cancelButton.textContent = langs.cancel;
        copyButton.textContent = langs.copy;
    }

    checkboxAddXml.checked = addXml || false;
    tintColor.value = tint || '000000';
    tintColorAlpha.value = alpha || 100;
    tintColor.blur();
    tintColorAlpha.blur();

    main.style.opacity = '1';
}
