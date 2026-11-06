const canvas = document.querySelector('#board');
const context = canvas.getContext('2d');
const color = document.querySelector('#color');
const width = document.querySelector('#width');
const clear = document.querySelector('#clear');
let previous = null;
let activePointer = null;

function point(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
  };
}

function draw(line) {
  context.strokeStyle = line.color;
  context.fillStyle = line.color;
  context.lineWidth = line.width;
  context.lineCap = 'round';
  context.beginPath();
  if (line.x1 === line.x2 && line.y1 === line.y2) {
    context.arc(line.x1 * canvas.width, line.y1 * canvas.height, line.width / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.moveTo(line.x1 * canvas.width, line.y1 * canvas.height);
    context.lineTo(line.x2 * canvas.width, line.y2 * canvas.height);
    context.stroke();
  }
}

function drawSegment(from, to) {
  draw({
    x1: from.x, y1: from.y, x2: to.x, y2: to.y,
    color: color.value, width: Number(width.value),
  });
}

canvas.addEventListener('pointerdown', (event) => {
  if (activePointer !== null || event.button !== 0) return;
  activePointer = event.pointerId;
  canvas.setPointerCapture(event.pointerId);
  previous = point(event);
  drawSegment(previous, previous);
});

canvas.addEventListener('pointermove', (event) => {
  if (event.pointerId !== activePointer || !previous) return;
  const next = point(event);
  drawSegment(previous, next);
  previous = next;
});

function stop(event) {
  if (event.pointerId !== activePointer) return;
  if (event.type === 'pointerup' && previous) drawSegment(previous, point(event));
  previous = null;
  activePointer = null;
}

canvas.addEventListener('pointerup', stop);
canvas.addEventListener('pointercancel', stop);
canvas.addEventListener('lostpointercapture', stop);

function clearBoard() {
  previous = null;
  activePointer = null;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

clear.addEventListener('click', clearBoard);
