import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, and get its width and height.
const universe = Universe.new_random(128, 128);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const imgData = new ImageData(width, height);

const playPauseButton = document.getElementById("play-pause");
const randomButton = document.getElementById("random");
const clearButton = document.getElementById("clear");
const ticksSlider = document.getElementById("ticks");
const ticksLabel = document.getElementById("ticks_label");
const label_base = ticksLabel.textContent
let ticks = ticksSlider.value;

let animationId = null;

const updateTicks = () => {
    ticks = ticksSlider.value;
    ticksLabel.textContent = label_base + ticks
}

const renderLoop = () => {
    updateTicks()
    for (let i=0; i<ticks; i++) {
        universe.tick();
    };

    fps.render()

    drawCells();
    drawGrid();

    animationId = requestAnimationFrame(renderLoop);
};

const draw = () => {
    drawCells();
    drawGrid();
};

const isPaused = () => {
    return animationId === null;
};

const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop();
}

const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
}

playPauseButton.addEventListener("click", event => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});

const getIndex = (row, column) => {
  return row * width + column;
};

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height / 8 ) + 1);

    ctx.beginPath();

    ctx.fillStyle = DEAD_COLOR

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);
            let p = Math.floor(idx/8);
            let val = (cells[p] & (0x1 << (idx % 8)))

            let level = val === 0 ? 255 : 0;

            let pos = ((row * width) + col) * 4;
            imgData.data[pos] = level;
            imgData.data[pos+1] = level;
            imgData.data[pos+2] = level;
            imgData.data[pos+3] = 255;
        }
    }
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(imgData,0,0);
    ctx.drawImage(canvas, 0, 0, (CELL_SIZE + 1) * canvas.width, (CELL_SIZE + 1) * canvas.height);
};

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};

const toggle = (row, col) => {
    universe.toggle_cell(row, col);
}

const set = (row, col) => {
    universe.set_cell(row % height, col % width);
}

const clear = (row, col) => {
    universe.clear_cell(row % height, col % width);
}

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    if (event.ctrlKey && event.shiftKey) {
        set(row-1, col);
        set(row, col);
        set(row+1, col);
    } else if (event.ctrlKey) {
        set(row-1, col+1);
        set(row, col+1);
        set(row+1, col+1);
        set(row+1, col);
        set(row, col-1);
    } else if (event.altKey && event.shiftKey) {
        clear(row, col);
    } else if (event.shiftKey) {
        set(row, col);
    } else {
        toggle(row, col);
    }

    draw();
});

randomButton.addEventListener("click", event => {
    universe.random();
    draw();
});

clearButton.addEventListener("click", event => {
    universe.clear();
    draw();
});

play();
