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
