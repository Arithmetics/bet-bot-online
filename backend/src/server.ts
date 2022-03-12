import express from "express";
import http from "http";
import WebSocket from "ws";
import { updateData, getAllTodaysGames, GamePlus } from "./database";
// import { printData } from "./draftKings";
import { startUpDiscordClient, sendNewBetAlertsToDiscord } from "./discord";

let lastMessage = Date.now();

const MASTER_INTERVAL = 250 * 1000;

type ConnectionMessage = {
  messageTimestamp: number;
  games: GamePlus[];
  msUntilNextUpdate: number;
};

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

function constructMessage(games: GamePlus[]): ConnectionMessage {
  return {
    messageTimestamp: lastMessage,
    games,
    msUntilNextUpdate: MASTER_INTERVAL,
  };
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// setup message clients
const discordClient = startUpDiscordClient();

async function sendMessageToAllClients(): Promise<void> {
  console.log("updating data");
  try {
    await updateData();
  } catch (e) {
    console.log("BIG BAD ERROR", e);
  }

  const games = await getAllTodaysGames();
  sendNewBetAlertsToDiscord(discordClient, games, lastMessage);

  lastMessage = Date.now();

  console.log("cycle run, sending messages to all clients now", games.length);
  console.log("----------------");
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(constructMessage(games)));
  });
}

async function sendConnectionMessage(ws: ExtWebSocket): Promise<void> {
  console.log("new wb connecting, sending current data");
  const games = await getAllTodaysGames();
  ws.send(JSON.stringify(constructMessage(games)));
}

wss.on("connection", (ws: ExtWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  sendConnectionMessage(ws);
});

// send data out on interval
sendMessageToAllClients();
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
