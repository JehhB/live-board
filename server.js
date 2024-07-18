import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const signatures = {
  'test': '',
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/bootstrap.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.emit('init', () => {
    console.log(signatures);
  })
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
