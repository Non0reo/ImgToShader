//Code colorisation with highlight.js
hljs.highlightAll();

const generatedBox = document.getElementById("generatedCode");
const generatedBoxLogo = document.getElementById("generatedCodeLogo");
const generatedBoxBar = document.getElementById("generatedCodeBar");
const downloadPack = document.getElementById("downloadPack");
const warningText = document.getElementById("warningText");
let generated, generatedLogo, generatedBar;
let generatedFunction, generatedLogoFunction, generatedBarFunction;
let finalCode, finalCodeLogo, finalCodeBar;
let functionList = [];

//Variables for storing the core code

const startText = `/*
 Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

in vec4 vertexColor;

uniform vec4 ColorModulator;

out vec4 fragColor;`;

const middleText = 
`void main() {
    vec4 color = vertexColor;
    if (color.a == 0.0) discard;

    fragColor = color * ColorModulator;`;

const startTextLogo = `/*
Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

uniform sampler2D Sampler0;
uniform vec4 ColorModulator;

in vec2 texCoord0;

out vec4 fragColor;`;

const middleTextLogo = `void main() {
    vec4 color = texture(Sampler0, texCoord0);
    if (color.a == 0.0) discard;
    
    fragColor = color * ColorModulator;`;

const endText = `}`;



async function generateCode() {
    //Reseet the generated code
    generated = "";
    generatedFunction = "";
    generatedBar = "";
    generatedBarFunction = "";
    generatedLogo = "";
    generatedLogoFunction = "";
    generatedBox.innerHTML = "";
    generatedBoxLogo.innerHTML = "";
    generatedBoxBar.innerHTML = "";
    functionList = [];

    //Dislay doawnload button
    downloadPack.style.display = "unset";

    /* //Get the data from the canvas
    const tempDrawLogo = drawLogo;
    const tempDrawLoadingBar = drawLoadingBar;
    drawLogo = false;
    drawLoadingBar = false;
    draw();

    //let data = shaderView.toDataURL("image/png");
    //download(data, "image.png");

    //Restore the data
    drawLogo = tempDrawLogo;
    drawLoadingBar = tempDrawLoadingBar;
    draw(); */

    //= Added Functions =//

    //Get the data from the canvas
    const tempDrawLogo = drawLogo;
    const tempDrawLoadingBar = drawLoadingBar;
    drawLogo = false;
    drawLoadingBar = false;
    draw();

    //Wait for all data in the function to be loaded
    //let promise = new Promise(resolve => setTimeout(() => resolve("done!"), 1000)/* ImagesData() */);
    if (imageStack.length == 0) { //Don't bother to make code if there is no image
        DataCompletlyLoaded(tempDrawLogo, tempDrawLoadingBar);
        return;
    } else {
        await ImagesData();
    }
    //await promise;
    //promise.then(function() {

        //DownlodPreparation("download_page.html", finalCode, finalCodeLogo);
    //});
}

//Create if statement
function createIfStatement(condition, code, IsElseIf, IsOneLine) {
    if (IsOneLine) return `${(IsElseIf) ? "\t\t\telse " : ""}if (${condition}) ${code}`;
    return `${(IsElseIf) ? "\t\telse " : "    "}if (${condition}) {
        ${code}
    }`;
}


/* function createFunction(name, parameters, code) {
    return [
        "void " + name + "(" + parameters + ") {",
        "\t" + code,
        "}"
    ].join("\n");
} */
function createFunction(name, parameters, code) {
    return `void ${name}(${parameters}) {
${code}
}`;
}

function hexToDecimal(variable, devideBy) {
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

    console.log(color.r);
    return {color: color, 
            IsAlphaChanged: hexColor.length == 8 ? true : false
        };
}

/* const download = (path, filename) => {
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = filename;
    console.log(anchor.href, anchor.download)

    document.body.appendChild(anchor);
    anchor.click();
    function handleForm(event) { event.preventDefault(); } 
    anchor.addEventListener('submit', handleForm);
    document.body.removeChild(anchor);
}; */

function escapeHtml(str){
    return new Option(str).innerHTML;
}


function generateNumberFromSeed(seed) {
    let cripto = new Crypto();
    let number = cripto.md5(seed);
    return parseInt(number.substring(0, 8), 16);
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

const DownlodPreparation = () => {

    const packMcmeta = 
`{
    "pack": {
        "pack_format": 15,
        "description": "Background loading screen"
    }
}`;

    const jsonColor =
`
{
    "blend": {
        "func": "add",
        "srcrgb": "srcalpha",
        "dstrgb": "1-srcalpha"
    },
    "vertex": "position_color",
    "fragment": "position_color",
    "attributes": [
        "Color"
    ],
    "samplers": [
    ],
    "uniforms": [
        { "name": "ModelViewMat", "type": "matrix4x4", "count": 16, "values": [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] },
        { "name": "ProjMat", "type": "matrix4x4", "count": 16, "values": [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] },
        { "name": "ColorModulator", "type": "float", "count": 4, "values": [ 1.0, 1.0, 1.0, 1.0 ] },
    ]
}
`;



    console.log(packMcmeta);
    zip = new JSZip();
        zip.file("pack.mcmeta", packMcmeta.toString());
        let assets = zip.folder("assets");
        let minecraft = assets.folder("minecraft");
        let shaders = minecraft.folder("shaders");
        let core = shaders.folder("core");
        if(SHADER_VERSION === 0) {
            core.file("position_color.fsh", finalCode);
            core.file("position_color.json", jsonColor);
            core.file("position_tex.fsh", finalCodeLogo);
        } else {
            core.file("rendertype_gui_overlay.fsh", finalCode);
            core.file("rendertype_gui.fsh", finalCodeBar);
            //core.file("rendertype_gui_overlay.json", jsonColor);
            core.file("position_tex.fsh", finalCodeLogo);
        }

        zip.generateAsync({type:"blob"})
        .then(function(content) {
            download(content, "CustomLoadingBackground.zip", "application/zip");
            window.focus();   
        });

    /* let color = new URLSearchParams();
    let tex = new URLSearchParams();
    color.append("color", finalCode);
    tex.append("tex", finalCodeLogo);
    //console.log(`${url}?${color.toString()}&${tex.toString()}`)
    window.open(`${url}?${color.toString()}&${tex.toString()}`, '_blank');
    return; */

    /* let zip = new JSZip();
        zip.file("pack.mcmeta", packMcmeta.toString());
        let assets = zip.folder("assets");
        let minecraft = assets.folder("minecraft");
        let shaders = minecraft.folder("shaders");
        let core = shaders.folder("core");
        core.file("position_color.fsh", finalCode);
        core.file("position_tex.fsh", finalCodeLogo);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            // console.log(content);
            // let save = saveAs(content, "ChangedBackground.zip");
            // console.log(save);
            let color = new URLSearchParams();
            let tex = new URLSearchParams();
            color.append("color", finalCode);
            tex.append("tex", finalCodeLogo);
            //console.log(`${url}?${color.toString()}&${tex.toString()}`)
            window.open(`${url}?${color.toString()}&${tex.toString()}`, '_blank');
                // let data = new URLSearchParams();
                // data.append("data", content);
                // window.open(`${url}?${data.toString()}`, '_blank');
            //data.append("name", "ChangedBackground.zip");
            //download(data, "ChangedBackground.zip", "application/zip");
            window.focus();            
        });
    //window.stop();
    //window.location.href = `${url}?` + param.toString();
     */
}

async function ImagesData() {
    for (let i = imageStack.length - 1; i >= 0; i--) {

        ctx.clearRect(0, 0, size.width, size.height);
        drawAddedPictures(i);

        //let data = shaderView.toDataURL("image/png");
        let dataPixel = ctx.getImageData(dataStack[i].boundingBox.minX, dataStack[i].boundingBox.minY, dataStack[i].boundingBox.maxX - dataStack[i].boundingBox.minX, dataStack[i].boundingBox.maxY - dataStack[i].boundingBox.minY);
        let resultList = [];


        /* console.log(dataPixel.data, colorList, dataPixel.data.length);

        //console.log(data, dataPixel);
        //window.open(data, "_blank");
        //download(data, "image.png"); */



        let worker = new Worker("/js/worker.js");
        worker.postMessage([dataPixel, dataStack[i]]);

        worker.onmessage = await async function(event) {
            //colorList += event.data + ",";
            console.log(event.data);
            resultList = await event.data.result;

            let condition;
            if (dataStack[i].AreCoordsNormalized) {
                condition = "gl_FragCoord.x >= " + dataStack[i].boundingBox.minX + " * ScreenSize.x / " + size.width + " && gl_FragCoord.x <= " + dataStack[i].boundingBox.maxX + " * ScreenSize.x / " + size.width + " && gl_FragCoord.y >= " + dataStack[i].boundingBox.minY + " * ScreenSize.y / " + size.height + " && gl_FragCoord.y <= " + dataStack[i].boundingBox.maxY + " * ScreenSize.y / " + size.height;
            }
            else {
                condition = "gl_FragCoord.x >= " + dataStack[i].boundingBox.minX + " && gl_FragCoord.x <= " + dataStack[i].boundingBox.maxX + " && gl_FragCoord.y >= " + dataStack[i].boundingBox.minY + " && gl_FragCoord.y <= " + dataStack[i].boundingBox.maxY;
            }

            console.log(resultList.join("\n"))
            let insideBoundingBox = createIfStatement(condition, resultList.join("\n"), false);

            let functionName = dataStack[i].imageName.replace(/.png|.jpg|.jpeg|.webp"/, "");
            functionList.push(functionName);
            generatedFunction += `\n${createFunction(functionName, "vec4 color, in vec2 ScreenSize", insideBoundingBox)}\n`;

            console.log("The result list is: ", resultList.join("\n"));

            DataCompletlyLoaded();
        }


    }
}

function DataCompletlyLoaded(tempDrawLogo, tempDrawLoadingBar) {
    console.log("All data loaded");

    //Restore the data
    drawLogo = tempDrawLogo;
    drawLoadingBar = tempDrawLoadingBar;
    draw();


    //Reset the warning text
    warningText.style.display = "none";
    fileModified = false;

    //= Void Main() =//    

    //Change Background Color
    if (backgroundColor != "#EF323D" || !drawBackground) {
        let colorInfos = hexToDecimal(backgroundColor);
        if (!drawBackground) colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: false};
        console.log(backgroundColor.replace("#", ""), colorInfos);

        let alpha = (drawBackground) ? (colorInfos.IsAlphaChanged ? ("color.a - " + ((1.0 - colorInfos.color.a))) : "color.a") : "0.0";
        generated += `\n${createIfStatement(((accessibilityCompatibility) ? "(color.r == 239.0 / 255.0 || color.rgb == vec3(0.0))" : "color.r == 239.0 / 255.0"), "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + alpha + ");")}\n`;
    }

    //Change Loading Bar Color
    if (loadingBarColor != "#ffffff" || !drawLoadingBar) {
        let colorInfos = hexToDecimal(loadingBarColor);
        if (!drawLoadingBar) {
            if (drawBackground) colorInfos = hexToDecimal(backgroundColor);
            else colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: false};
        }
        console.log(loadingBarColor.replace("#", ""), colorInfos);

        //let alpha = (drawLoadingBar) ? (colorInfos.IsAlphaChanged ? ("color.a - " + ((1.0 - colorInfos.color.a))) : "color.a") : "0.0";
        let alpha;
        if (drawLoadingBar) {
            if (colorInfos.IsAlphaChanged) alpha = "color.a - " + ((1.0 - colorInfos.color.a));
            else alpha = "color.a";
        } else {
            if (drawBackground) alpha = "color.a";
            else alpha = "0.0";
        }

        const loadingBarColorGenerated = `\n${createIfStatement("color.rgb == vec3(1.0)" + (SHADER_VERSION === 0 ? " && color.a != 128.0 / 255.0" : ""), "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + alpha + ");")}\n`;
        if(SHADER_VERSION === 0) generated += loadingBarColorGenerated;
        else generatedBar += loadingBarColorGenerated;

    }

    //Change the Logo Color
    if (mojangLogoColor != "#ffffff" || !drawLogo) {
        let colorInfos = hexToDecimal(mojangLogoColor, 2);
        if (!drawLogo) colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: false};
        console.log(mojangLogoColor.replace("#", ""), colorInfos.color);

        let alpha = (drawLogo) ? (colorInfos.IsAlphaChanged ? ("color.a - " + ((1.0 - colorInfos.color.a))) : "color.a") : "0.0";
        generatedLogo += `\n${createIfStatement("texelFetch(Sampler0, ivec2(267, 146), 0) == vec4(1)", "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + alpha + ");")}\n`;
    }


    //Make the final composite to generate the code
    
    finalCode =  [startText, generatedFunction, middleText, generated, endText].join("\n");
    if (finalCode.length < 1000000) { //Display result only if the string is less than 1000000 characters
        const code = document.createElement("code");
        code.innerHTML = escapeHtml(finalCode);
        code.style.whiteSpace = "pre-wrap";
        code.style.paddingLeft = "0px";
        generatedBox.appendChild(code);
        hljs.highlightElement(generatedBox);
    }
    else {
        const code = document.createElement("code");
        code.innerHTML = escapeHtml("The code that you've generated is too long to display. Please download it.");
        code.style.whiteSpace = "pre-wrap";
        code.style.paddingLeft = "0px";
        generatedBox.appendChild(code);
        hljs.highlightElement(generatedBox);
    }

    if(SHADER_VERSION === 1) {
        generatedBoxBar.style.display = "block";

        finalCodeBar = [startText, generatedBarFunction, middleText, generatedBar, endText].join("\n");
        const codeBar = document.createElement("code");
        codeBar.innerHTML = escapeHtml(finalCodeBar);
        codeBar.style.whiteSpace = "pre-wrap";
        codeBar.style.paddingLeft = "0px";
        generatedBoxBar.appendChild(codeBar);
        hljs.highlightElement(generatedBoxBar);
    } else {
        generatedBoxBar.style.display = "none";
    }
 

    //Logo specific file
    finalCodeLogo =  [startTextLogo, generatedLogoFunction, middleTextLogo, generatedLogo, endText].join("\n");
    const codeLogo = document.createElement("code");
    codeLogo.innerHTML = escapeHtml(finalCodeLogo);
    codeLogo.style.whiteSpace = "pre-wrap";
    codeLogo.style.paddingLeft = "0px";
    generatedBoxLogo.appendChild(codeLogo);
    hljs.highlightElement(generatedBoxLogo);
}