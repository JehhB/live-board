import { effect } from "@vue/reactivity";
import { commitModalShown, id, role, signatures } from "./stores";
import socket from "./socket";
import debounce from "lodash/debounce";

export default function() {

  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');

  let drawing = false;

  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    redraw(signatures);
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
    socket.emit('start', id.value)
    if (!(id.value in signatures)) {
      Object.assign(signatures, {
        [id.value]: {
          commited: false,
          paths: [],
        }
      })
    }

    signatures[id.value].paths.push([]);

    drawing = true;
    draw(e);
  }

  const commit = debounce(() => {
    commitModalShown.value = true;
  }, 2000);

  function stopDrawing(e) {
    e.preventDefault();
    drawing = false;
  }

  function draw(e) {
    e.preventDefault();
    if (!drawing) return;

    commit();
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    socket.emit('draw', { x: x / width, y: y / height, id: id.value });
    signatures[id.value].paths.at(-1).push({ x: x / width, y: y / height });
  }

  function redraw(signatures) {
    ctx.clearRect(0, 0, width, height);

    for (const [id, signature] of Object.entries(signatures)) {
      if (signature.commited) ctx.strokeStyle = "rgba(0, 0, 0, 1)"
      else ctx.strokeStyle = "rgba(20, 20, 20, 0.5)"
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      signature.paths.forEach(line => {
        if (line.length == 0) return;

        ctx.beginPath();
        ctx.moveTo(line[0][0] * width, line[0][1] * height);
        line.forEach(({ x, y }) => {
          ctx.lineTo(x * width, y * height);
        });
        ctx.stroke();
      });
    }
  }

  effect(() => {
    redraw(signatures);
  });

  document.addEventListener('fullscreenchange', resizeCanvas);
}
