// Lista de inputs
let inputs = ["features_input", "bugs_input", "health_input"];
let values = inputs.map(id => document.getElementById(id));
let textContent = inputs.map(id => id.replace('_input', '_value'));

// Añadir event listeners a los inputs
values.forEach(input => input.addEventListener("input", updateSum));

let lastInputs = [];

function updateSum(event) {
    let total = values.reduce((sum, input) => sum + parseInt(input.value), 0);
    if (total > 10) {
        let diff = total - 10;
        for (let i = lastInputs.length - 1; i >= 0 && diff > 0; i--) {
            let value = parseInt(lastInputs[i].value);
            if (value >= diff) {
                lastInputs[i].value = value - diff;
                diff = 0;
            } else {
                lastInputs[i].value = 0;
                diff -= value;
            }
        }
    }
    textContent.forEach((id, index) => document.getElementById(id).textContent = values[index].value);
    if (lastInputs[lastInputs.length - 1] !== event.target) {
        lastInputs.push(event.target);
    }
    while (lastInputs.length > values.length) {
        lastInputs.shift();
    }
}
