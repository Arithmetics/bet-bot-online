import Discord from "discord.js";
// import faker from "@faker-js/faker";
import fs from "fs";
import { ownerIds } from "./botInformation";
import { GamePlus, getAllTodaysGames } from "./database";

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

function sendBetInfo(message: Discord.Message, args: string[]) {
  const bets = loadBetData();

  if (args.length === 0) {
    message.channel.send({
      embed: formatBetMessage(bets),
    });
    return;
  }

  if (args.length === 1) {
    const person = args[0];
    if (bets[person]) {
      message.channel.send({
        embed: formatBetMessage({ [person]: bets[person] }),
      });
      return;
    }
    message.channel.send(`Can't find any bets for ${person}`);
    return;
  }

  if (args.length > 1) {
    const person = args[0];
    const bet = parseInt(args[1]);

    if (isNaN(bet)) {
      message.channel.send("Please use format: !bet [name] [[+/-]amount]");
      return;
    }

    if (!bets[person]) {
      bets[person] = { wins: 0, losses: 0, profit: 0 };
    }

    if (bet > 0) {
      bets[person].wins++;
    } else if (bet < 0) {
      bets[person].losses++;
    }

    bets[person].profit += bet;
    saveBetData(bets);

    message.channel.send({ embed: formatBetMessage({ person: bets[person] }) });
  }
}

function formatBetMessage(bets: BetData) {
  const betEmbed = {
    color: 0x0099ff,
    title: "Bet Update",
    fields: [] as any[],
  };

  for (let [person, stats] of Object.entries(bets)) {
    const field = {
      name: person,
      value: `Wins: ${stats.wins}, Losses: ${stats.losses}, Profit: ${stats.profit}`,
    };
    betEmbed.fields.push(field);
  }

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
        if (!line.grade || line.grade < 4) {
          return;
        }

        const betEmbed = {
          color: 0x0099ff,
          title: "BET BOT TOTAL ALERT",
          fields: [
            {
              name: "Game:",
              value: `${game.awayTeam} @ ${game.homeTeam}`,
            },
            {
              name: "Game Time:",
              value: `${line.quarter}Q, ${line.minute}:${line.second}`,
            },
            {
              name: "Current Line:",
              value: line.totalLine,
            },
            {
              name: "Grade:",
              value: line.grade,
            },
          ],
        };

        betsChannel?.send({ embed: betEmbed });
        // tag me and kev
        betsChannel.send("<@507719783014465537>");
        betsChannel.send("<@306086225016782849>");
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
      }
    });
  });

  client.login(process.env.DISCORD_BOT_TOKEN);

  return client;
}
