import { GamePlus, LiveGameLinePlus } from "../backend/src/database";

type GameDisplays = {
  started: boolean;
  gameComplete: boolean;
  mostRecentLine: LiveGameLinePlus | undefined;
  mostRecentLineTotalTag: string;
  mostRecentLineSpreadTag: string;
  timeStampNumber: number;
  stale: boolean;
};

export const formatTime = (line?: LiveGameLinePlus) => {
  if (!line) {
    return "12:00 - 1Q";
  }
  const secondString = line.second < 10 ? `0${line.second}` : line.second;
  return `${line.minute}: ${secondString} - ${line.quarter}Q`;
};

export function getGameDisplays(
  game: GamePlus,
  messageTimestamp?: number
): GameDisplays {
  const started = game.liveGameLines.length > 0;
  const gameComplete = Boolean(game.finalAwayScore && game.finalHomeScore);

  const mostRecentLine = game.liveGameLines.reduce((acc, cur) => {
    if ((cur.totalMinutes || 0) > (acc.totalMinutes || 0)) {
      acc = cur;
    }
    return acc;
  }, game.liveGameLines[0]);

  const mostRecentLineTotalTag =
    (mostRecentLine?.grade || 0) < 0 ? `UNDER` : `OVER`;

  const mostRecentLineSpreadTag =
    (mostRecentLine?.grade || 0) > 0 ? `AWAY` : `HOME`;

  const timeStampNumber = mostRecentLine?.timestamp
    ? new Date(mostRecentLine?.timestamp).getTime()
    : 0;

  const stale = (messageTimestamp || 0) - timeStampNumber > 30 * 1000;

  return {
    started,
    gameComplete,
    mostRecentLine,
    mostRecentLineTotalTag,
    mostRecentLineSpreadTag,
    timeStampNumber,
    stale,
  };
}