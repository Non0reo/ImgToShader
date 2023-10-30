
/*
    Explanation of the algorithm:
    1. The worker receives the image, its data, the color palette and the index of the color to be replaced.
    2. The generated code will be placed in the "result" variable.
    3. The generated code contains a switch statement that will be used to replace the color.


*/

self.onmessage = function(e) {

    const image = JSON.parse(e.data);

    console.log(image)


    console.log(generateGUIOverlayFSH(image))

    generateImageBackgroundGLSL(image);

    /* this.postMessage({
        result: result,
        colorList: colorList
    }); */

}




function generateGUIOverlayFSH(image) {
    let genCode = 
`/*
Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

#define WIDTH ${image.imageData.width}
#define HEIGHT ${image.imageData.height}

#moj_import <utils.glsl>
#moj_import <image/canvas1.glsl>

in vec4 vertexColor;
in vec3 pos;

uniform vec4 ColorModulator;
uniform mat4 ProjMat;
uniform vec2 ScreenSize;

out vec4 fragColor;

ivec2 imageSize = ivec2(WIDTH, HEIGHT);

void main() {
    vec4 color = vertexColor;
    if (color.a == 0.0) discard;

    fragColor = color * ColorModulator;

    vec2 RealSSize = getScreenSize(ProjMat, ScreenSize);
    vec2 pixelUnit = RealSSize.xy / imageSize.xy;
    ivec2 RealPixelPos = getPixelPos(pixelUnit, pos.xy);

    if ((color.r == 239.0 / 255.0 || color.rgb == vec3(0.0))) {
        vec3 newColor = pColor(RealPixelPos, imageSize) / 255;
        fragColor = vec4(newColor, color.a);
    }
}
    `;

    return genCode;
}

function generateGUIOverlayVSH() {
    let genCode =
    `#version 150

    in vec3 Position;
    in vec4 Color;

    uniform mat4 ModelViewMat;
    uniform mat4 ProjMat;

    out vec4 vertexColor;
    out vec3 pos;

    void main() {
        gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);
        pos = Position;
        vertexColor = Color;
    }
    `;
}

function generateUtilsGLSL() {
    let genCode =
`/*
    Generated from https://non0reo.github.io/ImgToShader/
    Code by Titruc and Maxboxx, Modified by Non0reo
*/

int guiScale(mat4 ProjMat, vec2 ScreenSize) {
    return int(round(ScreenSize.x * ProjMat[0][0] / 2)); 
}

vec2 getScreenSize(mat4 ProjMat, vec2 ScreenSize){
    float scale = guiScale(ProjMat, ScreenSize);
    return ScreenSize / scale;
}

ivec2 getPixelPos(vec2 pixelUnit, vec2 pos){
    return ivec2(floor(pos / pixelUnit));
}
    `;
}

/* 
vec3 pColor(ivec2 RealPixelPos, ivec2 imageSize) {
    //int pixelI = RealPixelPos.y * imageSize.y + RealPixelPos.x;
    int pixelI = RealPixelPos.y * imageSize.x + RealPixelPos.x;
    switch(pixelI) {
        case 0:
            return vec3(0, 0, 0);
        case 1:
            return vec3(0, 255, 0);
        case 29:
            return vec3(0, 0, 255);
        case 3:
        case 4:
        case 18:
        case 22:
        case 28:
        case 30:
        case 74:
        case 12:
            return vec3(255, 0, 0);
        case 75:
            return vec3(255, 0, 255);
        case 143:
            return vec3(255, 255, 0);
        default:
            return vec3(100, 130, 190);
    }
}
*/

function generateImageBackgroundGLSL(image) {
    const palette = image.palette;
    const indexedColors = image.indexedColors;
    const backgroundColor = image.backgroundColor;
    console.log(backgroundColor);

    let stringOut = '';
    let caseNumber = 0;
    for (let i = 0; i < palette.length; i++) {
        
        console.log(palette[i]);

        if (palette[i].toString() !== [0, 0, 0, 0].toString()) { // If the color is not transparent
            for (let j = 0; j < indexedColors.length; j++) {
                if (i === indexedColors[j]) {
                    stringOut += `\n\t\t\tcase ${j}:`
                    //console.log(i, palette[i])
                    caseNumber++;
                }
            }
            
            stringOut += `\n\t\t\t\treturn vec3(${palette[i][0]}, ${palette[i][1]}, ${palette[i][2]});`;
        }
        //stringOut = '';
    }
    stringOut += `\n\t\t\tdefault:\n\t\t\t\treturn vec3(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b});`;
    
    let genCode = 
    
    `
vec3 pColor(ivec2 RealPixelPos, ivec2 imageSize) {
    int pixelI = RealPixelPos.y * imageSize.x + RealPixelPos.x;
    switch(pixelI) {
        ${stringOut}
    }
}
    `;

    console.log(genCode, `Total Cases Number: ${caseNumber}`);
}