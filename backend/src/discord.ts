import Discord from "discord.js";
// @ts-ignore
import ReadText from "text-from-image";

import fs from "fs";
import { ownerIds } from "./botInformation";
import { GamePlus, LiveGameLinePlus, getAllTodaysGames } from "./database";

const PREFIX = "!";

type BetResults = {
  wins: number;
  losses: number;
  profit: number;
};

type BetData = Record<string, BetResults>;

function loadBetData(): BetData {
  let rawdata = fs.readFileSync("userBets.json");
  // @ts-ignore
  let bets = JSON.parse(rawdata);
  return bets as BetData;
}

type BetResult = {
  result: string;
  wager: number;
  paid: number;
};

function processText(text: string): BetResult[] {
  const betResults: BetResult[] = [];
  const allLines = text.split(/\r?\n/);

  const currentBet: BetResult = {
    result: "",
    wager: 0,
    paid: 0,
  };

  allLines.forEach((line, i) => {
    if (line.endsWith("LOST")) {
      if (i !== 0) {
        betResults.push({ ...currentBet });
        currentBet.paid = 0;
        currentBet.wager = 0;
      }
      currentBet.result = "LOST";
    }
    if (line.endsWith("WON")) {
      if (i !== 0) {
        betResults.push({ ...currentBet });
        currentBet.paid = 0;
        currentBet.wager = 0;
      }
      currentBet.result = "WON";
    }
    if (line.startsWith("Wager")) {
      const lineSplit = line.split("$");
      const money = parseFloat(lineSplit[1]);
      currentBet.wager = money;
    }
    if (line.startsWith("Paid")) {
      const lineSplit = line.split("$");
      const money = parseFloat(lineSplit[1]);
      currentBet.paid = money;
    }
    if (i === allLines.length - 1) {
      betResults.push({ ...currentBet });
    }
  });
  return betResults;
}

function sendBetInfo(message: Discord.Message, args: string[]) {
  const bets = loadBetData();

  const id = message.author.id;

  if (args.length === 0) {
    message.channel.send({
      embed: formatBetMessage(bets),
    });
    return;
  }

  if (args.length === 1) {
    const bet = parseInt(args[0]);

    if (isNaN(bet)) {
      message.channel.send("Please use format: !bet [[+/-]amount]");
      return;
    }

    if (!bets[id]) {
      bets[id] = { wins: 0, losses: 0, profit: 0 };
    }

    if (bet > 0) {
      bets[id].wins++;
    } else if (bet < 0) {
      bets[id].losses++;
    }

    bets[id].profit += bet;
    saveBetData(bets);

    message.channel.send({ embed: formatBetMessage({ [id]: bets[id] }) });
  }
}

async function sendSlipInfo(
  message: Discord.Message
  // , args: string[]
) {
  const bets = loadBetData();
  const id = message.author.id;
  const images = Array.from(message.attachments.values());
  try {
    images.forEach((image) => {
      ReadText(image.attachment)
        // @ts-ignore
        .then((text) => {
          const submittedBetSlips = processText(text);
          submittedBetSlips.forEach((submittedSlip) => {
            if (!bets[id]) {
              bets[id] = { wins: 0, losses: 0, profit: 0 };
            }
            console.log({ id });
            console.log({ bets: bets[id] });
            if (submittedSlip.result === "WON") {
              console.log("adding");
              bets[id].wins++;
              bets[id].profit -= submittedSlip.wager;
              bets[id].profit += submittedSlip.paid;
            }
            if (submittedSlip.result === "LOST") {
              console.log("subbing");
              bets[id].losses++;
              bets[id].profit -= submittedSlip.wager;
            }
          });
          saveBetData(bets);
          message.channel.send({ embed: formatSlips(submittedBetSlips) });
        })
        // @ts-ignore
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (e) {
    message.channel.send("COULDNT READ YOUR SLIP");
  }
}

function formatBetMessage(bets: BetData) {
  const betEmbed = {
    color: 0x0099ff,
    title: "Bet Update",
    fields: [] as any[],
  };

  for (let [personId, stats] of Object.entries(bets)) {
    const field = {
      name: ownerIds[personId] || "unknown, have brock add your name",
      value: `Wins: ${stats.wins}, Losses: ${stats.losses}, Profit: ${stats.profit}`,
    };
    betEmbed.fields.push(field);
  }

  return betEmbed;
}

function formatSlips(slips: BetResult[]) {
  const betEmbed = {
    color: 0x0099ff,
    title: "Bet Update",
    fields: [] as any[],
  };

  slips.forEach((slip, i) => {
    const field = {
      name: `Slip: ${i + 1}`,
      value: `Result: ${slip.result}, Wager: ${slip.wager}, Paid: ${slip.paid}`,
    };
    betEmbed.fields.push(field);
  });

  return betEmbed;
}

function saveBetData(bets: BetData) {
  fs.writeFile(
    "./userBets.json",
    JSON.stringify(bets),
    "utf-8",
    function (err) {
      if (err) {
        console.log("SOMEONE CRASHED BET JSON");
      }
    }
  );
}

function messageIsFrom(message: Discord.Message, name: string): boolean {
  return ownerIds[message.author.id] === name;
}

function sendPersonalReply(message: Discord.Message): void {
  if (messageIsFrom(message, "kerm")) {
    message.channel.send(
      "Look out everyone, this guy drives a TESLA. Make way, VIP coming through!"
    );
    return;
  }
  if (messageIsFrom(message, "jerms")) {
    message.channel.send(
      "oh look MR WOKE HIS SUPREME LIBNESS. what are you mad about today snowflake?"
    );
    return;
  }
  if (messageIsFrom(message, "brock")) {
    message.channel.send("hello!, have a great day");
    return;
  }
  if (messageIsFrom(message, "trox")) {
    message.channel.send("btrox? looking smol bro");
    return;
  }
  if (messageIsFrom(message, "dagr")) {
    message.channel.send(
      "Back again with some 6 leg SGP? You'll hit one one of these days :)"
    );
    return;
  }
  if (messageIsFrom(message, "jhi")) {
    message.channel.send("hahah lil boy jhi. gtfo");
    return;
  }

  message.channel.send("Tag me again, see what happens!");
}

export function formatLine(line?: number): string {
  if (line === undefined) {
    return "unknown, oops";
  }
  if (line > 0) {
    return `+${line}`;
  }

  return `${line}`;
}

async function sendLineInfo(message: Discord.Message): Promise<void> {
  const games = await getAllTodaysGames();

  if (!games || games.length < 1) {
    message.channel.send({
      embed: {
        color: 0x0099ff,
        title: "No lines today as far as I can tell...",
        fields: [],
      },
    });

    return;
  }

  const gameEmbed: Partial<Discord.MessageEmbed> = {
    color: 0x0099ff,
    title: "Sup losers, this is what i'm seeing for todays lines",
    fields: [],
  };

  games.forEach((g, i) => {
    gameEmbed.fields?.push({
      name: `Game: ${i + 1}`,
      value: `${g.awayTeam} are ${formatLine(g.closingAwayLine)} @ ${
        g.homeTeam
      }, the total is ${g.closingTotalLine}`,
      inline: false,
    });
  });

  // @ts-ignore
  message.channel.send({ embed: gameEmbed });
}

function formatTime(line: LiveGameLinePlus) {
  const secondString = line.second < 10 ? `0${line.second}` : line.second;
  return `${line.minute}: ${secondString} - ${line.quarter}Q`;
}

export function sendNewBetAlertsToDiscord(
  client: Discord.Client,
  games: GamePlus[],
  lastMessage: number
): void {
  const betsChannel = client.channels.cache.find(
    (c) => c.id === "675574196268564525"
  );

  if (betsChannel?.isText()) {
    games.forEach((game) => {
      const newLines = game.liveGameLines.filter(
        (l) => l.timestamp.getTime() > lastMessage
      );

      newLines.forEach((line) => {
        if (line.grade && (line.grade > 4.999 || line.grade < -4.999)) {
          const betEmbed = {
            color: 0x0099ff,
            title: "BET BOT TOTAL ALERT",
            fields: [
              {
                name: "Game:",
                value: `${game.awayTeam} @ ${game.homeTeam}`,
              },
              {
                name: "Closing Total Line:",
                value: `${game.closingTotalLine}`,
              },
              {
                name: "Game Time:",
                value: formatTime(line),
              },
              {
                name: "Current Total Line:",
                value: line.totalLine,
              },
              {
                name: "Bet:",
                value: `Betting ${Math.abs(line.grade)} units on the ${
                  line.grade < 0 ? "UNDER" : "OVER"
                }`,
              },
            ],
          };

          betsChannel?.send({ embed: betEmbed });
          // tag me and kev
          betsChannel.send("<@507719783014465537>");
          betsChannel.send("<@306086225016782849>");
        }
        if (
          line.atsGrade &&
          (line.atsGrade > 4.999 || line.atsGrade < -4.999) &&
          line.totalMinutes &&
          line.totalMinutes > 12 &&
          line.totalMinutes < 36
        ) {
          const betEmbed = {
            color: 0x0099ff,
            title: "BET BOT ATS ALERT",
            fields: [
              {
                name: "Game:",
                value: `${game.awayTeam} @ ${game.homeTeam}`,
              },
              {
                name: "Closing Away Line:",
                value: `${game.closingAwayLine}`,
              },
              {
                name: "Game Time:",
                value: formatTime(line),
              },
              {
                name: "Current Away Line:",
                value: line.awayLine,
              },
              {
                name: "Bet:",
                value: `Betting ${Math.abs(line.atsGrade)} units on the ${
                  line.atsGrade < 0 ? game.awayTeam : game.homeTeam
                }`,
              },
            ],
          };

          betsChannel?.send({ embed: betEmbed });
          // tag me and kev
          betsChannel.send("<@507719783014465537>");
          betsChannel.send("<@306086225016782849>");
        }
      });
    });
  }
}

export function startUpDiscordClient(): Discord.Client {
  const client = new Discord.Client();

  client.once("ready", () => {
    client.on("message", (message) => {
      if (message.mentions.has(client?.user?.id || "")) {
        sendPersonalReply(message);
        return;
      }

      if (!message.content.startsWith(PREFIX) || message.author.bot) return;

      const args = message.content.slice(PREFIX.length).split(/ +/);
      const command = args?.shift()?.toLowerCase();

      if (command === "lines") {
        sendLineInfo(message);
      } else if (command === "livelines") {
        message.channel.send("no live line info yet...");
      } else if (command === "bet" || command === "bets") {
        sendBetInfo(message, args);
      } else if (command === "slips") {
        sendSlipInfo(message);
      }
    });
  });

  client.login(process.env.DISCORD_BOT_TOKEN);

  return client;
}
