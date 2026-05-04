export function calcPoints(
  homePred: number, awayPred: number,
  homeReal: number, awayReal: number,
): number {
  if (homePred === homeReal && awayPred === awayReal) return 3
  if (Math.sign(homePred - awayPred) === Math.sign(homeReal - awayReal)) return 1
  return 0
}
