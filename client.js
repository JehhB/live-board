import { reactive } from "@vue/reactivity";
import $ from "jquery";

$(function() {
  console.log(reactive);

  const socket = io();
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');
  const backgroundImage = document.getElementById('backgroundImage');

  let drawing = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  ctx.globalAlpha = 1;

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', handleTouchEnd);

  function startDrawing(e) {
    drawing = true;
    draw(e);
  }

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!drawing) return;
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    drawLine(x, y);
  }

  function handleTouchStart(e) {
    e.preventDefault();
    drawing = true;
    handleTouchMove(e);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!drawing) return;
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    drawLine(x, y);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    stopDrawing();
  }

  function drawLine(x, y) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit('draw', { x, y });
  }

  socket.on('draw', (data) => {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
  });

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      if (screen.orientation.lock) {
        screen.orientation.lock('landscape');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  document.addEventListener('dblclick', toggleFullScreen);
  document.addEventListener('fullscreenchange', resizeCanvas);
});
