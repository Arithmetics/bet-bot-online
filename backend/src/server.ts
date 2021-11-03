import express from "express";
import http from "http";
import WebSocket from "ws";

let lastMessage = Date.now();

const MASTER_INTERVAL = 30000;

type ConnectionMessage = {
  messageTimestamp: number;
  games: string[];
  msUntilNextUpdate: number;
};

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

function constructMessage(): ConnectionMessage {
  return {
    messageTimestamp: lastMessage,
    games: [],
    msUntilNextUpdate: MASTER_INTERVAL,
  };
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function sendMessageToAllClients(): void {
  lastMessage = Date.now();
  console.log("sending messages now");
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(constructMessage()));
  });
}

wss.on("connection", (ws: ExtWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  //connection is up, let's add a simple simple event
  // ws.on("message", (message: string) => {
  //log the received message and send it back to the client
  // console.log("received::: %s", message);
  // ws.send(`Hello, you sent -> ${message}`);

  // wss.clients.forEach((client) => {
  //   client.send(`someonesent: ${message}`);
  // });
  // });

  //send immediatly a feedback to the incoming connection (initial data for us)
  ws.send(JSON.stringify(constructMessage()));
});

// send data out on interval
setInterval(sendMessageToAllClients, MASTER_INTERVAL);

// check on all connections every 10 secs and close broken connections
setInterval(() => {
  (wss.clients as Set<ExtWebSocket>).forEach((ws: ExtWebSocket) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(null, false);
  });
}, 10000);

//start our server
server.listen(process.env.PORT || 8999, () => {
  console.log(
    `Server started on port ${(server.address() as { port: number }).port} :))`
  );
});
