require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const SessionManager = require('./services/session-manager');
const sessionsRoute = require('./routes/sessions');
const setupWebSocket = require('./ws');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const TTYD_PORT_START = parseInt(process.env.TTYD_PORT_RANGE_START || '7681', 10);
const TTYD_PORT_END = parseInt(process.env.TTYD_PORT_RANGE_END || '7780', 10);

const app = express();
const server = http.createServer(app);

app.use(express.json());

const sessionManager = new SessionManager(TTYD_PORT_START, TTYD_PORT_END);

// API routes
app.use('/api/sessions', sessionsRoute(sessionManager));

// Serve frontend static files in production
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// WebSocket
setupWebSocket(server, sessionManager);

server.listen(PORT, HOST, () => {
  console.log(`Web TTYd Hub running at http://${HOST}:${PORT}`);
});

// Cleanup on exit
function cleanup() {
  console.log('\nCleaning up ttyd processes...');
  sessionManager.cleanup();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
