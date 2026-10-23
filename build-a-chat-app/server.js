import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/' || urlPath === '/index.html') {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (urlPath === '/script.js') {
    const scriptPath = path.join(__dirname, 'public', 'script.js');
    fs.readFile(scriptPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const wss = new WebSocketServer({ server });

function broadcast(payload) {
  const messageString = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

wss.on('connection', (socket, req) => {
  const username = new URL(req.url, 'http://localhost').searchParams.get('username') || 'Anonymous';

  broadcast({
    type: 'system',
    text: `${username} joined`,
  });

  socket.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      broadcast({
        type: 'chat',
        username: parsed.username || username,
        text: parsed.text,
      });
    } catch (err) {
      console.error('Invalid message format received:', err);
    }
  });

  socket.on('close', () => {
    broadcast({
      type: 'system',
      text: `${username} left`,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
