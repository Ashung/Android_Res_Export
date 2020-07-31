
import svg2vectordrawable from '../modules/svg-to-vectordrawable';

import highlight from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
highlight.registerLanguage('xml', xml);

const tempSVGElement = document.getElementById('tempSVG');
const tempXMLElement = document.getElementById('tempXML');
const codeElement = document.getElementById("code");
const copyButton = document.getElementById('copy');

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
copyButton.addEventListener('click', () => {
    let xml = tempXMLElement.value;
    window.postMessage('copyCode', xml);
});

// call the webview from the plugin
window.svg2vector = (svg) => {
    tempSVGElement.value = svg;
    svg2vectordrawable(svg).then(xml => {
        codeElement.innerText = xml;
        tempXMLElement.value = xml;
        highlight.highlightBlock(codeElement);
    });
    
    
    // TODO: disable copy



    // if (pluginMessage.error) {
    //     codeBlock.innerText = pluginMessage.data;
    //     codeBlock.setAttribute('data-file-name', '');
    //     copyButton.setAttribute('disabled', 'disabled');
    //     exportButton.setAttribute('disabled', 'disabled');
    // } else {
    //     const textDecoder = new TextDecoder();
    //     const svgCode = textDecoder.decode(pluginMessage.data);
    //     const xmlCode = await svg2vectordrawable(svgCode);
    //     codeBlock.innerText = xmlCode;
    //     codeBlock.setAttribute('data-file-name', pluginMessage.name);
    //     copyButton.removeAttribute('disabled');
    //     exportButton.removeAttribute('disabled');
    // }
    // hljs.highlightBlock(codeBlock);
};