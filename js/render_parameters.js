const paletteQuality = document.querySelector('#paletteQuality');
const paletteQualityValue = document.querySelector('#paletteQualityValue');
const renderResolution = document.querySelector('#renderResolution');
const renderResolutionValue = document.querySelector('#renderResolutionValue');

paletteQuality.addEventListener('input', () => {
    paletteQualityValue.textContent = paletteQuality.value;
});

renderResolution.addEventListener('input', () => {
    renderResolutionValue.textContent = renderResolution.value;
});

function paletteQualityButton(value) {
    paletteQualityValue.textContent = paletteQuality.value = parseInt(paletteQuality.value) + value;
}

function renderResButton(value) {
    renderResolutionValue.textContent = renderResolution.value = parseInt(renderResolution.value) + value;
}
