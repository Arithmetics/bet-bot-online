import WebSocket from "ws";
import { GamePlus, HistoricalBetting } from "./database";

export type MessageType = "games" | "bet";

export type WssMessage = {
  messageType: MessageType;
  messageTimestamp: number;
};

export type BetMessage = WssMessage & {
  bet: GamePlus;
};

export type ConnectionMessage = WssMessage & {
  games: GamePlus[];
  msUntilNextUpdate: number;
  historicalBetting: HistoricalBetting | null;
};

export interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}
