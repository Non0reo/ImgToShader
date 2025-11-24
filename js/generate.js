//Code colorisation with highlight.js
hljs.highlightAll();

const shaderGeneratedInfos = document.getElementById("shaderGeneratedInfos");
const previewCode_background = document.getElementById("generatedCode");
const previewCode_logo = document.getElementById("generatedCodeLogo");
const previewCode_bar = document.getElementById("generatedCodeBar");
const downloadPackBtn = document.getElementById("downloadPack");
const warningText = document.getElementById("warningText");
const useDithering = document.getElementById("useDithering");
const betterQuality = document.getElementById("betterQuality");

const genFolderName = document.getElementById("genFolderName");
const genPackVersion = document.getElementById("genPackVersion");
const genCaseCount = document.getElementById("genCaseCount");

// Extended pack_format → version mapping (used by UI)
let lookupVersion = {
    7: "1.17-1.17.1",
    8: "1.18-1.18.2",
    9: "1.19-1.19.2",
    10: "1.19.2-22w41a",
    11: "22w42a-22w44a",
    12: "1.19.3",
    13: "1.19.4",
    14: "23w14a-23w16a",
    15: "1.20-1.20.1",
    16: "23w31a",
    17: "23w32a-1.20.2-pre1",
    18: "1.20.2",
    19: "23w42a",
    20: "23w43a-23w45a",
    21: "23w45a-23w44a",
    22: "1.20.3-1.20.4",
    23: "23w51b-24w03a",
    24: "24w04a-24w05b",
    25: "24w05a-24w05b",
    26: "24w06a-24w07a",
    27: "24w07a-24w09a",
    28: "24w09a-24w10a",
    29: "24w11a",
    30: "24w12a-24w13a",
    31: "24w13a-1.20.5-pre3",
    32: "1.20.5-1.20.6",
    33: "24w18a-now",
    34: "1.21-1.21.1",
    42: "1.21.2-1.21.3",
    46: "1.21.4",
    55: "1.21.5",
    63: "1.21.6",
    64: "1.21.7-1.21.8",
    69: "1.21.9-1.21.10",
};

// These are shared with index.js (changeVersion, etc.)
gameVersion.innerText = lookupVersion[packVersion.value];
let SHADER_VERSION = 1;
let PACK_VERSION = parseInt(packVersion.value);
let PACK_NAME = folderName.value;
let PACK_DESCRIPTION = "Custom Loading Background";

let generatedDataCache = {};
let zones = [];

async function generateCode(previewOnly = false) {
    draw();

    if (imageStack.length == 0 && !previewOnly) { //No Images
        
        const json = {
            imageExists: imageStack.length > 0,
            generalInfos: {
                backgroundColor: {
                    IsAlphaChanged: hexToRGBA(backgroundColor, 1/255).IsAlphaChanged,
                    color: hexToRGBA(backgroundColor, 1/255).color,
                    colorHEX: backgroundColor,
                    draw: drawBackground,
                },
                loadingBarColor: {
                    IsAlphaChanged: hexToRGBA(loadingBarColor, 1/255).IsAlphaChanged,
                    color: hexToRGBA(loadingBarColor, 1/255).color,
                    colorHEX: loadingBarColor,
                    draw: drawLoadingBar,
                },
                mojangLogoColor: {
                    IsAlphaChanged: hexToRGBA(mojangLogoColor, 1/255).IsAlphaChanged,
                    color: hexToRGBA(mojangLogoColor, 1/255).color,
                    colorHEX: mojangLogoColor,
                    draw: drawLogo,
                },
                accessibilityCompatibility: accessibilityCompatibility,
                shader: {
                    version: SHADER_VERSION,
                    json: SHADER_VERSION === 0 ? ['position_color'] : ['rendertype_gui_overlay'],
                }
            }
        };
        generateShaderWithWorker(json);
        return;
    } 

    //Render only the images
    ctx.clearRect(0, 0, shaderView.width, shaderView.height);
    drawAddedPictures();
    const scaleFactor = renderResolution.value / 100;

    const canvasPixels = ctx.getImageData(0, 0, shaderView.width, shaderView.height);
    const canvasPixels32 = new Uint32Array(canvasPixels.data.buffer);
    let palette = [];
    let indexedColors = [];

    switch (compressionMode) {
        case "quant":
            //Image Quaternization Method
            var opts = {
                colors: paletteQuality.value,             /*  desired palette size  */
                dithering: useDithering.checked,         /*  whether to use dithering or not  */
                pixels: canvasPixels32,                  /*  source pixels in RGBA 32 bits  */
                width: shaderView.width, 
                height: shaderView.height
            };
            
            let bestQuality = betterQuality.checked;
            var quant = bestQuality ? new PnnLABQuant(opts) : new PnnQuant(opts);

            /*  reduce image  */
            var img8 = quant.quantizeImage();      /*  Uint32Array  */
            var pal8 = quant.getPalette();         /*  RGBA 32 bits of ArrayBuffer  */
            var indexedPixels = quant.getIndexedPixels();     /*  colors > 256 ? Uint16Array : Uint8Array  */

            let colorPalette = new Uint8ClampedArray(pal8);
            let finalImage = new Uint8ClampedArray(img8.buffer);

            palette = Uint8ClampedArrayToColorArray(colorPalette);
            indexedColors = indexedPixels;

            const imageData = new ImageData(finalImage, shaderView.width, shaderView.height);
            ctx.clearRect(0, 0, size.width, size.height);
            ctx.putImageData(imageData, 0, 0);

            break;

        case "bits":
            //Image Bit Reduction Method
            let finalCanvas = [];
            let colors = [];
            for (let i = 0; i < canvasPixels.data.length; i += 4) {
                finalCanvas.push(
                    Math.round(canvasPixels.data[i] / 255 * (channelQuantity.value - 1)) * (255 / (channelQuantity.value - 1)),
                    Math.round(canvasPixels.data[i + 1] / 255 * (channelQuantity.value - 1)) * (255 / (channelQuantity.value - 1)),
                    Math.round(canvasPixels.data[i + 2] / 255 * (channelQuantity.value - 1)) * (255 / (channelQuantity.value - 1)),
                    Math.round(canvasPixels.data[i + 3] / 255 * (channelQuantity.value - 1)) * (255 / (channelQuantity.value - 1))
                );
            }

            //Get the colors
            const colorArray = Uint8ClampedArrayToColorArray(finalCanvas);

            //Get the color palette from the colorArray and put each color in the colors[] array under the form [r, g, b, a]
            for (let i = 0; i < colorArray.length; i++) {
                let color = colorArray[i];
                let colorFound = false;
                for (let j = 0; j < colors.length; j++) {
                    if (colors[j][0] == color[0] && colors[j][1] == color[1] && colors[j][2] == color[2] && colors[j][3] == color[3]) {
                        colorFound = true;
                        break;
                    }
                }
                if (!colorFound) colors.push(color);
            }
            palette = colors;

            //Get the indexed colors
            for (let i = 0; i < colorArray.length; i++) {
                let color = colorArray[i];
                for (let j = 0; j < colors.length; j++) {
                    if (colors[j][0] == color[0] && colors[j][1] == color[1] && colors[j][2] == color[2] && colors[j][3] == color[3]) {
                        indexedColors.push(j);
                        break;
                    }
                }
            }

            const finalCanvaData = new Uint8ClampedArray(finalCanvas);
            const finalImageData = new ImageData(finalCanvaData, shaderView.width, shaderView.height);
            ctx.clearRect(0, 0, size.width, size.height);
            ctx.putImageData(finalImageData, 0, 0);
            break;
    }

    //Downscale the image
    const image = new Image();
    const smallImage = new Image();
    image.src = shaderView.toDataURL();

    let lowRes_image;
    let highRes_image;

    highRes_image = ctx.getImageData(0, 0, shaderView.width, shaderView.height);

    image.onload = function() {
        ctx.clearRect(0, 0, shaderView.width, shaderView.height);
        ctx.drawImage(image, 0, 0, shaderView.width * scaleFactor, shaderView.height * scaleFactor);
        lowRes_image = ctx.getImageData(0, 0, shaderView.width * scaleFactor, shaderView.height * scaleFactor);
        smallImage.src = imagedata_to_image(lowRes_image).src;

    };

    smallImage.onload = function() {
        
        //Get the palette
        palette = [];
        indexedColors = [];
        let formatedLowResImage = Uint8ClampedArrayToColorArray(lowRes_image.data);
        for(let i = 0; i < formatedLowResImage.length; i++) {
            let color = formatedLowResImage[i];
            let colorFound = false;
            for (let j = 0; j < palette.length; j++) {
                if (palette[j][0] == color[0] && palette[j][1] == color[1] && palette[j][2] == color[2] && palette[j][3] == color[3]) {
                    colorFound = true;
                    break;
                }
            }
            if (!colorFound) palette.push(color);
        }
        console.log(palette);

        for (let i = 0; i < formatedLowResImage.length; i++) {
            let color = formatedLowResImage[i];
            for (let j = 0; j < palette.length; j++) {
                if (palette[j][0] == color[0] && palette[j][1] == color[1] && palette[j][2] == color[2] && palette[j][3] == color[3]) {
                    indexedColors.push(j);
                    break;
                }
            }
        }
        displayColorCount(palette.length);

        ctx.clearRect(0, 0, shaderView.width, shaderView.height);

        drawLogo = drawLogoParam.checked
        drawLoadingBar = drawLoadingBarParam.checked
        if (drawLogo) mojangLogo.onload(); //draw the logo
        if (drawLoadingBar) loadingBar.onload(); //draw the loading bar

        //Draw only on top of transparent pixels
        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(smallImage, 0, 0, shaderView.width , shaderView.height);
        ctx.globalCompositeOperation = "source-over";

        //nomber of non empty pixels in the image
        let nonEmptyPixels = 0;
        for (let i = 0; i < lowRes_image.data.length; i += 4) {
            if (lowRes_image.data[i + 3] != 0) nonEmptyPixels++;
        }
        console.log(`width: ${smallImage.width}, height: ${smallImage.height} ; total: ${smallImage.width * smallImage.height} ; colored pixels: ${nonEmptyPixels}`);

        if(!previewOnly){
            const json = {
                imageData: {
                    data: formatedLowResImage,
                    width: lowRes_image.width,
                    height: lowRes_image.height,
                    length: formatedLowResImage.length,
                },
                palette: palette,
                indexedColors: indexedColors,
                imageExists: imageStack.length > 0,
                generalInfos: {
                    backgroundColor: {
                        IsAlphaChanged: hexToRGBA(backgroundColor, 1/255).IsAlphaChanged,
                        color: hexToRGBA(backgroundColor, 1/255).color,
                        colorHEX: backgroundColor,
                        draw: drawBackground,
                    },
                    loadingBarColor: {
                        IsAlphaChanged: hexToRGBA(loadingBarColor, 1/255).IsAlphaChanged,
                        color: hexToRGBA(loadingBarColor, 1/255).color,
                        colorHEX: loadingBarColor,
                        draw: drawLoadingBar,
                    },
                    mojangLogoColor: {
                        IsAlphaChanged: hexToRGBA(mojangLogoColor, 1/255).IsAlphaChanged,
                        color: hexToRGBA(mojangLogoColor, 1/255).color,
                        colorHEX: mojangLogoColor,
                        draw: drawLogo,
                    },
                    accessibilityCompatibility: accessibilityCompatibility,
                    shader: {
                        renderMethod: renderMethod,
                        version: SHADER_VERSION,
                        json: SHADER_VERSION === 0 ? ['position_color'] : ['rendertype_gui_overlay'],
                    }
                }
            };
            generateShaderWithWorker(json);
        }
    } 
}

function generateShaderWithWorker(json) {
    const shaderGenWorker = new Worker("js/img_shader_algorithm.js");
    const stringMessage = JSON.stringify(json);
    shaderGenWorker.postMessage(stringMessage);

    shaderGenWorker.onmessage = function(e) {
        console.log(e.data);
        generatedDataCache = e.data;
        downloadPackBtn.style.display = "unset";
        downloadPackBtn.style.marginTop = "25px";

        //Remove existing preview boxes content
        previewCode_background.innerHTML = previewCode_logo.innerHTML = previewCode_bar.innerHTML = '';
        warningText.style.display = "none";

        //Display the code in the preview boxes
        const code_background = document.createElement("code");
        code_background.innerHTML = escapeHtml(SHADER_VERSION === 0 ? e.data.positionColorFSH : e.data.guiOverlayFSH);
        code_background.style.whiteSpace = "pre-wrap";
        code_background.style.paddingLeft = "0px";
        previewCode_background.appendChild(code_background);
        hljs.highlightElement(previewCode_background);

        const code_logo = document.createElement("code");
        code_logo.innerHTML = escapeHtml(e.data.positionTexFSH);
        code_logo.style.whiteSpace = "pre-wrap";
        code_logo.style.paddingLeft = "0px";
        previewCode_logo.appendChild(code_logo);
        hljs.highlightElement(previewCode_logo);

        if (SHADER_VERSION === 1) {
            previewCode_bar.style.display = "block";
            const code_bar = document.createElement("code");
            code_bar.innerHTML = escapeHtml(e.data.guiFSH);
            code_bar.style.whiteSpace = "pre-wrap";
            code_bar.style.paddingLeft = "0px";
            previewCode_bar.appendChild(code_bar);
            hljs.highlightElement(previewCode_bar);
        } else previewCode_bar.style.display = "none";

        shaderGeneratedInfos.style.display = "block";
        genCaseCount.innerText = e.data.genInfos.imageExists ? `Case count: ${e.data.genInfos.caseCount}` : `Case count: 0 (no image)`;
        genPackVersion.innerText = `Pack version: ${PACK_VERSION}`;
        genFolderName.innerText = `Folder name: ${PACK_NAME}`;

        zones = e.data.genInfos.zones;
        //debugRender();
    }
}

function debugRender() {
    if(zones) {
        for (let i = 0; i < zones.length; i++) {
            const zone = zones[i];
            ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1.0)`;
            const scale = renderResolution.value / 100;
            ctx.fillRect(zone.x / scale, zone.y / scale, zone.width / scale, zone.height / scale);
        }
    }
}

function imagedata_to_image(imagedata) {
    let canvas = document.createElement('canvas');
    let ctx2 = canvas.getContext('2d');
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx2.putImageData(imagedata, 0, 0);

    let image = new Image();
    image.src = canvas.toDataURL();
    return image;
}

function hexToRGBA(variable, devideBy) {
    let hexColor = variable.replace("#", "");
    let division = 1;
    if (devideBy != undefined) division = devideBy;
    let color = {r: (parseInt(hexColor.substring(0, 2), 16) / 255 / division).toString(), 
            g: (parseInt(hexColor.substring(2, 4), 16) / 255 / division).toString(), 
            b: (parseInt(hexColor.substring(4, 6), 16) / 255 / division).toString(),
            a: (hexColor.length == 8) ? (parseInt(hexColor.substring(6, 8), 16) / 255 / division).toString() : "1"
    };

    //Making the numbers Floats
    if (color.r == 0 || color.r == 1) color.r += ".0";
    if (color.g == 0 || color.g == 1) color.g += ".0";
    if (color.b == 0 || color.b == 1) color.b += ".0";
    if (color.a == 0 || color.a == 1) color.a += ".0";

    return {color: color, 
            IsAlphaChanged: hexColor.length == 8 ? true : false
        };
}

function escapeHtml(str){
    return new Option(str).innerHTML;
}

function generateNumberFromSeed(seed) {
    let cripto = new Crypto();
    let number = cripto.md5(seed);
    return parseInt(number.substring(0, 8), 16);
}

async function DownlodPreparation() {
    if(generatedDataCache == {}) await generateCode();
    await DownloadPack(generatedDataCache);
}

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0);
    }
}

const DownloadPack = (shaderData) => {

    const packMcmeta = 
`{
    "pack": {
        "pack_format": ${PACK_VERSION},
        "description": "${PACK_DESCRIPTION}",
        "supported_formats": [7, 69]
    }
}`;

    zip = new JSZip();
    zip.file("pack.mcmeta", packMcmeta.toString());
    let assets = zip.folder("assets");
    let minecraft = assets.folder("minecraft");
    let shaders = minecraft.folder("shaders");
    let core = shaders.folder("core");
    let include = shaders.folder("include");

    if(SHADER_VERSION === 0) {
        if(shaderData.positionColorFSH) core.file("position_color.fsh", shaderData.positionColorFSH)
        if(shaderData.positionTexFSH) core.file("position_tex.fsh", shaderData.positionTexFSH);
        if(shaderData.shaderJson) shaderData.shaderJson.forEach(element => {
            core.file(element[1] + ".json", element[0]);
        });
        //exactly the same as the guiOverlay shader (using the same file, just renamed)
        if(shaderData.guiOverlayVSH) core.file("position_color.vsh", shaderData.guiOverlayVSH);

        if(shaderData.utilsGLSL) include.file("utils.glsl", shaderData.utilsGLSL);
        if(shaderData.imagesAlgo) include.file("image/canvas1.glsl", shaderData.imagesAlgo);

    } else {
        if(shaderData.guiOverlayFSH) core.file("rendertype_gui_overlay.fsh", shaderData.guiOverlayFSH);
        if(shaderData.guiOverlayVSH) core.file("rendertype_gui_overlay.vsh", shaderData.guiOverlayVSH);
        if(shaderData.guiFSH) core.file("rendertype_gui.fsh", shaderData.guiFSH);
        if(shaderData.positionTexFSH) core.file("position_tex.fsh", shaderData.positionTexFSH);
        if(shaderData.shaderJson) shaderData.shaderJson.forEach(element => {
            core.file(element[1] + ".json", element[0]);
        });

        if(shaderData.utilsGLSL) include.file("utils.glsl", shaderData.utilsGLSL);
        if(shaderData.imagesAlgo) include.file("image/canvas1.glsl", shaderData.imagesAlgo);
    }

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        download(content, `${PACK_NAME}`, "application/zip");
        window.focus();   
    });

}

function Uint8ClampedArrayToColorArray(array){
    let colorArray = [];
    for (let i = 0; i < array.length; i += 4) {
        colorArray.push([array[i], array[i + 1], array[i + 2], array[i + 3]]);
    }
    return colorArray;
}
