const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')

context.scale(20, 20)

const Pieces = {
  'T': [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  'O': [
    [2, 2],
    [2, 2],
  ],
  'L': [
    [0, 3, 0],
    [0, 3, 0],
    [0, 3, 3],
  ],
  'J': [
    [0, 4, 0],
    [0, 4, 0],
    [4, 4, 0],
  ],
  'S': [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  'Z': [
    [6, 6, 0],
    [0, 6, 6],
    [0, 0, 0],
  ],
  'I': [
    [0, 7, 0, 0],
    [0, 7, 0, 0],
    [0, 7, 0, 0],
    [0, 7, 0, 0]
  ]
}

const player = {
  matrix: Pieces['T'],
  offset: {x:0, y:0},
  score: 0,
}

function updateScore() {
  document.getElementById('score').innerText = player.score
}

const createMatrix = (w, h) => {
  const matrix = []
  while(h--) {
    matrix.push(new Array(w).fill(0))
  }
  return matrix
}

const arena = createMatrix(12, 20)


const collide = (arena, player) => {
  const [m, o] = [player.matrix, player.offset]
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true
      }
    }
  }
  return false
}

const merge = (arena, player) => {
  player.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        arena[y + player.offset.y][x + player.offset.x] = val
      }
    })
  })
}

const clearLine = () => {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; y -= 1) {
    for (let x = 0; x < arena[y].length; x += 1) {
      if (arena[y][x] === 0) {
        continue outer
      }
    }

    const row = arena.splice(y, 1)[0].fill(0)
    arena.unshift(row)
    y += 1

    player.score += rowCount * 10
    rowCount *= 2
  }
}

const playerMove = (dir) => {
  player.offset.x += dir
  while (collide(arena, player)) {
    player.offset.x -= dir
  }
}

const playerDrop = () => {
  player.offset.y += 1
  if (collide(arena, player)){
    player.offset.y -= 1
    merge(arena, player)
    reset()
    clearLine()
    updateScore()
  }
  dropCounter = 0
}

const playerRotate = (matrix, dir) => {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < y; x += 1) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse())
  } else {
    matrix.reverse()
  }
  let offset = 1
  const posX = player.offset.x
  while(collide(arena, player)) {
    player.offset.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > player.matrix[0].length) {
      playerRotate(matrix, -dir)
      player.offset.x = posX
      return
    }
  }
}

const colors = [
  null,
  '#DD1C1A',
  '#E56399',
  '#6517A7',
  '#F0C808',
  '#2660A4',
  '#D76A03',
  '#2CDA9D',
]

const drawPiece = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if(val !== 0) {
        context.fillStyle = colors[val]
        context.fillRect(x + offset.x, y + offset.y, 1, 1)
      }
    })
  })
}

const draw = () => {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  drawPiece(arena, {x: 0, y: 0})
  drawPiece(player.matrix, player.offset)
}


let dropCounter = 0
let dropInterval = 1000

let lastTime = 0

const reset = () => {
  const pieces = 'TOLJSZI'
  player.matrix = Pieces[pieces[Math.random() * 7 | 0]]
  player.offset.y = 0
  player.offset.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    player.score = 0
    updateScore()
  }
}

const update = (time = 0) => {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime
  if (dropCounter > dropInterval) {
    playerDrop()
  }
  draw()
  requestAnimationFrame(update)
}

document.addEventListener('keydown', (e) => {
  if (e.keyCode === 37) {
    playerMove(-1)
  } else if (e.keyCode === 39) {
    playerMove(1)
  } else if (e.keyCode === 40) {
    playerDrop()
  } else if (e.keyCode === 81) {
    playerRotate(player.matrix, 1)
  } else if (e.keyCode === 87) {
    playerRotate(player.matrix, -1)
  }
})

reset()
updateScore()
update()
