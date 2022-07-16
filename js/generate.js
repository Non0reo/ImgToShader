//Code colorisation with highlight.js
hljs.highlightAll();

const generatedBox = document.getElementById("generatedCode");
const generatedBoxLogo = document.getElementById("generatedCodeLogo");
let generated;
let generatedLogo;

//Variables for storing the core code
const startText = [
    "/*",
    " Generated from https://non0reo.github.io/ImgToShader/",
    "*/",
    "#version 150\n",
    "in vec4 vertexColor;\n",
    "uniform vec4 ColorModulator;\n",
    "out vec4 fragColor;",,
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
    "out vec4 fragColor;\n",
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
    generatedLogo = "";
    generatedBox.innerHTML = "";
    generatedBoxLogo.innerHTML = "";


    //Change Background Color
    if (backgroundColor != "#EF323D") {
        let color = hexToDecimal(backgroundColor);
        console.log(backgroundColor.replace("#", ""), color);

        generated += "\n\t" + createIfStatement(((accessibilityCompatibility) ? "(color.r == 0.93725 || color.rgb == vec3(0.0))" : "color.r == 0.93725") + " && color.a > 0.7", "fragColor = vec4(" + color.r + ", " + color.g + ", " + color.b + ", 1.0);") + "\n";
    }

    //Change Loading Bar Color
    if (loadingBarColor != "#ffffff") {
        let color = hexToDecimal(loadingBarColor);
        console.log(loadingBarColor.replace("#", ""), color);

        generated += "\n\t" + createIfStatement("color.r == 1.0 && color.a > 0.7", "fragColor = vec4(" + color.r + ", " + color.g + ", " + color.b + ", 1.0);") + "\n";
    }

    //Change the logo Color
    if (mojangLogoColor != "#ffffff") {
        let color = hexToDecimal(mojangLogoColor, 2);
        console.log(mojangLogoColor.replace("#", ""), color);

        generatedLogo += "\n\t" + createIfStatement("texture(Sampler0, vec2(0.0, 0.25)).r == 1.0", "fragColor = vec4(" + color.r + ", " + color.g + ", " + color.b + ", 1.0);") + "\n";
    }


    //Make the final composite to generate the code
    let finalCode =  [startText, generated, endText].join("\n");
    const code = document.createElement("code");
    code.innerHTML = finalCode;
    code.style.whiteSpace = "pre-wrap";
    code.style.paddingLeft = "0px";
    generatedBox.appendChild(code);
    hljs.highlightElement(generatedBox);

    //Logo specific file
    let finalCodeLogo =  [startTextLogo, generatedLogo, endText].join("\n");
    const codeLogo = document.createElement("code");
    codeLogo.innerHTML = finalCodeLogo;
    codeLogo.style.whiteSpace = "pre-wrap";
    codeLogo.style.paddingLeft = "0px";
    generatedBoxLogo.appendChild(codeLogo);
    hljs.highlightElement(generatedBoxLogo);
}

//Create if statement
function createIfStatement(condition, code, IsElseIf) {
        return [
            ((IsElseIf) ? "else " : "") + "if (" + condition + ") {",
            "\t\t" + code,
            "\t}"
        ].join("\n");
}

function hexToDecimal(variable, devideBy) {
    let hexColor = variable.replace("#", "");
    let division = 1;
    if (devideBy != undefined) division = devideBy;
    let color = {r: (parseInt(hexColor.substring(0, 2), 16) / 255 / division).toString(), 
            g: (parseInt(hexColor.substring(2, 4), 16) / 255 / division).toString(), 
            b: (parseInt(hexColor.substring(4, 6), 16) / 255 / division).toString()
    };
    //Making the nombers Floats
    if (color.r == 0 || color.r == 1) color.r += ".0";
    if (color.g == 0 || color.g == 1) color.g += ".0";
    if (color.b == 0 || color.b == 1) color.b += ".0";

    console.log(color.r);
    return color;
}
