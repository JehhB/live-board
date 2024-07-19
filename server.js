import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let signatures = {
};

const dump_path = path.join(__dirname, 'signatures.json');
try {
  signatures = JSON.parse(
    readFileSync(dump_path, { encoding: 'utf8' })
  );
} catch (e) {
  console.log(e);
}

setInterval(() => {
  const temp = {};
  Object.keys(signatures).forEach(k => {
    temp[k] = {
      ...signatures[k],
      commited: true,
    }
  });

  writeFileSync(dump_path, JSON.stringify(temp));
}, 10000);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/bootstrap.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

io.on('connection', (socket) => {
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
    signatures[data.id].paths.at(-1).push({ x: data.x, y: data.y });
  });

  socket.on('start', (id) => {
    socket.broadcast.emit('start', id);
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

  socket.on('delete', (id) => {
    socket.broadcast.emit('delete', id);
    delete signatures[id];
  });

  socket.on('commit', (id) => {
    socket.broadcast.emit('commit', id);
    signatures[id].commited = true;
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
