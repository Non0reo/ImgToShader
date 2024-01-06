

self.onmessage = function(e) {

    const data = JSON.parse(e.data);

    let result = [];
    data.generalInfos.shader.json.forEach(element => {
        result.push(generateShaderJson(element));
    });

    const guiFSHcode = generateGUIFSH(data)[0];
    const loadingBarCondition = generateGUIFSH(data)[1];

    const imgBackground = data.imageExists ? generateImageBackgroundGLSL(data) : ["", 0];

    //Shader +1.20
    if(data.generalInfos.shader.version === 1) {

        if(data.imageExists) {
            this.postMessage({
                guiOverlayFSH: generateGUIOverlayFSH(data),
                guiOverlayVSH: generateGUIOverlayVSH(),
                guiFSH: guiFSHcode,
                positionTexFSH: generatePositionTexFSH(data),
                utilsGLSL: generateUtilsGLSL(),
                imagesAlgo: imgBackground[0],
                shaderJson: result,
                genInfos: {
                    imageExists: true,
                    caseCount: imgBackground[1].caseCount,
                    zones: imgBackground[1].zones
                }
            });
        } else {
            this.postMessage({
                guiOverlayFSH: generateGUIOverlayFSH(data),
                guiFSH: guiFSHcode,
                positionTexFSH: generatePositionTexFSH(data),
                shaderJson: result,
                genInfos: {
                    imageExists: false,
                    caseCount: imgBackground[1].caseCount,
                    zones: imgBackground[1].zones
                }
            });
        }

    //Shader -1.20
    } else {

        if(data.imageExists) {
            this.postMessage({
                positionColorFSH: generateGUIOverlayFSH(data, loadingBarCondition),
                positionTexFSH: generatePositionTexFSH(data),
                guiOverlayVSH: generateGUIOverlayVSH(), //used as positionColorVSH
                utilsGLSL: generateUtilsGLSL(),
                imagesAlgo: imgBackground[0],
                shaderJson: result,
                genInfos: {
                    imageExists: true,
                    caseCount: imgBackground[1].caseCount,
                    zones: imgBackground[1].zones
                }
            });
        } else {
            this.postMessage({
                positionColorFSH: generateGUIOverlayFSH(data, loadingBarCondition),
                positionTexFSH: generatePositionTexFSH(data),
                shaderJson: result,
                genInfos: {
                    imageExists: false,
                    caseCount: imgBackground[1].caseCount,
                    zones: imgBackground[1].zones
                }
            });
        }

    }
}


//Background color and Images (can be either rendertype_gui_overlay or position_color)
function generateGUIOverlayFSH(data, loadingBarCondition = "") {
    const backgroundColor = data.generalInfos.backgroundColor;

    let alpha;
    let gen_Frag;
    if (backgroundColor.colorHEX != "#EF323D" || !backgroundColor.draw) {
        alpha = (backgroundColor.draw) ? (backgroundColor.color.IsAlphaChanged ? ("color.a - " + ((1.0 - backgroundColor.color.a))) : "color.a") : "0.0";
        gen_Frag = backgroundColor.draw ? `fragColor = vec4(vec3(${backgroundColor.color.r}, ${backgroundColor.color.g}, ${backgroundColor.color.b}) / 255, ${alpha});` : `discard;`
    }

    if (data.imageExists) {
        switch (data.generalInfos.shader.renderMethod) {
            case 'case':
                gen_Frag = `vec3 newColor = pColor(RealPixelPos, imageSize) / 255;\n\tfragColor = vec4(newColor, color.a);`;
                break;
            case 'if':
                //gen_Frag = `vec4 f = vec4(0.0);\n\tpColor(RealPixelPos, f, color.a);\n\tfragColor = f;`;
                gen_Frag = `pColor(RealPixelPos, fragColor, color.a);`;
                break;
            default:
                break;
        }
    }

    let gen_Image = data.imageExists ? `
    vec2 RealSSize = getScreenSize(ProjMat, ScreenSize);
    vec2 pixelUnit = RealSSize.xy / imageSize.xy;
    ivec2 RealPixelPos = getPixelPos(pixelUnit, pos.xy);
` : ``;

    let backgroundCondition = `
    if (color.r == 239.0 / 255.0${data.generalInfos.accessibilityCompatibility ? ` || color.rgb == vec3(0.0)` : ``}) {
        ${gen_Frag}
    }
`;

    return data.imageExists ? `/*
 Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

#define WIDTH ${data.imageData.width}
#define HEIGHT ${data.imageData.height}

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
    ${gen_Image}
    ${gen_Frag ? backgroundCondition : ''}${loadingBarCondition}
}` : `/*
 Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

in vec4 vertexColor;

uniform vec4 ColorModulator;
uniform mat4 ProjMat;

out vec4 fragColor;

void main() {
    vec4 color = vertexColor;
    if (color.a == 0.0) discard;

    fragColor = color * ColorModulator;
    ${gen_Frag ? backgroundCondition : ''}${loadingBarCondition}
}`;
}

function generateGUIOverlayVSH() {
    return `#version 150

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
}`;
}

//Also return the bit needed for the positionColorFSH
function generateGUIFSH(data) {
    const loadingBarColor = data.generalInfos.loadingBarColor;
    const backgroundColor = data.generalInfos.backgroundColor;

    let gen_Frag = '';
    if (loadingBarColor.colorHEX != "#FFFFFF" || !loadingBarColor.draw) {
        let colorData = loadingBarColor;
        if (!loadingBarColor.draw) {
            if (backgroundColor.draw) colorData = data.generalInfos.backgroundColor.color;
            else colorData = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: false};
        }

        let alpha;
        if (loadingBarColor.draw) {
            if (colorData.IsAlphaChanged) alpha = "color.a - " + ((1.0 - colorData.color.a));
            else alpha = "color.a";
        } else {
            if (backgroundColor.draw) alpha = "color.a";
            else alpha = "0.0";
        }

        gen_Frag = `
    if(color.rgb == vec3(1.0)${data.generalInfos.shader.version === 0 ? ` && color.a != 128.0 / 255.0` : ``}) {
        ${loadingBarColor.draw ? `fragColor = vec4(vec3(${colorData.color.r}, ${colorData.color.g}, ${colorData.color.b}) / 255, ${alpha});` : `discard;`}
    }
`;

    }

    return [`/*
 Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

in vec4 vertexColor;

uniform vec4 ColorModulator;

out vec4 fragColor;

void main() {
    vec4 color = vertexColor;
    if (color.a == 0.0) discard;

    fragColor = color * ColorModulator;
${gen_Frag}
}`, gen_Frag];

}

function generatePositionTexFSH(data) {
    const mojangLogoColor = data.generalInfos.mojangLogoColor;

    let gen_Frag = '';
    if (mojangLogoColor.colorHEX != "#FFFFFF" || !mojangLogoColor.draw) {
        let colorData = mojangLogoColor;
        if (!mojangLogoColor.draw) colorData = {color: {r: "0.0", g: "0.0", b: "0.0", a: "0.0"}, IsAlphaChanged: false};

        let alpha = (mojangLogoColor.draw) ? (colorData.IsAlphaChanged ? ("color.a * ColorModulator.a - " + ((1.0 - colorData.color.a))) : "color.a * ColorModulator.a") : "0.0";
        gen_Frag = `
    if(texelFetch(Sampler0, ivec2(267, 146), 0) == vec4(1)) {
        ${mojangLogoColor.draw ? `fragColor = vec4(vec3(${colorData.color.r}, ${colorData.color.g}, ${colorData.color.b}) / 255, ${alpha});` : `discard;`}
    }
`;

    }

    return `/*
 Generated from https://non0reo.github.io/ImgToShader/
*/

#version 150

uniform sampler2D Sampler0;
uniform vec4 ColorModulator;

in vec2 texCoord0;

out vec4 fragColor;

void main() {
    vec4 color = texture(Sampler0, texCoord0);
    if (color.a == 0.0) discard;
    
    fragColor = color * ColorModulator;
    ${gen_Frag}
}`;
}

function generateUtilsGLSL() {

return `/*
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
}`;

}

function generateShaderJson(filename) {
return [`{
    "blend": {
        "func": "add",
        "srcrgb": "srcalpha",
        "dstrgb": "1-srcalpha"
    },
    "vertex": "${filename}",
    "fragment": "${filename}",
    "attributes": [
        "Color"
    ],
    "samplers": [
    ],
    "uniforms": [
        { "name": "ModelViewMat", "type": "matrix4x4", "count": 16, "values": [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] },
        { "name": "ProjMat", "type": "matrix4x4", "count": 16, "values": [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] },
        { "name": "ColorModulator", "type": "float", "count": 4, "values": [ 1.0, 1.0, 1.0, 1.0 ] },
        { "name": "ScreenSize", "type": "float", "count": 2, "values": [ 1.0, 1.0 ] }
    ]
}
`, filename];
}


function generateImageBackgroundGLSL(data) {
    const palette = data.palette;
    const indexedColors = data.indexedColors;
    const backgroundColor = data.generalInfos.backgroundColor.color;
    const imageData = data.imageData;

    let stringOut = '';
    let ColorOut = '';
    let caseNumber = 0;

    switch (data.generalInfos.shader.renderMethod) {
        case 'case':
            
            for (let i = 0; i < palette.length; i++) {
                console.log(palette[i].toString(), [backgroundColor.r, backgroundColor.g, backgroundColor.b, parseInt(backgroundColor.a * 255)].toString(), palette[i].toString() !== [backgroundColor.r, backgroundColor.g, backgroundColor.b, parseInt(backgroundColor.a * 255)].toString())
                if (palette[i].toString() !== [0, 0, 0, 0].toString() && palette[i].toString() !== [backgroundColor.r, backgroundColor.g, backgroundColor.b, parseInt(backgroundColor.a * 255)].toString()) { // If the color is not transparent and not the background color
                    for (let j = 0; j < indexedColors.length; j++) {
                        if (i === indexedColors[j]) {
                            stringOut += `\n\t\tcase ${j}:`
                            caseNumber++;
                        }
                    }
                    stringOut += `\n\t\t\treturn vec3(${palette[i][0]}, ${palette[i][1]}, ${palette[i][2]});`;
                }
            }
            stringOut += `\n\t\tdefault:\n\t\t\treturn vec3(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b});`;
            

return [`/*
Generated from https://non0reo.github.io/ImgToShader/
*/

vec3 pColor(ivec2 RealPixelPos, ivec2 imageSize) {
    int pixelI = RealPixelPos.y * imageSize.x + RealPixelPos.x;
    switch(pixelI) {
        ${stringOut}
    }
}
`, {caseCount: caseNumber}];

        case 'if':
       
            //Actual Pixel by number : RealPixelPos.y * imageSize.x + RealPixelPos.x
            let markedPixels = [];
            let finalZones = [];
            let finalColors = [];
            let differencePos = {}; //Position of the pixel that is different from the actual pixel (used in the checkZone function)

            //build the string ColorOut
            for(let i = 0 ; i < palette.length ; i++) {
                if(palette[i].toString() !== [0, 0, 0, 0].toString() && palette[i].toString() !== [backgroundColor.r, backgroundColor.g, backgroundColor.b, parseInt(backgroundColor.a * 255)].toString()) {
                    finalColors.push(palette[i]);
                }
            }

            for(let i = 0 ; i < finalColors.length ; i++) {
                ColorOut += `\tvec3(${finalColors[i][0]}, ${finalColors[i][1]}, ${finalColors[i][2]})`;
                if(i !== finalColors.length - 1) ColorOut += ',\n';
            }
            

            for (let y = 0 ; y < imageData.height; y++) {

                for(let x = 0 ; x < imageData.width ; x++) {
                    const pixelI = y * imageData.width + x;

                    if(palette[indexedColors[pixelI]].toString() !== [0, 0, 0, 0].toString() && 
                    palette[indexedColors[pixelI]].toString() !== [backgroundColor.r, backgroundColor.g, backgroundColor.b, parseInt(backgroundColor.a * 255)].toString() && 
                        !markedPixels.includes(pixelI)) {

                            //for(let xOffset = x ; x )
                        let actualPixelColor = palette[indexedColors[pixelI]];
                        let offset = {
                            x: 0,
                            y: 0
                        };

                        //Check if the zone contains the same color
                        const checkZone = (param) => {
                            for(let line = param.pos1.y; line < param.pos2.y + 1 ; line++) {
                                for(let column = param.pos1.x; column < param.pos2.x + 1 ; column++) {
                                    if(palette[indexedColors[column + line * imageData.width]] !== param.color) {
                                        differencePos = {
                                            x: column,
                                            y: line
                                        };
                                        return [column, line];
                                    }
                                }
                            }
                            differencePos = {x: -1, y: -1}
                            return true;
                        }

                        while (palette[indexedColors[pixelI + offset.x]] === actualPixelColor &&
                            !markedPixels.includes(pixelI + offset.x) &&
                            x + offset.x < imageData.width ) {
                            
                            //markedPixels.push(pixelI + offset.x);
                            offset.x++;
                            
                        }
                        offset.x--;

                        
                        let zoneList = [];

                        while(x <= x + offset.x && y <= y + offset.y) {
                            let offsetedActualPixel = pixelI + offset.x + offset.y * imageData.width;
                            while (palette[indexedColors[offsetedActualPixel]] === actualPixelColor &&
                                !markedPixels.includes(offsetedActualPixel) &&
                                y + offset.y < imageData.height &&
                                checkZone({
                                    pos1: {
                                        x: x,
                                        y: y
                                    },
                                    pos2: {
                                        x: x + offset.x,
                                        y: y + offset.y
                                    },
                                    color: palette[indexedColors[offsetedActualPixel]]
                                }) === true) {
                                
                                //markedPixels.push(pixelI + offset.x);
                                offset.y++;
                                offsetedActualPixel = pixelI + offset.x + offset.y * imageData.width;
                            }
                            offset.y--;
                            zoneList.push([offset.x, offset.y]);
                            offset.x--;
                            //offset.x = differencePos.x;
                            offset.y = 0;
                        }  
                        
                        const getBestZone = (zoneList) => {
                            let bestZone = {
                                width: 0,
                                height: 0
                            };
                            for(let i = 0 ; i < zoneList.length ; i++) {
                                if((zoneList[i][0] + 1) * (zoneList[i][1] + 1) > (bestZone.width + 1) * (bestZone.height + 1)) {
                                    bestZone = {
                                        width: zoneList[i][0],
                                        height: zoneList[i][1]
                                    };
                                }
                            }
                            return bestZone;
                        }

                        const markAllPixels = (zone, [x, y]) => {
                            for(let line = y ; line < zone.height + y + 1 ; line++) {
                                for(let column = x ; column < zone.width + x + 1 ; column++) {
                                    markedPixels.push(column + line * imageData.width);
                                }
                            }
                        }

                        const color = palette[indexedColors[pixelI]];
                        const bestZone = getBestZone(zoneList);
                        markAllPixels(bestZone, [x, y]);
                        //console.log(pixelI, {x, y, width: bestZone.width + 1, height: bestZone.height + 1})

                        const zone ={
                            x: x,
                            y: y,
                            x2: x + bestZone.width,
                            y2: y + bestZone.height,
                            width: bestZone.width + 1,
                            height: bestZone.height + 1,
                            color: color
                        }

                        finalZones.push(zone);

                        //compare the actual color with the parlette and get the index
                        let colorIndex = 0;
                        for(let i = 0 ; i < finalColors.length ; i++) {
                            if(finalColors[i].toString() === color.toString()) {
                                colorIndex = i;
                                break;
                            }
                        }
                        
                        //stringOut += `\n\tif(f.a == 0) zCol(r, ${x + y * imageData.width}, ${zone.x2 + zone.y2 * imageData.width}, vec3(${color[0]}, ${color[1]}, ${color[2]}), f, t);`;
                        const pixelI1 = x + y * imageData.width;
                        const pixelI2 = zone.x2 + zone.y2 * imageData.width;

                        if(pixelI1 === pixelI2) stringOut += `\n\tif(f.a == 0 && r == ivec2(${x}, ${y})) f = vec4(c[${colorIndex}] / 255, t);`;
                        else stringOut += `\n\tif(f.a == 0) zCol(r, ${x + y * imageData.width}, ${zone.x2 + zone.y2 * imageData.width}, c[${colorIndex}], f, t);`;
                        
                    }                      
                }
            }
            

            console.log(finalColors);                  


return [`/*
Generated from https://non0reo.github.io/ImgToShader/
*/

void zCol(ivec2 r, int pI1, int pI2, vec3 c, out vec4 f, float t) {
	ivec2 p1 = ivec2(pI1 % ${imageData.width}, pI1 / ${imageData.width});
	ivec2 p2 = ivec2(pI2 % ${imageData.width}, pI2 / ${imageData.width});
	if(p1.x <= r.x && r.x <= p2.x && p1.y <= r.y && r.y <= p2.y) f = vec4(c / 255, t);
}

vec3[] c = vec3[](
${ColorOut}
);

void pColor(ivec2 r, out vec4 f, float t) {
    ${stringOut}
    ${data.generalInfos.backgroundColor.draw ? `if(f.a == 0) f = vec4(vec3(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}) / 255, t);` : ``}
}
`, {caseCount: finalZones.length, zones: finalZones}];

    }
}