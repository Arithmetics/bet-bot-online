import { Serie } from "@nivo/line";

export function getTotalSecondsPlayed(
  quarter: number,
  minute: number,
  second: number
): number {
  const secondsPlayedInQuarter = (12 - minute) * 60 - second;
  const oldQuarterSeconds = (quarter - 1) * 12 * 60;

  return secondsPlayedInQuarter + oldQuarterSeconds;
}

export const totalSecondsInRegulation = 48 * 60;
