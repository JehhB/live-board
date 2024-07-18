import { effect } from "@vue/reactivity";
import { role } from "./stores";
import socket from "./socket";

let id = Math.floor(Math.random() * 1000000);
let signatures = {};

export default function() {

  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');

  let drawing = false;

  let width, height;


  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    redraw();
  }
  document.addEventListener('fullscreenchange', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  ctx.globalAlpha = 1;

  effect(() => {
    if (role.value == 'signatory') {
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('touchend', stopDrawing);
    } else {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    }
  })


  function startDrawing(e) {
    e.preventDefault();
    socket.emit('start', id)
    if (!(id in signatures)) {
      signatures[id] = [];
    }
    signatures[id].push([]);

    drawing = true;
    draw(e);
  }

  function stopDrawing(e) {
    e.preventDefault();
    drawing = false;
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing) return;
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    socket.emit('draw', { x: x / width, y: y / height, id: id });
    signatures[id].at(-1).push({ x: x / width, y: y / height });

    redraw();
  }

  function redraw() {
    ctx.clearRect(0, 0, width, height);

    for (const [id, lines] of Object.entries(signatures)) {
      ctx.strokeStyle = `block`;
      ctx.lineWidth = 2;

      lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line[0][0] * width, line[0][1] * height);
        line.forEach(({ x, y }) => {
          ctx.lineTo(x * width, y * height);
        });
        ctx.stroke();
      });
    }
  }

  socket.on('draw', (data) => {
    let { x, y } = data;
    x *= width;
    y *= height;

    signatures[data.id].at(-1).push({ x: data.x, y: data.y });
    redraw();
  });

  socket.on('start', (id) => {
    if (!(id in signatures)) {
      signatures[id] = [];
    }
    signatures[id].push([]);
  });

  socket.on('clear', (data) => {
    signatures = {};
    redraw();
  });

  socket.on('init', (data) => {
    signatures = data;
    redraw();
  });

  document.addEventListener('fullscreenchange', resizeCanvas);
}
