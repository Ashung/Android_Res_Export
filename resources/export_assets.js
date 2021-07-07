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
exportButton.addEventListener('click', () => {
    const assetIds = [];
    const checkboxs = document.querySelectorAll('input[type="checkbox"]');
    checkboxs.forEach(checkbox => {
        if (checkbox.checked) {
            assetIds.push(checkbox.value);
        }
    });
    window.postMessage('export', assetIds);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

selectButton.addEventListener('click', () => {
    console.log(selectedCount)
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
        checkbox.value = asset.id;
        checkbox.checked = true;
        name.appendChild(text);
        item.appendChild(checkbox);
        item.appendChild(img);
        item.appendChild(name);
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
