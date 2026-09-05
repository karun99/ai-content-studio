require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.set('io', io);

app.use('/api/ai', require('./routes/ai'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/editor', require('./routes/editor'));
app.use('/api/export', require('./routes/export'));
app.use('/api/collector', require('./routes/collector'));
app.use('/api/parser', require('./routes/parser'));
app.use('/api/modellab', require('./routes/modelLab'));
app.use('/api/builder', require('./routes/builder'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
