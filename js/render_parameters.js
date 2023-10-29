const paletteQuality = document.querySelector('#paletteQuality');
const paletteQualityValue = document.querySelector('#paletteQualityValue');
const renderResolution = document.querySelector('#renderResolution');
const renderResolutionValue = document.querySelector('#renderResolutionValue');
const channelQuantity = document.querySelector('#channelQuantity');
const channelQuantityValue = document.querySelector('#channelQuantityValue');
const colorCount = document.querySelector('#colorCount');
const quantDiv = document.querySelector('#quant');
const bitsDiV = document.querySelector('#bits');

let compressionMode;


paletteQuality.addEventListener('input', () => {
    paletteQualityValue.textContent = paletteQuality.value;
});

renderResolution.addEventListener('input', () => {
    renderResolutionValue.textContent = renderResolution.value;
});

channelQuantity.addEventListener('input', () => {
    channelQuantityValue.textContent = channelQuantity.value;
    colorCount.textContent = `There are ${(channelQuantity.value**3)} possible colors.`;
});

function paletteQualityButton(value) {
    paletteQualityValue.textContent = paletteQuality.value = parseInt(paletteQuality.value) + value;
}

function renderResButton(value) {
    renderResolutionValue.textContent = renderResolution.value = parseInt(renderResolution.value) + value;
}

function channelQuantityButton(value) {
    channelQuantityValue.textContent = channelQuantity.value = parseInt(channelQuantity.value) + value;
    colorCount.textContent = `There are ${channelQuantity.value**3} possible colors.`;
}



function displayMethod(method) {
    compressionMode = method;
    quantDiv.style.display = method == "quant" ? "block" : "none";
    bitsDiV.style.display = method == "bits" ? "block" : "none";
}

displayMethod("quant");