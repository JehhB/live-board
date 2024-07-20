import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));


let signatures = {
};

const logs = [];

async function setupBackup() {
  const dumpDirectory = path.join(__dirname, '.logs');

  try {
    await fs.access(dumpDirectory);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dumpDirectory);
    } else console.error(err);
  }


  const dumpPath = path.join(dumpDirectory, 'signatures.json');
  const logPath = path.join(dumpDirectory, 'logs-' + Date.now() + ".json");

  try {
    const current = await fs.readFile(dumpPath, { encoding: 'utf8' });
    signatures = JSON.parse(current);

    Object.keys(signatures).forEach(k => {
      signatures[k] = {
        ...signatures[k],
        commited: true,
      }
    });

  } catch (err) {
    console.log("No previous session found");
  }

  async function dumpBackups() {
    const dumpSignature = JSON.stringify(signatures);
    fs.writeFile(dumpPath, dumpSignature);
    fs.writeFile(logPath, JSON.stringify(logs));
  }

  setInterval(() => {
    dumpBackups();
  }, 10000);
}

setupBackup();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/bootstrap.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

io.on('connection', (socket) => {
  socket.on('draw', (data) => {
    try {
      socket.broadcast.emit('draw', data);
      signatures[data.id].paths.at(-1).push({ x: data.x, y: data.y });
      logs.push(['draw', data]);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('start', (id) => {
    try {
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
      logs.push(['start', id]);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('delete', (id) => {
    try {
      socket.broadcast.emit('delete', id);
      delete signatures[id];
      logs.push(['delete', id]);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('commit', (id) => {
    try {
      socket.broadcast.emit('commit', id);
      signatures[id].commited = true;
      logs.push(['commit', id]);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('clear', () => {
    try {
      io.emit('clear', 1);
      signatures = {};
      logs.push(['clear']);
    } catch (e) {
      console.log(e);
    }
  });

  socket.emit('init', signatures);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
