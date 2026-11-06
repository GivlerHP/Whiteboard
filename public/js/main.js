const canvas = document.querySelector('#board');
const context = canvas.getContext('2d');
const color = document.querySelector('#color');
const width = document.querySelector('#width');
const clear = document.querySelector('#clear');
const tool = document.querySelector('#tool');
let drawing = null;

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
    color: drawing.color, width: drawing.width,
  });
}

function drawShape(to) {
  context.putImageData(drawing.snapshot, 0, 0);
  const x = drawing.start.x * canvas.width;
  const y = drawing.start.y * canvas.height;
  const dx = (to.x - drawing.start.x) * canvas.width;
  const dy = (to.y - drawing.start.y) * canvas.height;
  context.strokeStyle = drawing.color;
  context.lineWidth = drawing.width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  if (drawing.tool === 'rectangle') {
    context.rect(x, y, dx, dy);
  } else if (drawing.tool === 'circle') {
    context.arc(x, y, Math.hypot(dx, dy), 0, Math.PI * 2);
  } else {
    context.moveTo(x, y);
    context.lineTo(x + dx, y + dy);
  }
  context.stroke();
}

canvas.addEventListener('pointerdown', (event) => {
  if (drawing !== null || event.button !== 0) return;
  canvas.setPointerCapture(event.pointerId);
  const start = point(event);
  drawing = {
    pointerId: event.pointerId,
    previous: start,
    start,
    snapshot: tool.value === 'pen' ? null : context.getImageData(0, 0, canvas.width, canvas.height),
    tool: tool.value,
    color: color.value,
    width: Number(width.value),
  };
  if (drawing.tool === 'pen') drawSegment(start, start);
});

canvas.addEventListener('pointermove', (event) => {
  if (!drawing || event.pointerId !== drawing.pointerId) return;
  const next = point(event);
  if (drawing.tool === 'pen') drawSegment(drawing.previous, next);
  else drawShape(next);
  drawing.previous = next;
});

function stop(event) {
  if (!drawing || event.pointerId !== drawing.pointerId) return;
  if (event.type === 'pointerup') {
    if (drawing.tool === 'pen') drawSegment(drawing.previous, point(event));
    else drawShape(point(event));
  } else if (drawing.snapshot) {
    context.putImageData(drawing.snapshot, 0, 0);
  }
  const pointer = drawing.pointerId;
  drawing = null;
  if (canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
}

canvas.addEventListener('pointerup', stop);
canvas.addEventListener('pointercancel', stop);
canvas.addEventListener('lostpointercapture', stop);

function clearBoard() {
  const pointer = drawing ? drawing.pointerId : null;
  drawing = null;
  if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

clear.addEventListener('click', clearBoard);
