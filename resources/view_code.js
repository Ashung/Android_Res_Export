import highlight from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
highlight.registerLanguage('xml', xml);

const tempXMLElement = document.getElementById('tempXML');
const codeElement = document.getElementById("code");
const copyButton = document.getElementById('copy');
const saveButton = document.getElementById('save');
const cancelButton = document.getElementById('cancel');

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
copyButton.addEventListener('click', () => {
    window.postMessage('copy', tempXMLElement.value);
});

saveButton.addEventListener('click', () => {
    window.postMessage('save', tempXMLElement.value);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

window.main = (code) => {
    codeElement.innerText = code;
    tempXMLElement.value = code;
    highlight.highlightBlock(codeElement);
}
