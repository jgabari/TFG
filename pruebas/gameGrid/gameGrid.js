const container = document.getElementById('container')

const addBtn = document.getElementById('addBox')
const removeBtn = document.getElementById('removeBox')
const improveBtn = document.getElementById('improveBox')

function updateGridTemplate () {
  const boxCount = container.children.length
  const columns = Math.ceil(Math.sqrt(boxCount))
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
  container.style.gridTemplateRows = `repeat(${columns}, 1fr)`
}

addBtn.addEventListener('click', function () {
  const box = document.createElement('div')
  box.classList.add('box')
  container.appendChild(box)
  updateGridTemplate()
})

removeBtn.addEventListener('click', function () {
  const box = container.querySelector('.box:last-child')
  if (box) {
    container.removeChild(box)
    updateGridTemplate()
  }
})

improveBtn.addEventListener('click', function () {
  const allBoxes = document.querySelectorAll('.box')
  allBoxes.forEach(function (element) {
    element.style.background = 'red'
  })
})
