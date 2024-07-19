import { id, signatures } from "./stores";

const socket = io();

socket.on('draw', (data) => {
  signatures[data.id].paths.at(-1).push({ x: data.x, y: data.y });
});

socket.on('start', (id) => {
  if (!(id in signatures)) {
    Object.assign(signatures, {
      [id]: {
        commited: false,
        paths: [],
      }
    });
  }
  signatures[id].paths.push([]);
});

socket.on('commit', (id) => {
  signatures[id].commited = true;
});

socket.on('delete', (id) => {
  delete signatures[id];
});

socket.on('clear', () => {
  id.value = Math.floor(Math.random() * 1000000);
  Object.keys(signatures).forEach(key => {
    delete signatures[key];
  });
});

socket.on('init', (data) => {
  Object.assign(signatures, data);
});

export default socket;

