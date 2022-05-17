const svg2vectordrawable = require('svg2vectordrawable/src/main.browser');

const main = document.getElementById('main');
const preview = document.getElementById('preview');
const selectButton = document.getElementById('select');
const exportButton = document.getElementById('export');
const cancelButton = document.getElementById('cancel');
let allCount;
let selectedCount = 0;

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
exportButton.addEventListener('click', async () => {
    const assets = [];
    const checkboxs = document.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < checkboxs.length; i++) {
        if (checkboxs[i].checked) {
            const svg = checkboxs[i].parentNode.querySelector('input[type="hidden"]').value;
            const name = checkboxs[i].parentNode.querySelector('.name').textContent;
            const xml = await svg2vectordrawable(svg);
            assets.push({ name, xml });
        }
    }
    window.postMessage('export', assets);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

selectButton.addEventListener('click', () => {
    const checkboxs = document.querySelectorAll('input[type="checkbox"]');
    if (selectedCount !== allCount) {
        checkboxs.forEach(checkbox => checkbox.checked = true);
        selectedCount = allCount;
    } else {
        checkboxs.forEach(checkbox => checkbox.checked = false);
        selectedCount = 0;
    }
});

main.style.opacity = '0';

window.main = (assetsJson, langsJson) => {
    const assets = JSON.parse(assetsJson);
    allCount = assets.length;
    selectedCount = assets.length;
    assets.forEach(asset => {
        const item = document.createElement('label');
        item.className = 'item';
        const img = document.createElement('img');
        img.srcset = `data:image/png;base64,${asset.data}, data:image/png;base64,${asset.data} 2x`;
        const name = document.createElement('div');
        name.className = 'name';
        const text = document.createElement('span');
        text.textContent = asset.name;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        const hideSvg = document.createElement('input');
        hideSvg.type = 'hidden';
        hideSvg.value = decodeURIComponent(asset.svg);
        name.appendChild(text);
        item.appendChild(checkbox);
        item.appendChild(img);
        item.appendChild(name);
        item.appendChild(hideSvg);
        preview.appendChild(item);
        checkbox.addEventListener('input', (event) => {
            if (event.target.checked === false) {
                selectedCount --;
            } else {
                selectedCount ++;
            }
        })
    });

    // i18n
    const langs = JSON.parse(langsJson);
    selectButton.textContent = langs.select_all;
    exportButton.textContent = langs.export;
    cancelButton.textContent = langs.cancel;

    main.style.opacity = '1';
}

window.exportSelection = async (assetsJson) => {
    const assets = JSON.parse(assetsJson);
    const result = [];
    for (let i = 0; i < assets.length; i++) {
        const name = assets[i].name;
        const svg = decodeURIComponent(assets[i].svg);
        const xml = await svg2vectordrawable(svg);
        result.push({ name, xml });
    }
    window.postMessage('export', result);
}