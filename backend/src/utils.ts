export function createPacificPrismaDate(): Date {
  const pstDate = new Date();
  pstDate.setHours(pstDate.getHours() - 8);
  return pstDate;
}

export function convertToPacificPrismaDate(date: Date): Date {
  const pstDate = new Date(date.getTime());
  pstDate.setHours(pstDate.getHours() - 8);
  return pstDate;
}

export function getTotalSeconds(
  quarter: number,
  minute: number,
  second: number
): number {
  const secondsPlayedInQuarter = (12 - minute) * 60 - second;
  const oldQuarterSeconds = (quarter - 1) * 12 * 60;

  return secondsPlayedInQuarter + oldQuarterSeconds;
}

export function secondsLeftInRegulation(
  quarter: number,
  minute: number,
  second: number
): number {
  const totalSeconds = getTotalSeconds(quarter, minute, second);
  return 48 * 60 - totalSeconds;
}
