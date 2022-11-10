// @ts-ignore
import osa from "osa2";
// @ts-ignore
import { GamePlus, LiveGameLinePlus } from "./database";

export function genIMessageTotal(
  game: GamePlus,
  line: LiveGameLinePlus
): string {
  return `${game.awayTeam} @ ${game.homeTeam} Betting ${Math.abs(
    line.grade!
  )} units on the ${line.grade! < 0 ? "UNDER" : "OVER"}: ${line.totalLine}`;
}

export function genIMessageATS(game: GamePlus, line: LiveGameLinePlus): string {
  return `${game.awayTeam} @ ${game.homeTeam} Betting ${Math.abs(
    line.atsGrade!
  )} units on the ${line.atsGrade! < 0 ? game.awayTeam : game.homeTeam}: ${
    line.awayLine
  }`;
}

export function sendIMessage(handle: string, message: string) {
  // @ts-ignore
  return osa((handle, message) => {
    // @ts-ignore
    const Messages = Application("Messages");

    const target = Messages.participants.whose({ handle: handle })[0];

    try {
      Messages.send(message, { to: target });
    } catch (e) {
      throw new Error(`no thread with handle '${handle}'`);
    }
  })(handle, message);
}

export function sendMeAnIMessage(message: string) {
  sendIMessage("+15038033676", message);
}
