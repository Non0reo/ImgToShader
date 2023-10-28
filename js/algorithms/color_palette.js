function mostSimilarColor(image, palette) {
    console.log(image, palette);
    // Loop through each pixel in the image
    for (let i = 0; i < image.data.length; i += 4) {
        let pixelColor = [image.data[i], image.data[i+1], image.data[i+2]];
        let maxSimilarity = -Infinity;
        let mostSimilarColor = null;
        
        // For each pixel, calculate the similarity between its color and each color in the palette array
        for (let j = 0; j < palette.length; j++) {
            let paletteColor = palette[j];
            let similarity = (
                (255 - Math.abs(pixelColor[0] - paletteColor[0])) +
                (255 - Math.abs(pixelColor[1] - paletteColor[1])) +
                (255 - Math.abs(pixelColor[2] - paletteColor[2]))
            ) / 3;
            
            // Find the color in the palette array that has the highest similarity to the pixel's color
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                mostSimilarColor = paletteColor;
            }
        }
        
        // Replace the pixel's color with the most similar color from the palette array
        image.data[i] = mostSimilarColor[0];
        image.data[i+1] = mostSimilarColor[1];
        image.data[i+2] = mostSimilarColor[2];
    }
    
    // Return the modified image
    return image;
}
