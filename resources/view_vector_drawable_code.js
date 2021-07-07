const svg2vectordrawable = require('svg2vectordrawable');

const highlight = require('highlight.js/lib/core');
const xml = require('highlight.js/lib/languages/xml');
highlight.registerLanguage('xml', xml);

const main = document.getElementById('main');
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

main.style.opacity = '0';

window.main = async (svg, json) => {
    const avd = await svg2vectordrawable(svg);
    codeElement.innerText = avd;
    tempXMLElement.value = avd;
    highlight.highlightBlock(codeElement);

    // i18n
    const langs = JSON.parse(json);
    saveButton.textContent = langs.save;
    cancelButton.textContent = langs.cancel;
    copyButton.textContent = langs.copy;

    main.style.opacity = '1';
}

// call the webview from the plugin
// window.svg2vector = (svg) => {
//     tempSVGElement.value = svg;
//     svg2vectordrawable(svg).then(xml => {
//         codeElement.innerText = xml;
//         tempXMLElement.value = xml;
//         highlight.highlightBlock(codeElement);
//     });
    
    
//     // TODO: disable copy



//     // if (pluginMessage.error) {
//     //     codeBlock.innerText = pluginMessage.data;
//     //     codeBlock.setAttribute('data-file-name', '');
//     //     copyButton.setAttribute('disabled', 'disabled');
//     //     exportButton.setAttribute('disabled', 'disabled');
//     // } else {
//     //     const textDecoder = new TextDecoder();
//     //     const svgCode = textDecoder.decode(pluginMessage.data);
//     //     const xmlCode = await svg2vectordrawable(svgCode);
//     //     codeBlock.innerText = xmlCode;
//     //     codeBlock.setAttribute('data-file-name', pluginMessage.name);
//     //     copyButton.removeAttribute('disabled');
//     //     exportButton.removeAttribute('disabled');
//     // }
//     // hljs.highlightBlock(codeBlock);
// };