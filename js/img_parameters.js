const elementPosXParam = document.getElementById('elementPosX');
const elementPosYParam = document.getElementById('elementPosY');
const elementWidthParam = document.getElementById('elementWidth');
const elementHeightParam = document.getElementById('elementHeight');
const elementRotationParam = document.getElementById('elementRotation');
const normalizeCoordsParam = document.getElementById('normalizeCoords');
const linkSizeParam = document.getElementById('linkSize');
let numberBar = document.getElementsByClassName('numberBar');

const elementPosXSliderParam = document.getElementById('elementPosXSlider');
const elementPosYSliderParam = document.getElementById('elementPosYSlider');
const elementWidthSliderParam = document.getElementById('elementWidthSlider');
const elementHeightSliderParam = document.getElementById('elementHeightSlider');
const elementRotationSliderParam = document.getElementById('elementRotationSlider');

const settingRender = document.getElementById('settingRender');
const imageParam = document.getElementById('imageParam');

//linkSizeParam.checked = false;
let linkSize = linkSizeParam.checked;
let selected; // Which div is selected (index number)

//When docummend is clicked, unselect every images
document.addEventListener("click", function(event) {
    if (event.target == document.getElementById("tool") || event.target == document.getElementById("imageListBox")) {
        unselectEveryImages();
    }
});

function unselectEveryImages() {
    imageStack.forEach(element => {
        element.className = element.className.replace(" selected", "");
    });
    dataStack.forEach(el => {
        el.IsSelected = false;
    });
    selected = undefined;
    assignObjectToList("empty");
}

function addEventListenerToList() { 
    imageStack.forEach(element => {
        element.addEventListener('click', function(event) {
            let index = parseInt(element.className.replace("addedImgBox image", "").replace(" selected", ""));
            if (dataStack.length <= index) index -= 1;

            if (dataStack.length > 0 && (event.target == imageStack[index] || event.target == imageStack[index].children[1])) {
                dataStack.forEach(el => {
                    el.IsSelected = false;
                });
                dataStack[index].IsSelected = true;
                selected = index;
                reloadImageList();
            }
        });
    });
}

function assignObjectToList(objectIndex) {
    if (objectIndex != "empty") {
        imageParam.style.display = "flex";

        elementPosXParam.value = dataStack[objectIndex].x;
        elementPosYParam.value = dataStack[objectIndex].y;
        elementWidthParam.value = dataStack[objectIndex].width;
        elementHeightParam.value = dataStack[objectIndex].height;
        elementRotationParam.value = dataStack[objectIndex].rotation;
        normalizeCoordsParam.checked = dataStack[objectIndex].AreCoordsNormalized;
        linkSizeParam.checked = dataStack[objectIndex].IsSizeLinked;
        
        elementPosXParam.disabled = false;
        elementPosYParam.disabled = false;
        elementWidthParam.disabled = false;
        if (dataStack[selected].IsSizeLinked) {
            elementHeightParam.disabled = true;
            dataStack[selected].height = Math.floor(dataStack[selected].width / dataStack[selected].imageRatio);
        } else {
            elementHeightParam.disabled = false;
        }
        elementRotationParam.disabled = false;
        normalizeCoordsParam.disabled = false;
        linkSizeParam.disabled = false;

        settingRender.style.flexDirection = "column-reverse";
    }
    else {
        imageParam.style.display = "none";
        
        elementPosXParam.value = "";
        elementPosYParam.value = "";
        elementWidthParam.value = "";
        elementHeightParam.value = "";
        elementRotationParam.value = "";
        normalizeCoordsParam.checked = false;
        linkSizeParam.checked = false;

        elementPosXParam.disabled = true;
        elementPosYParam.disabled = true;
        elementWidthParam.disabled = true;
        elementHeightParam.disabled = true;
        elementRotationParam.disabled = true;
        normalizeCoordsParam.disabled = true;
        linkSizeParam.disabled = true;

        settingRender.style.flexDirection = "column";
    }
}

elementPosXParam.addEventListener("input", function(){
    if (elementPosXParam.value == "") elementPosXParam.value = 0;
    dataStack[selected].x = parseInt(elementPosXParam.value);
    draw();
});

elementPosYParam.addEventListener("input", function(){
    if (elementPosYParam.value == "") elementPosYParam.value = 0;
    dataStack[selected].y = parseInt(elementPosYParam.value);
    draw();
});

elementWidthParam.addEventListener("input", function(){
    if (elementWidthParam.value == "") elementWidthParam.value = 0;
    dataStack[selected].width = parseInt(elementWidthParam.value);
    //if (dataStack[selected].linkSize) dataStack[selected].height = Math.floor(dataStack[selected].width / dataStack[selected].imageRatio);
    draw();
});

elementHeightParam.addEventListener("input", function(){
    if (elementHeightParam.value == "") elementHeightParam.value = 0;
    dataStack[selected].height = parseInt(elementHeightParam.value);
    draw();
});

elementRotationParam.addEventListener("input", function(){
    if (elementRotationParam.value == "") elementRotationParam.value = 0;
    if (elementRotationParam.value > 360) elementRotationParam.value = 360;
    else if (elementRotationParam.value < -360) elementRotationParam.value = -360;
    dataStack[selected].rotation = parseInt(elementRotationParam.value);
    draw();
});

normalizeCoordsParam.addEventListener("input", function(){
    dataStack[selected].AreCoordsNormalized = normalizeCoordsParam.checked;
    draw();
    displayWaningText();
});

linkSizeParam.addEventListener("input", function(){
    dataStack[selected].IsSizeLinked = linkSizeParam.checked;
    if (dataStack[selected].IsSizeLinked) {
        elementHeightParam.disabled = true;
        dataStack[selected].height = Math.floor(dataStack[selected].width / dataStack[selected].imageRatio);
    } else {
        elementHeightParam.disabled = false;
    }
    draw();
    displayWaningText();
});

document.addEventListener("mouseup", function(){
    //document.removeEventListener("keydown");
    document.removeEventListener("mousemove", sliderMove.x, false);
    document.removeEventListener("mousemove", sliderMove.y, false);
    document.removeEventListener("mousemove", sliderMove.width, false);
    document.removeEventListener("mousemove", sliderMove.height, false);
    document.removeEventListener("mousemove", sliderMove.rotation, false);
    
    userTextBoxInteraction.allow();
}, false);


elementPosXSliderParam.addEventListener("mousedown", function(e){
    m_pos.x = e.x;
    userTextBoxInteraction.deny();
    if (selected != undefined) document.addEventListener("mousemove", sliderMove.x, false);
});

elementPosYSliderParam.addEventListener("mousedown", function(e){
    m_pos.x = e.x;
    userTextBoxInteraction.deny();
    if (selected != undefined) document.addEventListener("mousemove", sliderMove.y, false);
});

elementWidthSliderParam.addEventListener("mousedown", function(e){
    m_pos.x = e.x;
    userTextBoxInteraction.deny();
    if (selected != undefined) document.addEventListener("mousemove", sliderMove.width, false);
});

elementHeightSliderParam.addEventListener("mousedown", function(e){
    m_pos.x = e.x;
    userTextBoxInteraction.deny();
    if (selected != undefined && !dataStack[selected].IsSizeLinked) document.addEventListener("mousemove", sliderMove.height, false);
});

elementRotationSliderParam.addEventListener("mousedown", function(e){
    m_pos.x = e.x;
    userTextBoxInteraction.deny();
    if (selected != undefined) document.addEventListener("mousemove", sliderMove.rotation, false);
});

let sliderMove = {
    x: function(e){
        const dx = e.x - m_pos.x;
        m_pos.x = e.x;
        dataStack[selected].x += parseInt(dx);
        draw();
    },
    y: function(e){
        const dx = e.x - m_pos.x;
        m_pos.x = e.x;
        dataStack[selected].y += dx;
        draw();
    },
    width: function(e){
        const dx = e.x - m_pos.x;
        m_pos.x = e.x;
        dataStack[selected].width += dx;
        if (dataStack[selected].width < 0) dataStack[selected].width = 0;
        if (dataStack[selected].IsSizeLinked) dataStack[selected].height = Math.floor(dataStack[selected].width / dataStack[selected].imageRatio);
        draw();
    },
    height: function(e){
        const dx = e.x - m_pos.x;
        m_pos.x = e.x;
        dataStack[selected].height += dx;
        if (dataStack[selected].height < 0) dataStack[selected].height = 0;
        draw();
    },
    rotation: function(e){
        const dx = e.x - m_pos.x;
        m_pos.x = e.x;
        dataStack[selected].rotation += dx;

        if (dataStack[selected].rotation >= 360) dataStack[selected].rotation = 0;
        else if (dataStack[selected].rotation < 0) dataStack[selected].rotation = 359;
        //dataStack[selected].rotation = elementRotationParam.value;
        draw();
    }
}

let userTextBoxInteraction = {
    allow: function(){
        for (let i = 0; i < numberBar.length; i++) {
            numberBar[i].className = "numberBar";
        }
    },
    deny: function(){
        for (let i = 0; i < numberBar.length; i++) {
            numberBar[i].className = "numberBar preventSelection";
        }
    }
}

let actionBtn = {
    alignHorizontal: function(){
        if (selected != undefined) {
            dataStack[selected].x = Math.floor(shaderView.width / 2);
            draw();
        }
    },
    alignVertical: function(){
        if (selected != undefined) {
            dataStack[selected].y = Math.floor(shaderView.height / 2);
            draw();
        }
    },
    expandVertical: function(){
        if (selected != undefined) {
            dataStack[selected].height = shaderView.height;
            if (dataStack[selected].IsSizeLinked) dataStack[selected].height = dataStack[selected].width / dataStack[selected].imageRatio;
            draw();
        }
    },
    expandHorizontal: function(){
        if (selected != undefined) {
            dataStack[selected].width = shaderView.width;
            if (dataStack[selected].IsSizeLinked) dataStack[selected].height = dataStack[selected].width / dataStack[selected].imageRatio;
            draw();
        }
    },
    resetRotate: function(){
        if (selected != undefined) {
            dataStack[selected].rotation = 0;
            draw();
        }
    }
}