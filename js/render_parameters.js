const paletteQuality = document.querySelector('#paletteQuality');
const paletteQualityValue = document.querySelector('#paletteQualityValue');
const renderResolution = document.querySelector('#renderResolution');
const renderResolutionValue = document.querySelector('#renderResolutionValue');
const channelQuantity = document.querySelector('#channelQuantity');
const channelQuantityValue = document.querySelector('#channelQuantityValue');
const colorAmount = document.querySelector('#colorAmount');
const colorCount = document.querySelector('#colorCount');
const quantDiv = document.querySelector('#quant');
const bitsDiV = document.querySelector('#bits');

let compressionMode;


paletteQuality.addEventListener('input', () => {
    paletteQualityValue.textContent = paletteQuality.value;
    displayWaningText();
});

renderResolution.addEventListener('input', () => {
    renderResolutionValue.textContent = renderResolution.value;
    displayWaningText();
});

channelQuantity.addEventListener('input', () => {
    channelQuantityValue.textContent = channelQuantity.value;
    colorAmount.textContent = `☞ There are ${(channelQuantity.value**3)} possible colors.`;
    displayColorCount(0);
    displayWaningText();
});

function modifyValue(value, element) {
    const el = document.querySelector(`#${element.id}`);
    const el_value = document.querySelector(`#${element.id}Value`);
    el_value.textContent = el.value = parseInt(el.value) + value;

    if (element == "channelQuantity") {
        colorAmount.textContent = `☞ There are ${el.value**3} possible colors.`;
        displayColorCount(0);
    }
    displayWaningText();
}

function displayColorCount(count) {
    colorCount.style.display = count ? "block" : "none";
    colorCount.textContent = `The generated image color palette contains ${count} colors`;
}


function displayMethod(method) {
    compressionMode = method;
    quantDiv.style.display = method == "quant" ? "block" : "none";
    bitsDiV.style.display = method == "bits" ? "block" : "none";
}

displayMethod("quant");