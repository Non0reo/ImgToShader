const BORDER_SIZE = 10;
const shaderView = document.getElementById("shaderView");
const version1Param = document.getElementById("shaderVersion1");
const version2Param = document.getElementById("shaderVersion2");
const widthParam = document.getElementById("shaderWidth");
const heightParam = document.getElementById("shaderHeight");
const packVersion = document.getElementById("packVersion");
const gameVersion = document.getElementById("gameVersion");
const folderName = document.getElementById("folderName");

const logoSizeParam = document.getElementById("logoSize");
const drawLogoParam = document.getElementById("drawLogo");
const drawLoadingBarParam = document.getElementById("drawLoadingBar");
const drawBackgroundParam = document.getElementById("drawBackground");
const accessibilityCompatibilityParam = document.getElementById("accessibilityCompatibility");
const autoSizeParam = document.getElementById("autoSize");
const linkCanvasSizeParam = document.getElementById("linkCanvasSize");



let mojangLogoColor = "#FFFFFF";
let loadingBarColor = "#FFFFFF";
let backgroundColor = "#EF323D";
let drawLogo = drawLogoParam.checked;
let drawLoadingBar = drawLoadingBarParam.checked;
let drawBackground = drawBackgroundParam.checked;
let linkCanvasSize = linkCanvasSizeParam.checked;

accessibilityCompatibilityParam.checked = false;
autoSizeParam.checked = true;
heightParam.disabled = linkCanvasSize;

let accessibilityCompatibility = accessibilityCompatibilityParam.checked;
let autoSize = autoSizeParam.checked;

widthParam.value = shaderView.width;
heightParam.value = shaderView.height;
let size = {width: shaderView.width, height: shaderView.height};
let m_pos = {x:0, y:0};

let fileModified = false;

const backgroundColorOptions = {
    el: '.color-picker',
    theme: 'nano',
    default: '#EF323D',

    swatches: [
        'rgba(239, 50, 61, 1)',
        'rgba(0, 0, 0, 1)'
    ],

    components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
            input: true,
            clear: true,
            save: true
        }
    }
};

const logoColorOptions = {
    el: '.color-picker',
    theme: 'nano',
    default: '#ffffff',

    swatches: [
        'rgba(239, 50, 61, 1)',
        'rgba(255, 255, 255, 1)'
    ],

    components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
            input: true,
            clear: true,
            save: true
        }
    }
};

const backgroundColorParam = Pickr.create(backgroundColorOptions);
const logoColorParam = Pickr.create(logoColorOptions);
const loadingBarColorParam = Pickr.create(logoColorOptions);


// document.addEventListener("keydown", function (f) {
//     shaderView.addEventListener("mousedown", function(e){
//         if (f.key == "Control") {
//             if (e.offsetX > BORDER_SIZE) {
//                 m_pos.x = e.x;
//                 document.addEventListener("mousemove", resizeX, false);
//             }
//             if (e.offsetY > BORDER_SIZE) {
//                 m_pos.y = e.y;
//                 document.addEventListener("mousemove", resizeY, false);
//             }
//         }
//     }, false);
// });


//Canvas resize
document.addEventListener("mousedown", function (e) {
    if (e.target === shaderView) {
        const startX = e.pageX - shaderView.offsetLeft;
        const startY = e.pageY - shaderView.offsetTop;
        const startWidth = shaderView.width;
        const startHeight = shaderView.height;
        redrawProcess()

        document.addEventListener("mousemove", resizeCanvas, false);
        document.addEventListener("mouseup", stopResize, false);

        function resizeCanvas(e) {
            widthParam.value = shaderView.width = size.width = Math.abs(startWidth + e.pageX - shaderView.offsetLeft - startX);
            if(!linkCanvasSize) heightParam.value = shaderView.height = Math.abs(size.height = startHeight + e.pageY - shaderView.offsetTop - startY);
            else heightParam.value = shaderView.height = size.height = Math.round(shaderView.width / (16 / 9));
            displayWaningText();
            redrawProcess();
        }

        function stopResize() {
            document.removeEventListener("mousemove", resizeCanvas, false);
            document.removeEventListener("mouseup", stopResize, false);
            redrawProcess();
        }

        redrawProcess();
    }
}, false);

function redrawProcess() {
    if (autoSize) SetSizeElement();
    draw();
    ctx.imageSmoothingEnabled = false;
}

//PARAMETERS

function changeVersion(version) {
    SHADER_VERSION = version;
    switch (version) {
        case 0:
            version1Param.className = "versionBtn selected";
            version2Param.className = "versionBtn";
            PACK_VERSION = packVersion.value = 13;
            gameVersion.innerText = lookupVersion[packVersion.value];
            break;
        case 1:
            version2Param.className = "versionBtn selected";
            version1Param.className = "versionBtn";
            PACK_VERSION = packVersion.value = 18;
            gameVersion.innerText = lookupVersion[packVersion.value];
            break;
        default:
            break;
    }
}

widthParam.addEventListener("input", function(){
    size.width = Math.abs(parseInt(widthParam.value));
    shaderView.width = size.width;
    widthParam.value = size.width;
    redrawProcess();
});
heightParam.addEventListener("input", function(){
    size.height = Math.abs(parseInt(heightParam.value));
    shaderView.height = size.height;
    heightParam.value = size.height;
    redrawProcess();
});

linkCanvasSizeParam.addEventListener("input", function(){
    linkCanvasSize = linkCanvasSizeParam.checked;
    if (linkCanvasSize) {
        heightParam.disabled = true;
        heightParam.value = shaderView.height = size.height = Math.round(widthParam.value / (16 / 9));
    } else {
        heightParam.disabled = false;
    }
    draw();
});

//Background Color
backgroundColorParam.on('change', (color, source, instance) => {
    backgroundColor = color.toHEXA().toString();
    if (drawBackground) shaderView.style.backgroundColor = color.toHEXA().toString();
    backgroundColorParam.setHSVA(color.h, color.s, color.v, color.a);
    draw();
})

//Compatibility for the black background loading screen
accessibilityCompatibilityParam.addEventListener("input", function() {
    accessibilityCompatibility = accessibilityCompatibilityParam.checked;
});

//Mojang Logo Color
logoColorParam.on('change', (color, source, instance) => {
    mojangLogoColor = color.toHEXA().toString();
    draw();
    logoColorParam.setHSVA(color.h, color.s, color.v, color.a);
})

//Loading Bar Color
loadingBarColorParam.on('change', (color, source, instance) => {
    loadingBarColor = color.toHEXA().toString();
    draw();
    loadingBarColorParam.setHSVA(color.h, color.s, color.v, color.a);
})

//Element size on the canvas
logoSizeParam.addEventListener("input", function(){
    SetSizeElement();
    draw();
});

autoSizeParam.addEventListener("input", function(){
    autoSize = autoSizeParam.checked;
    SetSizeElement();
    draw();
});

drawBackgroundParam.addEventListener("input", function(){
    drawBackground = drawBackgroundParam.checked;
    if (drawBackground) shaderView.style.backgroundColor = backgroundColor;
    else shaderView.style.backgroundColor = "transparent";
    draw();
});

//Draw the logo or not
drawLogoParam.addEventListener("input", function(){
    drawLogo = drawLogoParam.checked;
    draw();
});

//Draw the loading bar or not
drawLoadingBarParam.addEventListener("input", function(){
    drawLoadingBar = drawLoadingBarParam.checked;
    draw();
});

packVersion.addEventListener("input", function(){
    PACK_VERSION = parseInt(packVersion.value);
    gameVersion.innerText = lookupVersion[packVersion.value];
    displayWaningText();
});

folderName.addEventListener("input", function(){
    PACK_NAME = folderName.value;
    displayWaningText();
});


let ctx = shaderView.getContext("2d", { willReadFrequently: true });
ctx.imageSmoothingEnabled = false;
let mojangLogo = new Image();
let loadingBar = new Image();
let testImg = new Image();
mojangLogo.src = "./assets/img/mojangstudios.png";
//mojangLogo.src = "./assets/img/mojangstudios_inverted.png";
loadingBar.src = "./assets/img/loading_bar.png";
testImg.src = "./assets/default/Banner.png";

let logoSize = {width: logoSizeParam.value, height: logoSizeParam.value / 4};
let loadingBarSize = {width: logoSizeParam.value, height: logoSizeParam.value / 24};

//Set the siee of the logo and bar if auto size is checked
if(autoSize) SetSizeElement();

//draw an image onto the canvas
mojangLogo.onload = function(){
    let logoPosition = {x: (size.width / 2 - logoSize.width / 2), y: (size.height / 2 - logoSize.height / 2)};
    
    // ctx.globalCompositeOperation = "destination-out";
    // ctx.fillStyle = backgroundColor;
    // ctx.fillRect(logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);
    
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);

    ctx.globalCompositeOperation = "lighten";
    ctx.fillStyle = mojangLogoColor;
    ctx.fillRect(logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);
    ctx.globalCompositeOperation = "source-over";

    ctx.globalCompositeOperation = "destination-in";

    // set composite mode

    // draw image
    ctx.drawImage(mojangLogo, logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);

    ctx.globalCompositeOperation = "source-over";




    //ctx.globalCompositeOperation = "source-over";

    


    //let diference = {width: (shaderView.width - size.width) / 2, height: (shaderView.height - size.height) / 2};
    //return { x: a - c * 0.5, y: b - d * 0.5, w: c, h: d };
    //
    // ctx.moveTo(size.width / 2, 0);
    // ctx.lineTo(size.width / 2, size.height);
    // ctx.stroke();
    // ctx.moveTo(0, size.height / 2);
    // ctx.lineTo(size.width, size.height / 2);
    // ctx.stroke();
    //ctx.drawImage(mojangLogo, logoPosition.x + diference.width, logoPosition.y + diference.height, logoSizeWidth + diference.width / 4, logoSizeHeight + diference.height / 4);
    
    //ctx.drawImage(mojangLogo, size.width / 2 - logoSizeWidth / 2, size.height / 2 - logoSizeHeight / 2, logoSizeWidth + diference.width, logoSizeHeight + diference.height / 2);
    //ctx.drawImage(mojangLogo, (size.width - logoSizeWidth) / 2 - addedSize.width / 2, (size.height - logoSizeHeight) / 2 + addedSize.height / 2, logoSizeWidth - addedSize.width, logoSizeHeight - addedSize.height);
    
    //ctx.drawImage(mojangLogo, size.width / 2 - logoSizeWidth / 2 - diference.width, size.height / 2 - logoSizeHeight / 2 - diference.height, logoSizeWidth - diference.width, logoSizeHeight - diference.height);
}


loadingBar.onload = function(){
    let loadingBarPosition = {x: (size.width / 2 - loadingBarSize.width / 2), y: (size.height / 2 - loadingBarSize.height / 2 /*  + 50  */+ logoSize.height / 0.75)};

    ctx.fillStyle = loadingBarColor;
    ctx.fillRect(loadingBarPosition.x, loadingBarPosition.y, loadingBarSize.width, loadingBarSize.height);

    // set composite mode
    ctx.globalCompositeOperation = "destination-out";
    
    // draw image
    ctx.drawImage(loadingBar, loadingBarPosition.x, loadingBarPosition.y, loadingBarSize.width, loadingBarSize.height);

    ctx.globalCompositeOperation = "source-over";
}

//Draw all element on the canvas
function draw() {
    //ctx.globalCompositeOperation = "lighten";
    ctx.clearRect(0, 0, size.width, size.height);

    if (drawLogo) mojangLogo.onload(); //draw the logo
    if (drawLoadingBar) loadingBar.onload(); //draw the loading bar

    drawAddedPictures(); //draw anything that the user added to the canvas
    displayWaningText()
    if (imageStack.length > 0 && selected) assignObjectToList(selected); //update the setting box with the selected element

    //testImg.onload(); //draw test picture
}

//Set the size of the sizable elements on the canvas
function SetSizeElement() {
    if (autoSize) { // If auto size is checked
        logoSize = {width: size.width / 2, height: size.width / 8};
        loadingBarSize = {width: size.width / 2, height: size.width / 48};
        return;
    } 

    // Default Config
    logoSize = {width: logoSizeParam.value, height: logoSizeParam.value / 4};
    loadingBarSize = {width: logoSizeParam.value, height: logoSizeParam.value / 24};
}

function changeUserScrollLevel(pos){
    switch (pos) {
        case "top":
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            break;
    
        default:
            break;
    }
}

function displayWaningText(){
    if (fileModified && downloadPack.style.display == "unset") {
        warningText.style.display = "unset";
        downloadPackBtn.style.marginTop = "10px";
    }
    fileModified = true;
    
}

window.onload = function(){
    assignObjectToList("empty");
}