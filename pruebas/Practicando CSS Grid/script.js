const grid = document.getElementById('grid')

function addBox () {
  if (grid.children.length >= 25) return

  const box = document.createElement('div')
  box.classList.add('box')

  document.startViewTransition
    ? document.startViewTransition(() => grid.appendChild(box))
    : grid.appendChild(box)
}

function removeBox () {
  if (grid.children.length <= 1) return

  const box = grid.querySelector(':scope > :last-child')

  document.startViewTransition
    ? document.startViewTransition(() => grid.removeChild(box))
    : grid.removeChild(box)
}
