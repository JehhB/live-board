import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { sign } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let signatures = {
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/bootstrap.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

io.on('connection', (socket) => {
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);

    signatures[data.id].at(-1).push({ x: data.x, y: data.y });
  });

  socket.on('start', (id) => {
    socket.broadcast.emit('start', id);
    if (!(id in signatures)) {
      signatures[id] = [];
    }
    signatures[id].push([]);
  });

  socket.on('clear', () => {
    io.emit('clear', 1);
    signatures = {};
  });


  socket.emit('init', signatures);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
