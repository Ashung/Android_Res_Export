const ninePatchPreview = document.getElementById('nine_patch_preview');
const previewBackground = document.getElementById('preview');
const stretchWidth = document.getElementById('stretch_width');
const stretchHeight = document.getElementById('stretch_height');
const showContent = document.getElementById('show_content');
const bgToggleLight = document.getElementById('bg_toggle_light');
const bgToggleDark = document.getElementById('bg_toggle_dark');
const bgToggleWhite = document.getElementById('bg_toggle_white');
const labelStretchWidth = document.getElementById('label_stretch_width');
const labelStretchHeight = document.getElementById('label_stretch_height');
const labelStretchContext = document.getElementById('label_stretch_content');
const cancelButton = document.getElementById('cancel');
const exportButton = document.getElementById('export');
let originalWidth = ninePatchPreview.offsetWidth;
let originalHeight = ninePatchPreview.offsetHeight;

bgToggleLight.onclick = function() {
    previewBackground.setAttribute("class", "bg_light");
}

bgToggleDark.onclick = function() {
    previewBackground.setAttribute("class", "bg_dark");
}

bgToggleWhite.onclick = function() {
    previewBackground.setAttribute("class", "bg_white");
}

function redrawNinePatch(base64) {
    var ninePatchWidth = originalWidth + originalWidth * stretchWidth.value/50,
        ninePatchHeight = originalHeight + originalHeight * stretchHeight.value/50;
    ninePatchPreview.style.transition = ".2s"; //width .2s, height
    stretchHeight.style.backgroundSize = stretchHeight.value + "% 100%";
    stretchWidth.style.backgroundSize = stretchWidth.value + "% 100%";
    drawNinePatch(base64, ninePatchWidth, ninePatchHeight, showContent.checked);
}

function drawNinePatch(base64, width, height, showContent) {

    var scale = 2;
    var _canvas = document.createElement("canvas");
    var _ctx = _canvas.getContext("2d");
    var img = new Image();
    img.onload = function() {
        _canvas.width = img.width;
        _canvas.height = img.height;
        _ctx.drawImage(img, 0, 0);

        // Patch data
        var horizontalData = _ctx.getImageData(0, 0, img.width - 1 * scale, 1).data;
        var verticalData = _ctx.getImageData(0, 0, 1, img.height - 1 * scale).data;
        var patchTop = [[scale,0,0]];
        var patchLeft = [[scale,0,0]];
        for (var i = 1; i < horizontalData.length/4; i ++) {
            var a = horizontalData[i*4+3],
                _a = horizontalData[(i-1)*4+3];
            if (a != _a) {
                patchTop[patchTop.length - 1][1] = i - patchTop[patchTop.length - 1][0];
                if (a == 255) {
                    patchTop[patchTop.length - 1][2] = 0;
                } else {
                    patchTop[patchTop.length - 1][2] = 1;
                }
                patchTop.push([i, horizontalData.length/4-i, 0])
            }
            if (i == horizontalData.length/4 - 1 && a == 255) {
                patchTop[patchTop.length - 1][2] = 1;
            }
        }
        for (var i = 1; i < verticalData.length/4; i ++) {
            var a = verticalData[i*4+3],
                _a = verticalData[(i-1)*4+3];
            if (a != _a) {
                patchLeft[patchLeft.length - 1][1] = i - patchLeft[patchLeft.length - 1][0];
                if (a == 255) {
                    patchLeft[patchLeft.length - 1][2] = 0;
                } else {
                    patchLeft[patchLeft.length - 1][2] = 1;
                }
                patchLeft.push([i, verticalData.length/4-i, 0])
            }
            if (i == verticalData.length/4 - 1 && a == 255) {
                patchLeft[patchLeft.length - 1][2] = 1;
            }
        }

        // console.log(JSON.stringify(patchTop));
        // console.log(JSON.stringify(patchLeft));

        // Get padding
        var paddingTop = 0,
            paddingBottom = 0,
            paddingLeft = 0,
            paddingRight = 0;
        var paddingTopBottonData = _ctx.getImageData(img.width-1, 1*scale, 1, img.height-2*scale).data;
        var paddingLeftRightData = _ctx.getImageData(1*scale, img.height-1, img.width-2*scale, 1).data;
        for (var i = 0; i < paddingTopBottonData.length/4; i ++) {
            if (
                paddingTopBottonData[i*4] == 0 &&
                paddingTopBottonData[i*4+1] == 0 &&
                paddingTopBottonData[i*4+2] == 0 &&
                paddingTopBottonData[i*4+3] == 255
            ) {
                paddingTop = i;
                break;
            }
        }
        for (var i = paddingTopBottonData.length/4; i > -1; i --) {
            if (
                paddingTopBottonData[i*4] == 0 &&
                paddingTopBottonData[i*4+1] == 0 &&
                paddingTopBottonData[i*4+2] == 0 &&
                paddingTopBottonData[i*4+3] == 255
            ) {
                paddingBottom = paddingTopBottonData.length/4-i-1;
                break;
            }
        }
        for (var i = 0; i < paddingLeftRightData.length/4; i ++) {
            if (
                paddingLeftRightData[i*4] == 0 &&
                paddingLeftRightData[i*4+1] == 0 &&
                paddingLeftRightData[i*4+2] == 0 &&
                paddingLeftRightData[i*4+3] == 255
            ) {
                paddingLeft = i;
                break;
            }
        }
        for (var i = paddingLeftRightData.length/4; i > -1; i --) {
            if (
                paddingLeftRightData[i*4] == 0 &&
                paddingLeftRightData[i*4+1] == 0 &&
                paddingLeftRightData[i*4+2] == 0 &&
                paddingLeftRightData[i*4+3] == 255
            ) {
                paddingRight = paddingLeftRightData.length/4-i-1;
                break;
            }
        }

        // console.log(paddingTop+","+paddingRight+","+paddingBottom+","+paddingLeft);

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.imageSmoothingEnabled = false;

        // Draw start
        var dx = 0,
            dy = 0,
            dw = 0,
            dh = 0;
        for (var i = 0; i < patchLeft.length; i++) {
            dy += dh;
            if (patchLeft[i][2] == 0) {
                dh = patchLeft[i][1];
            } else {
                dh = getLength(patchLeft, height);
            }
            for (var j = 0; j < patchTop.length; j++) {
                var sx = patchTop[j][0],
                    sy = patchLeft[i][0],
                    sw = patchTop[j][1],
                    sh = patchLeft[i][1];
                dx += dw;
                if (patchTop[j][2] == 0) {
                    dw = patchTop[j][1];
                } else {
                    dw = getLength(patchTop, width);
                }
                ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
                // console.log(sx+','+sy+','+sw+','+sh+','+dx+','+dy+','+dw+','+dh);
            }
            dx = 0;
            dw = 0;
        }

        // Draw padding
        if (showContent) {
            ctx.fillStyle = "rgba(233, 32, 99, 0.3)";
            ctx.fillRect(
                paddingLeft,
                paddingTop,
                width-paddingLeft-paddingRight,
                height-paddingTop-paddingBottom
            );
        }

        ninePatchPreview.style.width = (width / scale) + "px";
        ninePatchPreview.style.height = (height / scale) + "px";
        ninePatchPreview.style.marginLeft = (width / scale) * -0.5 + "px";
        ninePatchPreview.style.marginTop = (height / scale) * -0.5 + "px";
        ninePatchPreview.style.background = "url(" + canvas.toDataURL("image/png") + ") no-repeat";
        ninePatchPreview.style.backgroundSize = "cover";

    }

    img.src = "data:image/png;base64," + base64;
}

function getLength(patchData, maxLength) {
    var fixWidth = 0,
        count = 0;
    for (var i = 0; i < patchData.length; i++) {
        if (patchData[i][2] == 0) {
            fixWidth += patchData[i][1];
        } else {
            count ++;
        }
    }
    return Math.round((maxLength - fixWidth) / count);
}

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// call the plugin from the webview
exportButton.addEventListener('click', () => {
    window.postMessage('export');
});

cancelButton.addEventListener('click', () => {
    window.postMessage('cancel');
});

window.main = (base64, ninePatchWidth, ninePatchHeight) => {

    originalWidth = ninePatchWidth;
    originalHeight = ninePatchHeight;

    stretchWidth.oninput = function() {
        redrawNinePatch(base64);
    }

    stretchHeight.oninput = function() {
        redrawNinePatch(base64);
    }

    showContent.onchange = function() {
        redrawNinePatch(base64);
    }

    drawNinePatch(base64, ninePatchWidth, ninePatchHeight, false);
}
