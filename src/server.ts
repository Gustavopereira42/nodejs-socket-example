
import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

// initialize a simple http server
const server: http.Server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Custom WebSocket
interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
}

wss.on('connection', (ws: ExtWebSocket) => {
  ws.isAlive = true;

  ws.on('pong', () => {
      ws.isAlive = true;
  });

  // connection is up, let's add a simple simple event
  ws.on('message', (message: string) => {
    // log the received message and send it back to the client
    console.log('received: %s', message);

    const broadcastRegex = /^broadcast\:/;
    if (broadcastRegex.test(message)) {
      message = message.toString().replace(broadcastRegex, '');
      // send back the message to the other clients
      wss.clients.forEach((client) => {
        if (client != ws) {
          client.send(`Hello, broadcast message -> ${message}`);
        }
      });
    } else {
      ws.send(`Hello, you sent -> ${message}`);
    }
  });

  // send immediatly a feedback to the incoming connection
  ws.send('Hello there, I am a WebSocket server');
});

setInterval(() => {
  wss.clients.forEach((ws: ExtWebSocket) => {
    console.log(ws.isAlive);

    if (!ws.isAlive) return ws.terminate();

    ws.isAlive = false;
    ws.ping(null, false);
  });
}, 10000);

// start server
server.listen(process.env.PORT || 4000, () => {
  const address: string | WebSocket.AddressInfo | null = server.address();
  if (typeof address === 'string')  {
    console.log(`Server started ${address} :)`);
  } else {
    console.log(`Server started on port ${address?.port} :)`);
  }
});