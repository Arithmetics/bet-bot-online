export function createPacificPrismaDate(): Date {
  const pstDate = new Date();
  pstDate.setHours(pstDate.getHours() - 8);
  return pstDate;
}
