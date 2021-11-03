import express from "express";
import http from "http";
import WebSocket from "ws";

const MASTER_INTERVAL = 10000;

type ConnectionMessage = {
  messageTimestamp: number;
  games: string[];
  msUntilNextUpdate: number;
};

function constructMessage(): ConnectionMessage {
  return {
    messageTimestamp: Date.now(),
    games: [],
    msUntilNextUpdate: MASTER_INTERVAL,
  };
}

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

function sendMessageToClients(): void {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(constructMessage()));
  });
}

// const masterTime =
setInterval(sendMessageToClients, MASTER_INTERVAL);

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
