import express from "express";
import bodyParser from "body-parser";
import http from "http";
import WebSocket from "ws";
import cors from "cors";
import cron from "node-cron";
import {
  // runDraftKingsCycle,
  getAllTodaysGames,
  GamePlus,
  betCache,
  refreshHistoricalBetting,
  finishGamesUsingESPN,
} from "./database";
import { sendDiscordLinesSummary, startUpDiscordClient } from "./discord";
import { sendNewBetAlertsToConsumers } from "./alerts";
import featureFlags from "./features";
import { ConnectionMessage, ExtWebSocket } from "./serverTypes";
import { fakeConnectionMessage } from "./mock";
import { enterFoundHtmlGamesAndCreateBets } from "./client";

export const MASTER_INTERVAL = 30 * 1000;

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// setup message clients
// const discordClient = startUpDiscordClient();
// twitter client

let lastMessage = Date.now();

function constructMessage(games: GamePlus[]): ConnectionMessage {
  return {
    messageType: "games",
    messageTimestamp: lastMessage,
    games,
    msUntilNextUpdate: MASTER_INTERVAL,
    historicalBetting: betCache.historicalBetting,
  };
}

async function sendConnectionMessage(ws: ExtWebSocket): Promise<void> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const games = await getAllTodaysGames();

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
  const games = await getAllTodaysGames();

  if (featureFlags.reportBets) {
    // pass in twitter

    // update this to send the actual bets made
    sendNewBetAlertsToConsumers(undefined, wss, games, lastMessage);
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

// always look for complete games on espn and close them out
setInterval(finishGamesUsingESPN, MASTER_INTERVAL * 2);

// 6:00 PST - refresh betting summary
cron.schedule("0 6 * * *", () => {
  refreshHistoricalBetting();
});
refreshHistoricalBetting();

// 23:30 PST - send out todays summary
cron.schedule("30 23 * * *", () => {
  // sendDiscordLinesSummary(discordClient);
});

// 10:00 PST - send out todays preview
cron.schedule("30 10 * * *", () => {
  // sendDiscordLinesSummary(discordClient);
});

app.use(express.static("public"));
app.post("/draftkings", async function (req, res) {
  const { body } = req;
  console.log("received draftkings data", body?.games?.length);

  if (!body?.games?.length) {
    res.send({
      status: 200,
      bets: [],
    });
    return;
  }

  const betsToMake = await enterFoundHtmlGamesAndCreateBets(body.games);

  res.send({
    status: 200,
    bets: betsToMake,
  });
});

//start our websocket server
server.listen(process.env.PORT || 8999, () => {
  console.log(
    `Server started on port ${(server.address() as { port: number }).port} :))`
  );
});
