const BORDER_SIZE = 10;
const shaderView = document.getElementById("shaderView");
const widthParam = document.getElementById("shadeWidth");
const heightParam = document.getElementById("shadeHeight");
const backgroundColorParam = document.getElementById("backgroundColor");
const logoColorParam = document.getElementById("logoColor");
const loadingBarColorParam = document.getElementById("loadingBarColor");
const logoSizeParam = document.getElementById("logoSize");
const drawLogoParam = document.getElementById("drawLogo");
const drawLoadingBarParam = document.getElementById("drawLoadingBar");
const accessibilityCompatibilityParam = document.getElementById("accessibilityCompatibility");
const autoSizeParam = document.getElementById("autoSize");



let mojangLogoColor = "#ffffff";
let loadingBarColor = "#ffffff";
let backgroundColor = "#EF323D";
let drawLogo = drawLogoParam.checked;
let drawLoadingBar = drawLoadingBarParam.checked;
accessibilityCompatibilityParam.checked = false;
autoSizeParam.checked = false;
let accessibilityCompatibility = accessibilityCompatibilityParam.checked;
let autoSize = autoSizeParam.checked;
let m_pos = {x:0, y:0};
widthParam.value = shaderView.width;
heightParam.value = shaderView.height;
let size = {width: shaderView.width, height: shaderView.height};

function resizeX(e){
    const dx = e.x - m_pos.x;
    m_pos.x = e.x;
    size.width = (parseInt(getComputedStyle(shaderView, '').width) + dx);
    shaderView.width = size.width;
    widthParam.value = size.width;
    if (autoSize) SetSizeElement();
    //addedSize.width += dx;
    draw();
}

function resizeY(e){
    const dy = e.y - m_pos.y;
    m_pos.y = e.y;
    size.height = (parseInt(getComputedStyle(shaderView, '').height) + dy);
    shaderView.height = size.height;
    heightParam.value = size.height;
    if (autoSize) SetSizeElement();
    //addedSize.height += dy;
    draw();
}

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
shaderView.addEventListener("mousedown", function(e){
    if (e.offsetX > BORDER_SIZE) {
        m_pos.x = e.x;
        document.addEventListener("mousemove", resizeX, false);
    }
    if (e.offsetY > BORDER_SIZE) {
        m_pos.y = e.y;
        document.addEventListener("mousemove", resizeY, false);
    }
}, false);


//Canvas resize
document.addEventListener("mouseup", function(){
    //document.removeEventListener("keydown");
    document.removeEventListener("mousemove", resizeX, false);
    document.removeEventListener("mousemove", resizeY, false);
}, false);

widthParam.addEventListener("input", function(){
    size.width = parseInt(widthParam.value);
    shaderView.width = size.width;
    widthParam.value = size.width;
    if (autoSize) SetSizeElement();
    draw();
});
heightParam.addEventListener("input", function(){
    size.height = parseInt(heightParam.value);
    shaderView.height = size.height;
    heightParam.value = size.height;
    draw();
});

//Background Color
backgroundColorParam.addEventListener("input", function(){
    backgroundColor = backgroundColorParam.value;
    shaderView.style.backgroundColor = backgroundColorParam.value;
});

//Compatibility for the black background loading screen
accessibilityCompatibilityParam.addEventListener("input", function() {
    accessibilityCompatibility = accessibilityCompatibilityParam.checked;
});

//Mojang Logo Color
logoColorParam.addEventListener("input", function(){
    mojangLogoColor = logoColorParam.value;
    draw();
});

//Loading Bar Color
loadingBarColorParam.addEventListener("input", function(){
    loadingBarColor = loadingBarColorParam.value;
    draw();
});

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


const ctx = shaderView.getContext("2d");
let mojangLogo = new Image();
let loadingBar = new Image();
let testImg = new Image();
mojangLogo.src = "./assets/img/mojangstudios.png";
loadingBar.src = "./assets/img/loading_bar.png";
testImg.src = "./assets/default/Banner.png";

let logoSize = {width: logoSizeParam.value, height: logoSizeParam.value / 4};
let loadingBarSize = {width: logoSizeParam.value, height: logoSizeParam.value / 24};

/* testImg.onload = function(){
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(testImg, 0, 0, size.width, size.height);
    ctx.globalCompositeOperation = "source-over";
} */


//draw an image onto the canvas
mojangLogo.onload = function(){
    let logoPosition = {x: (size.width / 2 - logoSize.width / 2), y: (size.height / 2 - logoSize.height / 2)};

    ctx.fillStyle = mojangLogoColor;
    ctx.fillRect(logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);

    // set composite mode
    ctx.globalCompositeOperation = "destination-in";
    
    // draw image
    ctx.drawImage(mojangLogo, logoPosition.x, logoPosition.y, logoSize.width, logoSize.height);

    ctx.globalCompositeOperation = "source-over";


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
    let loadingBarPosition = {x: (size.width / 2 - loadingBarSize.width / 2), y: (size.height / 2 - loadingBarSize.height / 2  + 50 + logoSize.height / 1.5)};

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
    ctx.clearRect(0, 0, size.width, size.height);

    if (drawLogo) mojangLogo.onload(); //draw the logo
    if (drawLoadingBar) loadingBar.onload(); //draw the loading bar

    //testImg.onload(); //draw anything that the user added to the canvas
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








    /* document.addEventListener("keydown", function(f){
        console.log(f.key);
        if (f.key == "Control") {
            if (e.offsetX > BORDER_SIZE) {
                m_pos.x = e.x;
                document.addEventListener("mousemove", resizeX, false);
            }
            if (e.offsetY > BORDER_SIZE) {
                m_pos.y = e.y;
                document.addEventListener("mousemove", resizeY, false);
            }
        } else {
            if (e.offsetX > BORDER_SIZE + shaderView.style.height) {
                m_pos.x = e.x;
                document.addEventListener("mousemove", resizeX, false);
            }
            if (e.offsetY > BORDER_SIZE + shaderView.style.height) {
                m_pos.y = e.y;
                document.addEventListener("mousemove", resizeY, false);
            }
        }
    }); */
    // if (e.offsetX > shaderView.style.width - BORDER_SIZE/*  + shaderView.style.height */) {
    //     m_pos.x = e.x;
    //     document.addEventListener("mousemove", resizeX, false);
    // }
    // if (e.offsetY > shaderView.style.height - BORDER_SIZE/*  + shaderView.style.height */) {
    //     m_pos.y = e.y;
    //     document.addEventListener("mousemove", resizeY, false);
    // }
    