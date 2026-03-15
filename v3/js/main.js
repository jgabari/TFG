// Get elements from HTML
const iterateBtn = document.getElementById('iterate_btn')
const resetBtn = document.getElementById('reset_btn')
const downloadBtn = document.getElementById('download_btn')
const uploadBtn = document.getElementById('upload_btn')
const valueDisp = document.getElementById('value_display')
const featuresDisp = document.getElementById('features_display')
const bugsDisp = document.getElementById('bugs_display')
const healthDisp = document.getElementById('health_display')
const budgetDisp = document.getElementById('budget_display')
const inputs = ['features_input', 'bugs_input', 'refactor_input']
const sliders = inputs.map(id => document.getElementById(id))
const values = inputs.map(id => id.replace('input', 'value'))
// let percents = inputs.map(id => id.replace("input", "percent"));
// Initial situation
const myGame = new gameState()

// Check the cookie
if (document.cookie.indexOf('state') !== -1) {
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const parts = cookie.split('=')
    if (parts[0] === 'state') {
      myGame.fromCookie(parts[1])
    }
  }
}

// Allocate the budget in the three different inputs
const prevInputs = []
sliders.forEach(input => input.addEventListener('input', myGame.updateSum))

iterateBtn.addEventListener('click', function () {
  myGame.runIteration(2)
  document.cookie = myGame.toString()
})

resetBtn.addEventListener('click', function () {
  myGame.resetSimulation()
  sliders.forEach(slider => (slider.value = 0))
  // percents.forEach((id, i) => document.getElementById(id).textContent = sliders[i].value);
  values.forEach((id, i) => (document.getElementById(id).textContent = sliders[i].value))
  document.cookie = myGame.toString()
})

downloadBtn.addEventListener('click', function () {
  fetch('/download', {
    method: 'POST',
    body: myGame.toString(),
    headers: { 'Content-Type': 'application/json' }
  })
})

uploadBtn.addEventListener('click', function () {
  fetch('/state.json', {
    method: 'GET'
  })
    .then(response => response.json())
    .then(data => {
      myGame.iteration = data.iteration
      myGame.config = data.config
      myGame.stats = data.stats
      myGame.budget = data.budget
      myGame.updateDisplays()
    })
    .catch(error => {
      console.log('ERROR: ' + error)
    })
})
