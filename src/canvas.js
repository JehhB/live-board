import { effect } from "@vue/reactivity";
import { role } from "./stores";
import socket from "./socket";
import throttle from "lodash/throttle";


const path = {
  id: Math.random(),
  paths: [],
};

export default function() {
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');

  let drawing = false;

  let width, height;


  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
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
    path.paths.push([]);
    drawing = true;
    draw(e);
  }

  function stopDrawing(e) {
    e.preventDefault();
    drawing = false;
    ctx.beginPath();
    console.log(path);
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing) return;
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    drawLine(x, y);
  }

  function drawLine(x, y) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    socket.emit('draw', { x: x / width, y: y / height });
    console.log(path.paths.at(-1));
    path.paths.at(-1).push([x / width, y / height]);
  }

  socket.on('draw', (data) => {
    let { x, y } = data;
    x *= width;
    y *= height;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  document.addEventListener('fullscreenchange', resizeCanvas);
}
