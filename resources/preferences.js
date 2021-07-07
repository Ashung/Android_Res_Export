const main = document.getElementById('main');
const okButton = document.getElementById('ok');
const cancelButton = document.getElementById('cancel');
const nameTypeNode = document.getElementById('name-type');
const vectorDrawableFolderNode = document.getElementById('folder');
const webpQualityRangeNode = document.getElementById('webp-quality-range');
const webpQualityValueNode = document.getElementById('webp-quality-value');
const revealInFinderNode = document.getElementById('reveal-in-finder');
const exportDpiNodes = document.querySelectorAll('#export-dpis input');

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
okButton.addEventListener('click', () => {
    const preferences = {
        'export_dpi': [],
        'asset_name_type': nameTypeNode.selectedIndex,
        'vector_drawable_folder': vectorDrawableFolderNode.selectedIndex,
        'reveal_in_finder_after_export': revealInFinderNode.checked,
        'webp_quality': webpQualityRangeNode.value / 100
    };
    exportDpiNodes.forEach(input => {
        if (input.checked) {
            preferences.export_dpi.push(input.value);
        }
    });
    window.postMessage('save', `${JSON.stringify(preferences)}`);
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

main.style.opacity = '0';

exportDpiNodes.forEach(input => {
    input.addEventListener('click', event => {
        let count = Array.from(exportDpiNodes).filter(node => node.checked).length;
        console.log(count);
        if (count === 0) {
            event.target.checked = true;
        }
    });
});

window.main = (json) => {
    const preferences = JSON.parse(json);

    // Init
    preferences.export_dpi.forEach(dpi => {
        let node = document.querySelector(`input[value="${dpi}"]`);
        node.checked = true;
    });
    
    preferences.available_asset_name_type.forEach((type, idx) => {
        let option = document.createElement('option');
        option.textContent = type;
        if (preferences.asset_name_type === idx) {
            option.selected = true;
        }
        nameTypeNode.appendChild(option);
    });

    preferences.available_folders.forEach((folder, idx) => {
        let option = document.createElement('option');
        option.textContent = folder;
        if (preferences.vector_drawable_folder === idx) {
            option.selected = true;
        }
        vectorDrawableFolderNode.appendChild(option);
    });

    const quality = Math.round(preferences.webp_quality * 100);
    webpQualityRangeNode.setAttribute('value', quality);
    webpQualityValueNode.setAttribute('value', quality);
    webpQualityRangeNode.addEventListener('input', () => {
        webpQualityValueNode.setAttribute('value', webpQualityRangeNode.value);
    });

    revealInFinderNode.checked = preferences.reveal_in_finder_after_export;

    // i18n
    document.getElementById('version').textContent = preferences.version;
    document.getElementById('label-export-dpi').textContent = preferences.i18n.export_dpis;
    document.getElementById('label-asset-name-type').textContent = preferences.i18n.asset_name_type;
    document.getElementById('label-vector-drawable-folder').textContent = preferences.i18n.vector_drawable_folder;
    document.getElementById('label-webp-quality').textContent = preferences.i18n.webp_quality;
    document.getElementById('label-others').textContent = preferences.i18n.others;
    document.getElementById('label-reveal-in-finder').textContent = preferences.i18n.reveal_in_finder_after_export;
    okButton.textContent = preferences.i18n.ok;
    cancelButton.textContent = preferences.i18n.cancel;

    main.style.opacity = '1';
}
