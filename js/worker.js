const DIVISION_HEIGHT = 4;

onmessage = function(e) {
    let colorData = e.data[0];
    let imageData = e.data[1];
    let chunkSizeHeight = Math.abs(imageData.boundingBox.maxY - imageData.boundingBox.minY) / DIVISION_HEIGHT;
    console.log(chunkSizeHeight)

    const colorDataDivided = colorData.data.length / DIVISION_HEIGHT;
    let dividedColection = [];
    console.log(e, colorData, colorData.data.length)

    
    for (let i = 0; i < DIVISION_HEIGHT; i += DIVISION_HEIGHT) {
        let colorList = "";
        for (let j = colorDataDivided * i; j < colorDataDivided * (i + 1); j += 4) { //Iterate through the pixels (rgba) throught a divided part of the image

            if (j + 3 == 0) continue;
            console.log(colorData.data[j] + " " + colorData.data[j + 1] + " " + colorData.data[j + 2] + " " + colorData.data[j + 3]);
            colorList += createIfStatement( "test", `fragColor = vec4(${colorData.data[j]}, ${colorData.data[j + 1]}, ${colorData.data[j + 2]}, color.a);`, (j == 0) ? false : true, true) + "\n";   
        }

        dividedColection.push(createIfStatement(`gl_FragCoord.y <= ${imageData.boundingBox.minY + chunkSizeHeight * i} && gl_FragCoord.y >= ${imageData.boundingBox.minY + chunkSizeHeight * (i + 1)}`, colorList, (i == 0) ? false : true, false));
    }


    console.log(dividedColection);
    /* this.postMessage({
        result: result,
        colorList: colorList
    }); */
}


//Create if statement
function createIfStatement(condition, code, IsElseIf, IsOneLine) {
    if (IsOneLine) return ((IsElseIf) ? "else " : "") + "if (" + condition + ") " + code;
        return [
            ((IsElseIf) ? "else " : "") + "if (" + condition + ") {",
            "\t\t" + code,
            "\t}"
        ].join("\n");
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