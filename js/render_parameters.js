const paletteQuality = document.querySelector('#paletteQuality');
const paletteQualityValue = document.querySelector('#paletteQualityValue');

paletteQuality.addEventListener('input', () => {
    paletteQualityValue.textContent = paletteQuality.value;
});



