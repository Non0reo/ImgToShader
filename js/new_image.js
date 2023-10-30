const imageList = document.getElementById("imageList");
const goToTopBtnSettings = document.getElementById("goToTopBtnSettings");
const settings = document.getElementsByClassName("settings");
let imageStack = []; //Actual Image
let dataStack = []; //Image informations on the canvas

function loadImage(event) {
    try {
        let img = new Image();
        img.src = URL.createObjectURL(event.srcElement.files[0]);
        const addedDiv = AddImageToList(img);
        
        img.onload = function(){
            dataStack.forEach(element => {
                element.IsSelected = false;
            });
            imageStack.unshift(addedDiv);
            dataStack.unshift({
                IsSelected: true,
                x: Math.floor(shaderView.width/2),
                y: Math.floor(shaderView.height/2),
                width: img.naturalWidth/2,
                height: img.naturalHeight/2,
                rotation: 0,
                AreCoordsNormalized: true,
                IsSizeLinked: true,
                imageRatio: img.naturalWidth/img.naturalHeight,
                boundingBox: [[shaderView.width/2 - img.naturalWidth/2, shaderView.height/2 - img.naturalHeight/2],
                            [shaderView.width/2 + img.naturalWidth/2, shaderView.height/2 - img.naturalHeight/2],
                            [shaderView.width/2 + img.naturalWidth/2, shaderView.height/2 + img.naturalHeight/2],
                            [shaderView.width/2 - img.naturalWidth/2, shaderView.height/2 + img.naturalHeight/2]],
                imageName: event.srcElement.files[0].name
            });
        
            reloadImageList();
            addEventListenerToList();
            //assignObjectToList(imageStack.length - 1);
        }

    } catch (error) {
        console.log("Error: " + error);
    }
}

function AddImageToList(img) {
    let div = document.createElement("div");
    let span = document.createElement("span");
    let input = document.createElement("input");
    let buttonRemove = document.createElement("button");
    let buttonDuplication = document.createElement("button");
    div.className = "addedImgBox";

    img.className = "addedImg";
    img.pointerEvents = "none";

    span.className= "moveButton";
    span.innerHTML = "<button class=\"upButton\" onclick=\"moveImageInStack(event)\"></button><button class=\"downButton\" onclick=\"moveImageInStack(event)\"></button>"
    
    input.type = "checkbox";
    input.className = "IsVisible";
    input.checked = true;
    input.oninput = function(){
        draw();
    }

    buttonRemove.className = "removeImg";
    buttonRemove.onclick = function() {

        let index = imageStack.indexOf(img.parentElement);
        const IsRemoveSelected = dataStack[index].IsSelected;
        imageStack.splice(index, 1);
        dataStack.splice(index, 1);
        div.remove();

        let selectedIndex = 0;
        console.log(imageStack.length, dataStack, index, dataStack[index], IsRemoveSelected);
        if (imageStack.length > 0 && IsRemoveSelected) {
            console.log("executed");
            if (dataStack[index - 1]) selectedIndex = index - 1;
            else if (dataStack[index]) selectedIndex = index;

            dataStack[selectedIndex] = { //Select previous (or next) element
                IsSelected: true,
                x: dataStack[selectedIndex].x,
                y: dataStack[selectedIndex].y,
                width: dataStack[selectedIndex].width,
                height: dataStack[selectedIndex].height,
                rotation: dataStack[selectedIndex].rotation,
                AreCoordsNormalized: dataStack[selectedIndex].AreCoordsNormalized,
                IsSizeLinked: dataStack[selectedIndex].IsSizeLinked,
                imageRatio: dataStack[selectedIndex].imageRatio,
                boundingBox: dataStack[selectedIndex].boundingBox,
                imageName: dataStack[selectedIndex].imageName
            };
            addEventListenerToList();
        }

        console.log(index, selectedIndex, dataStack[index]);

        reloadImageList();
    }

    buttonDuplication.className = "duplicateImg";
    buttonDuplication.onclick = function(event) {
        if (event.isTrusted) {
            let newImg = new Image();
            newImg.src = img.src;
            let position = parseInt(event.target.parentElement.className.toString().replace("addedImgBox image", ""));
            const actualDivData = dataStack[position];
            let modifiedDivData = {  //Create a new object with the same data to prenvent it to change the original data from all objects
                IsSelected: actualDivData.IsSelected,    // And you kown what? It works so I won't change it :p
                x: actualDivData.x,
                y: actualDivData.y,
                width: actualDivData.width,
                height: actualDivData.height,
                rotation: actualDivData.rotation,
                AreCoordsNormalized: actualDivData.AreCoordsNormalized,
                IsSizeLinked: actualDivData.IsSizeLinked,
                imageRatio: actualDivData.imageRatio,
                boundingBox: actualDivData.boundingBox,
                imageName: actualDivData.imageName
            };

            const addedDiv = AddImageToList(newImg); //return a div and therefore, can be added in the list
            imageStack.splice(position, 0, addedDiv);
            dataStack.splice(position, 0, modifiedDivData);
            
            dataStack.forEach(element => {
                element.IsSelected = false;
            });

            dataStack[position + 1] = { //Change new img data
                IsSelected: true,
                x: actualDivData.x + 20,
                y: actualDivData.y - 20,
                width: actualDivData.width,
                height: actualDivData.height,
                rotation: actualDivData.rotation,
                AreCoordsNormalized: actualDivData.AreCoordsNormalized,
                IsSizeLinked: actualDivData.IsSizeLinked,
                imageRatio: actualDivData.imageRatio,
                boundingBox: actualDivData.boundingBox,
                imageName: actualDivData.imageName
            };

            addEventListenerToList();
            reloadImageList();
        }
    }

    div.appendChild(span);
    div.appendChild(img);
    div.appendChild(input);
    div.appendChild(buttonRemove);
    div.appendChild(buttonDuplication);
    imageList.appendChild(div);

    return div;
}

function moveImageInStack(event) {
    let index = imageStack.indexOf(event.srcElement.parentElement.parentElement);
    if (event.srcElement.className == "upButton" && index > 0) {
        [imageStack[index], imageStack[index - 1]] = [imageStack[index - 1], imageStack[index]]; //swap
        [dataStack[index], dataStack[index - 1]] = [dataStack[index - 1], dataStack[index]];
    }
    else if (event.srcElement.className == "downButton" && index < imageStack.length - 1) {
        [imageStack[index], imageStack[index + 1]] = [imageStack[index + 1], imageStack[index]]; //swap
        [dataStack[index], dataStack[index + 1]] = [dataStack[index + 1], dataStack[index]];
    }

    reloadImageList();
}

function reloadImageList() {
    imageList.innerHTML = "";
    for (let i = 0; i < imageStack.length; i++) {
        const addedImage = imageList.appendChild(imageStack[i]);
        if (!dataStack[i].IsSelected) addedImage.className = `addedImgBox image${i}`;
        else {
            addedImage.className = `addedImgBox image${i} selected`;
            selected = i;
            assignObjectToList(i);
        }
        //addedImage.className = `addedImgBox image${i}`;
        //console.log(imageStack[i].children[0].children[0] );
        imageList.children[i].children[0].children[0].style.backgroundColor = "white";
        imageList.children[i].children[0].children[1].style.backgroundColor = "white";
        if (i == 0) imageList.children[i].children[0].children[0].style.backgroundColor = "darkgray";
        if (i == imageStack.length - 1) imageList.children[i].children[0].children[1].style.backgroundColor = "darkgray";
    }

    if (imageStack.length >= 6) {
        goToTopBtnSettings.style.display = "unset";
        settings[0].style.height = "unset";
    }
    else {
        goToTopBtnSettings.style.display = "none";
        settings[0].style.height = "fit-content";
    }

    if (imageStack.length <= 0) {
        assignObjectToList("empty");
        selected = undefined;
    }

    draw();
    displayWaningText();
}

function drawAddedPictures(drawSpecificImage) {
    ctx.globalCompositeOperation = "destination-over";

    for (let index = 0; index < ((drawSpecificImage === undefined) ? imageStack.length : 1); index++) {
        let i = (drawSpecificImage === undefined) ? index : drawSpecificImage; //use index number unless if drawSpecificImage exists

        if (imageStack[i].children[1].className == "addedImg") {
            if (!imageStack[i].children[2].checked) continue; //If the checkbox ins't checked, don't draw the img

            ctx.save();
            ctx.translate(dataStack[i].x, dataStack[i].y);
            ctx.rotate(dataStack[i].rotation*Math.PI/180);
            ctx.translate(-dataStack[i].x, -dataStack[i].y);
            ctx.drawImage(imageStack[i].children[1], dataStack[i].x - dataStack[i].width / 2, dataStack[i].y - dataStack[i].height / 2, dataStack[i].width, dataStack[i].height);
            ctx.restore();

            //= Bounding box =//

            let cornerPos = [[dataStack[i].x - dataStack[i].width / 2, dataStack[i].y - dataStack[i].height / 2],
                        [dataStack[i].x + dataStack[i].width / 2, dataStack[i].y - dataStack[i].height / 2],
                        [dataStack[i].x + dataStack[i].width / 2, dataStack[i].y + dataStack[i].height / 2],
                        [dataStack[i].x - dataStack[i].width / 2, dataStack[i].y + dataStack[i].height / 2]];
            dataStack[i].boundingBox = cornerPos;

            cornerPos.forEach(element => {

                //Rotate Coords from the center of the image
                //( cos(r) * x0 + sin(r) * y0, -sin(r) * x0 + cos(r) * y0)

                let coords = [element[0], element[1]];
                element[0] = ((coords[0] - dataStack[i].x) * Math.cos(dataStack[i].rotation*Math.PI/180) + (coords[1] - dataStack[i].y) * Math.sin(dataStack[i].rotation*Math.PI/180)) + dataStack[i].x;
                element[1] = ((coords[0] - dataStack[i].x) * Math.sin(dataStack[i].rotation*Math.PI/180) - (coords[1] - dataStack[i].y) * Math.cos(dataStack[i].rotation*Math.PI/180)) + dataStack[i].y;

            });

            let minX = Math.min(...cornerPos.map(element => element[0]));
            let minY = Math.min(...cornerPos.map(element => element[1]));

            let maxX = Math.max(...cornerPos.map(element => element[0]));
            let maxY = Math.max(...cornerPos.map(element => element[1]));

            //dataStack[i].boundingBox = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]]; //Define the bounding box lines of the image
            dataStack[i].boundingBox = {minX: minX > 0 ? minX : 0,
                                        minY: minY > 0 ? minY : 0,
                                        maxX: maxX < size.width ? maxX : size.width,
                                        maxY: maxY < size.height ? maxY : size.height}; //Define the bounding box of the image
        }
    }

    /* //Boundign box debug
    for (let i = 0; i < imageStack.length; i++) {
        
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.moveTo(dataStack[i].boundingBox.minX, dataStack[i].boundingBox.minY);
        ctx.lineTo(dataStack[i].boundingBox.maxX, dataStack[i].boundingBox.minY);
        ctx.stroke();
        ctx.moveTo(dataStack[i].boundingBox.maxX, dataStack[i].boundingBox.minY);
        ctx.lineTo(dataStack[i].boundingBox.maxX, dataStack[i].boundingBox.maxY);
        ctx.stroke();
        ctx.moveTo(dataStack[i].boundingBox.maxX, dataStack[i].boundingBox.maxY);
        ctx.lineTo(dataStack[i].boundingBox.minX, dataStack[i].boundingBox.maxY);
        ctx.stroke();
        ctx.moveTo(dataStack[i].boundingBox.minX, dataStack[i].boundingBox.maxY);
        ctx.lineTo(dataStack[i].boundingBox.minX, dataStack[i].boundingBox.minY);
        ctx.stroke();
    } */

    ctx.globalCompositeOperation = "source-over";
}