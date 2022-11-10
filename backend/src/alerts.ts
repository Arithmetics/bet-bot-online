import Discord from "discord.js";
// @ts-ignore
import {
  GamePlus,
  shouldATSBetAwayTeam,
  shouldATSBetHomeTeam,
  shouldTotalBetOver,
  shouldTotalBetUnder,
} from "./database";
import {
  genATSDiscordEmbed,
  genTotalDiscordEmbed,
  sendDiscordBetAlert,
} from "./discord";
import { genIMessageATS, genIMessageTotal, sendMeAnIMessage } from "./iMessage";
import { createPacificPrismaDate } from "./utils";

type BetTracking = {
  date: string | null;
  totals: string[];
  ats: string[];
};

let betTracking: BetTracking = {
  date: null,
  totals: [],
  ats: [],
};

export function sendNewBetAlertsToConsumers(
  client: Discord.Client,
  games: GamePlus[],
  lastMessage: number
): void {
  if (betTracking.date === null) {
    betTracking.date = createPacificPrismaDate().toISOString().split("T")[0];
  }

  const today = createPacificPrismaDate().toISOString().split("T")[0];
  if (betTracking.date !== today) {
    console.log("updating bet tracking at", new Date());
    betTracking.date = createPacificPrismaDate().toISOString().split("T")[0];
    betTracking.ats = [];
    betTracking.totals = [];
  }

  games.forEach((game) => {
    const newLines = game.liveGameLines.filter(
      (l) => l.timestamp.getTime() > lastMessage
    );

    const hasTotalBet = betTracking.totals.some((t) => t === game.awayTeam);
    const hasATSBet = betTracking.ats.some((t) => t === game.awayTeam);

    newLines.forEach((line) => {
      // bet on home team
      if (shouldATSBetHomeTeam(line, hasATSBet)) {
        betTracking.ats.push(game.awayTeam);
        // messages
        const betEmbed = genATSDiscordEmbed(game, line);
        const message = genIMessageATS(game, line);
        // sends
        sendDiscordBetAlert(client, betEmbed);
        // imessage
        sendMeAnIMessage(message);
        // twitter
        // fe client
      }
      // bet on away team
      if (shouldATSBetAwayTeam(line, hasATSBet)) {
        betTracking.ats.push(game.awayTeam);
        const betEmbed = genATSDiscordEmbed(game, line);
        const message = genIMessageATS(game, line);
        // sends
        sendDiscordBetAlert(client, betEmbed);
        // imessage
        sendMeAnIMessage(message);
        // twitter
        // fe client
      }
      // bet on over
      if (shouldTotalBetOver(line, hasTotalBet)) {
        betTracking.totals.push(game.awayTeam);
        const betEmbed = genTotalDiscordEmbed(game, line);
        const message = genIMessageTotal(game, line);
        // sends
        sendDiscordBetAlert(client, betEmbed);
        // imessage
        sendMeAnIMessage(message);
        // twitter
        // fe client
      }
      // bet on under
      if (shouldTotalBetUnder(line, hasTotalBet)) {
        betTracking.totals.push(game.awayTeam);
        const betEmbed = genTotalDiscordEmbed(game, line);
        const message = genIMessageTotal(game, line);
        // sends
        sendDiscordBetAlert(client, betEmbed);
        // imessage
        sendMeAnIMessage(message);
        // twitter
        // fe client
      }
    });
  });
}
