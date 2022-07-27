const DIVISION_HEIGHT = 16;
const COLOR_PROXIMITY_THRESHOLD = 15;
//Add color presision (compresion)

onmessage = function(e) {
    let colorData = e.data[0];
    let imageData = e.data[1];
    let chunkSizeHeight = Math.abs(imageData.boundingBox.maxY - imageData.boundingBox.minY) / DIVISION_HEIGHT;
    console.log(chunkSizeHeight)

    const colorDataDivided = colorData.data.length / DIVISION_HEIGHT;
    let dividedColection = [];
    let resultList = [];
    let colorList = [];
    console.log(e, colorData, colorData.data.length)

    
    for (let i = 0; i < DIVISION_HEIGHT; i += 1) {
        resultList = [];
        colorList = [];

        console.log("------- NEW SECTION -------")
        colorDefine: for (let j = colorDataDivided * i; j < colorDataDivided * (i + 1); j += 4) { //Iterate through the pixels (rgba) throught a divided part of the image

            
            console.log(j + ": " + colorData.data[j] + " " + colorData.data[j + 1] + " " + colorData.data[j + 2] + " " + colorData.data[j + 3], j / 4 % colorData.width, j / 4 % colorData.height);
            if (colorData.data[j + 3] == 0) continue colorDefine;
            //if (colorList[j - 4] == colorList)
            let pixelPosition = {
                fromX: (j / 4 % colorData.width) + imageData.boundingBox.minX,
                fromY: (j / 4 % colorData.height) + imageData.boundingBox.minY,
                toX: ((j + 4) / 4 % colorData.width) + imageData.boundingBox.minX,
                toY: ((j + 4) / 4 % colorData.height) + imageData.boundingBox.minY
            }

            //If the last pixel is the same as the current pixel, remove the last pixel and add the current pixel with a bigger reach
            if (colorList.length > 0) {
                //const search = colorList.length - 1;
                //console.log(j, colorData.data[j], colorList.length, search, (j / 4), - 1 -((j / 4) - colorList.length - (j / 4)), (j / 4)/* colorList[(j / 4) - 1][0] */ /* colorList[((j - 4) / 4) - 1] */)

                if (/* colorData.data[j] == colorList[colorList.length - 1][0] &&
                    colorData.data[j + 1] == colorList[colorList.length - 1][1] &&
                    colorData.data[j + 2] == colorList[colorList.length - 1][2] &&
                    colorData.data[j + 3] == colorList[colorList.length - 1][3] */
                    colorProximity([colorData.data[j], colorData.data[j + 1], colorData.data[j + 2]], [colorList[colorList.length - 1][0], colorList[colorList.length - 1][1], colorList[colorList.length - 1][2]], COLOR_PROXIMITY_THRESHOLD)) {
                    
                    //remove last elmement of the lists and add the new one with the pixel position 'from' keeped the same
                    let removedElement = colorList.pop();
                    resultList.pop();
                    
                    pixelPosition.fromX = removedElement[4].fromX;
                    pixelPosition.fromY = removedElement[4].fromY;
                }
            }

            colorList.push([colorData.data[j], colorData.data[j + 1], colorData.data[j + 2], colorData.data[j + 3], pixelPosition]);
            resultList.push(`${createIfStatement(`gl_FragCoord.x >= ${pixelPosition.fromX} && gl_FragCoord.y >= ${pixelPosition.fromY} && gl_FragCoord.x <= ${pixelPosition.toX} && gl_FragCoord.y <= ${pixelPosition.toY}`, `fragColor = vec4(${colorData.data[j]}, ${colorData.data[j + 1]}, ${colorData.data[j + 2]}, color.a);`, (resultList.length > 0) ? true : false, true)}\n`);
            //console.log("added", colorList); 
        }

        dividedColection.push(`${createIfStatement(`gl_FragCoord.y >= ${imageData.boundingBox.minY + chunkSizeHeight * i} && gl_FragCoord.y <= ${imageData.boundingBox.minY + chunkSizeHeight * (i + 1)}`, resultList.join(""), (i == 0) ? false : true, false)}`);
    }


    console.log(dividedColection);
    this.postMessage({
        result: dividedColection,
        //colorList: colorList
    });
}


//Create if statement
function createIfStatement(condition, code, IsElseIf, IsOneLine) {
    if (IsOneLine) return `${(IsElseIf) ? "\t\t\telse " : ""}if (${condition}) ${code}`;
        return `${(IsElseIf) ? "\t\telse " : ""}if (${condition}) {
                \t${code}
                }`;
}

function colorProximity(ColorA, ColorB, threshold)
{
    let r = ColorA[0] - ColorB[0],
        g = ColorA[1] - ColorB[1],
        b = ColorA[2] - ColorB[2];
    return (r*r + g*g + b*b) <= threshold*threshold;
}



/* for (let j = 0; j < dataPixel.data.length; j += 4) { //Iterate through the pixels (rgba)

            
    worker.postMessage({
        r: dataPixel.data[j],
        g: dataPixel.data[j + 1],
        b: dataPixel.data[j + 2],
        a: dataPixel.data[j + 3]
    });
    worker.onmessage = function(e) {
        colorList += e.data + ",";
    }
}
colorList = colorList.substring(0, colorList.length - 1);
console.log(colorList);
    console.log(dataPixel.data[j] + " " + dataPixel.data[j + 1] + " " + dataPixel.data[j + 2] + " " + dataPixel.data[j + 3]);
    if (j + 3 != 0) colorList += createIfStatement( "test", `fragColor = vec4(${dataPixel.data[j]}, ${dataPixel.data[j + 1]}, ${dataPixel.data[j + 2]}, color.a);`, (j == 0) ? false : true, true) + "\n";
 */