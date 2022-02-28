
import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { MongoClient, Collection, Db } from 'mongodb';

// Custom WebSocket
interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
}

interface chat {
  command?: string;
  name?: string;
  message?: string;
}

// Connection URI
const uri = "mongodb://bW9uZ28tdXNlcg==:bW9uZ28tcGFzc3dk@mongo:27017/?maxPoolSize=20&w=majority";

// Create a new MongoClient
const client: MongoClient = new MongoClient(uri);
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("chat").command({ ping: 1 });

    const db: Db = client.db('chat');
    const collection: Collection = db.collection('messages');

    const app = express();

    // initialize a simple http server
    const server: http.Server = http.createServer(app);

    // initialize the WebSocket server instance
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws: ExtWebSocket) => {
      ws.isAlive = true;

      ws.on('pong', () => {
          ws.isAlive = true;
      });

      // connection is up, let's add a simple simple event
      ws.on('message', async (message: string) => {
        // log the received message and send it back to the client
        console.log('received: %s', message);

        let decodedData: chat = {};
        try {
          decodedData = JSON.parse(message);
        } catch (e) {
          decodedData = {};
        }

        const { command } = decodedData;
        switch (command) {
          case 'typing':
            wss.clients.forEach((client) => {
              if (client != ws) {
                client.send(JSON.stringify({ typing: !!decodedData.message, name: decodedData.name }));
              }
            });
            break;

          case 'send':
            await client.connect();
            if (decodedData) {
              await collection.insertOne(decodedData);
            }

            const messages = JSON.stringify(await collection.find({}).toArray());
            wss.clients.forEach((client) => {
              if (client != ws) {
                client.send(messages);
              }
            });
            break;
        }
      });

      // send immediatly a feedback to the incoming connection
      // ws.send('Connected');

      // Send current messages
      await client.connect();
      const messages = JSON.stringify(await collection.find({}).toArray());
      ws.send(messages);
    });

    setInterval(() => {
      wss.clients.forEach((ws: ExtWebSocket) => {
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
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
