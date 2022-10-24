// @ts-ignore
import osa from "osa2";

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
