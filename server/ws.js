const { WebSocketServer } = require('ws');

function setupWebSocket(server, sessionManager) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(event, data) {
    const message = JSON.stringify({ event, data });
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  }

  const events = [
    'session:created',
    'session:stopped',
    'session:deleted',
    'session:exited'
  ];

  for (const event of events) {
    sessionManager.on(event, (data) => broadcast(event, data));
  }

  return wss;
}

module.exports = setupWebSocket;
