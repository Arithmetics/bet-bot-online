import express from "express";
import http from "http";
import WebSocket from "ws";
import {
  runDraftKingsCycle,
  getAllTodaysGames,
  GamePlus,
  HistoricalBetting,
  getHistoricalBettingData,
} from "./database";
import { startUpDiscordClient } from "./discord";
import { sendNewBetAlertsToConsumers } from "./alerts";
import featureFlags from "./features";
import { ConnectionMessage, ExtWebSocket } from "./serverTypes";
import { fakeConnectionMessage } from "./mock";

export const MASTER_INTERVAL = 250 * 1000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// setup message clients
const discordClient = startUpDiscordClient();
// twitter client

let lastMetaDataUpdate: Date | null = null;
let lastMessage = Date.now();
let historicalBetting: HistoricalBetting | null = null;

function constructMessage(games: GamePlus[]): ConnectionMessage {
  return {
    messageType: "games",
    messageTimestamp: lastMessage,
    games,
    msUntilNextUpdate: MASTER_INTERVAL,
    historicalBetting,
  };
}

async function sendConnectionMessage(ws: ExtWebSocket): Promise<void> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const games = await getAllTodaysGames();
  if (
    !historicalBetting ||
    !lastMetaDataUpdate ||
    lastMetaDataUpdate < yesterday
  ) {
    historicalBetting = await getHistoricalBettingData();
    // tweet / discord / text last night results here
  }
  // mock data
  if (featureFlags.useMockData) {
    ws.send(JSON.stringify(fakeConnectionMessage));
    return;
  }
  ws.send(JSON.stringify(constructMessage(games)));
}

wss.on("connection", (ws: ExtWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  sendConnectionMessage(ws);
});

async function updateDataAndPublish(): Promise<void> {
  try {
    if (featureFlags.queryDraftKings) {
      await runDraftKingsCycle();
    } else {
      console.log("Not querying DK: flag off");
    }
  } catch (e) {
    console.log("BIG BAD ERROR", e);
  }

  const games = await getAllTodaysGames();

  if (featureFlags.reportBets) {
    // pass in twitter
    sendNewBetAlertsToConsumers(discordClient, wss, games, lastMessage);
  } else {
    console.log("No discord alert: flag off");
  }

  lastMessage = Date.now();

  console.log("----------------");
  wss.clients.forEach((client) => {
    // mock data
    if (featureFlags.useMockData) {
      client.send(JSON.stringify(fakeConnectionMessage));
    } else {
      client.send(JSON.stringify(constructMessage(games)));
    }
  });
}

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

// send data out on interval
updateDataAndPublish();
setInterval(updateDataAndPublish, MASTER_INTERVAL);

//start our server
server.listen(process.env.PORT || 8999, () => {
  console.log(
    `Server started on port ${(server.address() as { port: number }).port} :))`
  );
});
