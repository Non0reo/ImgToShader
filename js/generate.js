//Code colorisation with highlight.js
hljs.highlightAll();

const generatedBox = document.getElementById("generatedCode");
const generatedBoxLogo = document.getElementById("generatedCodeLogo");
const downloadPack = document.getElementById("downloadPack");
const warningText = document.getElementById("warningText");
let generated;
let generatedFunction;
let generatedLogo;
let generatedLogoFunction;
let finalCode;
let finalCodeLogo;

//Variables for storing the core code
const startText = [
    "/*",
    " Generated from https://non0reo.github.io/ImgToShader/",
    "*/",
    "",
    "#version 150\n",
    "in vec4 vertexColor;\n",
    "uniform vec4 ColorModulator;\n",
    "out vec4 fragColor;"
].join("\n");

const middleText = [
    "void main() {",
    "\tvec4 color = vertexColor;",
    "\tif (color.a == 0.0) {",
    "\t\tdiscard;",
    "\t}\n",
    "\tfragColor = color * ColorModulator;"
].join("\n");

const startTextLogo = [
    "/*",
    " Generated from https://non0reo.github.io/ImgToShader/",
    "*/",
    "",
    "#version 150\n",
    "uniform sampler2D Sampler0;\n",
    "uniform vec4 ColorModulator;\n",
    "in vec2 texCoord0;\n",
    "out vec4 fragColor;\n"
].join("\n");

const middleTextLogo = [
    "void main() {",
    "\tvec4 color = texture(Sampler0, texCoord0);",
    "\tif (color.a == 0.0) {",
    "\t\tdiscard;",
    "\t}\n",
    "\tfragColor = color * ColorModulator;"
].join("\n");

const endText = [
    "}"
].join("\n");



function generateCode() {
    //Reseet the generated code
    generated = "";
    generatedFunction = "";
    generatedLogo = "";
    generatedLogoFunction = "";
    generatedBox.innerHTML = "";
    generatedBoxLogo.innerHTML = "";

    //Dislay doawnload button
    downloadPack.style.display = "unset";

    //Get the data from the canvas
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
    draw();

    //Reset the warning text
    warningText.style.display = "none";
    fileModified = false;

    //= Added Functions =//

    for (let i = 0; i < imageStack.length; i++) {

        let condition;
        if (dataStack[i].AreCoordsNormalized) {
            condition = "gl_FragCoord.x >= " + dataStack[i].boundingBox.minX + " && gl_FragCoord.x <= " + dataStack[i].boundingBox.maxX + " && gl_FragCoord.y >= " + dataStack[i].boundingBox.minY + " && gl_FragCoord.y <= " + dataStack[i].boundingBox.maxY;
        }
        else {
            condition = "gl_FragCoord.x >= " + dataStack[i].boundingBox.minX / size.width + " && gl_FragCoord.x <= " + dataStack[i].boundingBox.maxX / size.width + " && gl_FragCoord.y >= " + dataStack[i].boundingBox.minY / size.height + " && gl_FragCoord.y <= " + dataStack[i].boundingBox.maxY / size.height;
        }
        let insideBoundingBox = createIfStatement(condition, "fragColor = vec4(1.0, 0.0, 0.0, 1.0);", false);

        generatedFunction += "\n" + createFunction(dataStack[i].imageName.replace(/.png|.jpg|.jpeg|.webp"/, ""), "fragColor = vec4(1.0, 0.0, 0.0, 1.0);") + "\n";
    }


    //= Void Main() =//    

    //Change Background Color
    if (backgroundColor != "#EF323D" || !drawBackground) {
        let colorInfos = hexToDecimal(backgroundColor);
        if (!drawBackground) colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: true};
        console.log(backgroundColor.replace("#", ""), colorInfos);


        generated += "\n\t" + createIfStatement(((accessibilityCompatibility) ? "(color.r == 239.0 / 255.0 || color.rgb == vec3(0.0))" : "color.r == 239.0 / 255.0") + " && color.a > 0.7", "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + (colorInfos.IsAlphaChanged ? ("color.a - " + (1.0 - colorInfos.color.a)) : "color.a") + ");") + "\n";
    }

    //Change Loading Bar Color
    if (loadingBarColor != "#ffffff" || !drawLoadingBar) {
        let colorInfos = hexToDecimal(loadingBarColor);
        if (!drawLoadingBar) {
            if (drawBackground) colorInfos = hexToDecimal(backgroundColor);
            else colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: true};
        }
        console.log(loadingBarColor.replace("#", ""), colorInfos);

        generated += "\n\t" + createIfStatement("color.r == 1.0 && color.a > 0.7", "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + (colorInfos.IsAlphaChanged ? ("color.a - " + (1.0 - colorInfos.color.a)) : "color.a") + ");") + "\n";
    }

    //Change the logo Color
    if (mojangLogoColor != "#ffffff" || !drawLogo) {
        let colorInfos = hexToDecimal(mojangLogoColor, 2);
        if (!drawLogo) colorInfos = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: true};
        console.log(mojangLogoColor.replace("#", ""), colorInfos.color);

        generatedLogo += "\n\t" + createIfStatement("texture(Sampler0, vec2(0.0, 0.25)).r == 1.0", "fragColor = vec4(" + colorInfos.color.r + ", " + colorInfos.color.g + ", " + colorInfos.color.b + ", " + (colorInfos.IsAlphaChanged ? ("color.a - " + (1.0 - colorInfos.color.a)) : "color.a") + ");") + "\n";
    }


    //Make the final composite to generate the code
    finalCode =  [startText, generatedFunction, middleText, generated, endText].join("\n");
    const code = document.createElement("code");
    code.innerHTML = finalCode;
    code.style.whiteSpace = "pre-wrap";
    code.style.paddingLeft = "0px";
    generatedBox.appendChild(code);
    hljs.highlightElement(generatedBox);

    //Logo specific file
    finalCodeLogo =  [startTextLogo, generatedLogoFunction, middleTextLogo, generatedLogo, endText].join("\n");
    const codeLogo = document.createElement("code");
    codeLogo.innerHTML = finalCodeLogo;
    codeLogo.style.whiteSpace = "pre-wrap";
    codeLogo.style.paddingLeft = "0px";
    generatedBoxLogo.appendChild(codeLogo);
    hljs.highlightElement(generatedBoxLogo);

    //DownlodPreparation("download_page.html", finalCode, finalCodeLogo);
}

//Create if statement
function createIfStatement(condition, code, IsElseIf) {
        return [
            ((IsElseIf) ? "else " : "") + "if (" + condition + ") {",
            "\t\t" + code,
            "\t}"
        ].join("\n");
}

function createFunction(name, code) {
    return [
        "void " + name + "() {",
        "\t" + code,
        "}"
    ].join("\n");
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

    //Making the nombers Floats
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

    const packMcmeta = [
        "{",
        "\t\"pack\": {",
        "\t\t\"pack_format\": 10,",
        "\t\t\"description\": {",
        "\t\t\t\"text\": \"Background loading screen\",",
        "\t\t\t\"clickEvent\": {",
        "\t\t\t\"action\": \"open_url\",",
        "\t\t\t\"value\": \"https://non0reo.github.io/ImgToShader/\"",
        "\t\t\t},",
        "\t\t\t\"hoverEvent\": {",
        "\t\t\t\"action\": \"show_text\",",
        "\t\t\t\"value\": \"By Nonoreo\"",
        "\t\t\t}",
        "\t\t}",
        "\t}",
        "}"
    ].join("\n");

    console.log(packMcmeta);
    zip = new JSZip();
        zip.file("pack.mcmeta", packMcmeta.toString());
        let assets = zip.folder("assets");
        let minecraft = assets.folder("minecraft");
        let shaders = minecraft.folder("shaders");
        let core = shaders.folder("core");
        core.file("position_color.fsh", finalCode);
        core.file("position_tex.fsh", finalCodeLogo);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            download(content, "ChangedBackground.zip", "application/zip");
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