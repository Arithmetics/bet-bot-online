import Head from "next/head";
import { useState, useEffect } from "react";
import {
  Page,
  Display,
  Grid,
  useToasts,
  Loading,
  ButtonGroup,
  useMediaQuery,
  Button,
  useTheme,
} from "@geist-ui/react";
import useSound from "use-sound";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { BetMessage, ConnectionMessage } from "../backend/src/serverTypes";
import DisconnectedApp from "../components/DisconnectedApp";
import { Games } from "../components/Games";
import { RefreshCounter } from "../components/RefreshCounter";
import NProgress from "nprogress";
import BetTable from "../components/BetTable";
import BetModal from "../components/BetModal";
import QuickView from "../components/QuickView";
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import chaching from "../public/chaching.mp3";
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import alert from "../public/alert.mp3";

export type View = "quick" | "ats" | "total" | "bets";

// const websocketUrl = "ws://localhost:8999";
const websocketUrl = "wss://brockcastle.pagekite.me/";

export default function Home(): JSX.Element {
  const [, setToast] = useToasts();
  const { palette } = useTheme();
  const downMd = useMediaQuery("sm", { match: "down" });

  // const [playAlert] = useSound("/alert.mp3", { volume: 0.5 });
  const [playMoney] = useSound("/chaching.mp3", { volume: 0.5 });

  const { lastMessage, readyState } = useWebSocket(websocketUrl);

  const [view, setView] = useState<View>("total");
  const [newBetModalOpen, setNewBetModalOpen] = useState<boolean>(false);

  const [currentMessage, setCurrentMessage] =
    useState<ConnectionMessage | null>(null);

  const [betMessage, setBetMessage] = useState<BetMessage | null>(null);

  useEffect(() => {
    NProgress.configure({ trickle: false });
    NProgress.start();
  }, []);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      setToast({
        text: "Lost connection with server. Refresh and try again.",
        type: "error",
      });
    }
    if (readyState === ReadyState.OPEN) {
      setToast({
        text: "Connected successfully",
        type: "success",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      // playAlert();
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.messageType === "games") {
        setCurrentMessage(messageData);
      }
      if (messageData.messageType === "bet") {
        playMoney();
        setBetMessage(messageData);
        setNewBetModalOpen(true);
      }
      NProgress.set(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage, setCurrentMessage]);

  const isConnecting = readyState === ReadyState.CONNECTING;
  const isDisconnected = readyState === ReadyState.CLOSED;
  const isConnected = readyState === ReadyState.OPEN;

  return (
    <div>
      <Head>
        <title>bet bot</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>"
        />
      </Head>
      <Page
        dotBackdrop
        style={{
          maxWidth: "2200px",
          width: downMd ? "100%" : "95%",
          padding: "0px",
        }}
        padding={0}
      >
        <Display
          title="bet bot"
          caption={<>welcome to the bet bot</>}
          margin={0}
        >
          {/* <Text h1>🤖 🏀</Text> */}
        </Display>

        {isDisconnected ? <DisconnectedApp /> : undefined}

        {isConnecting ? (
          <Loading style={{ marginTop: "10rem" }} type="error">
            Loading
          </Loading>
        ) : undefined}

        {isConnected ? (
          <>
            <Grid.Container justify="center" gap={3}>
              <Grid>
                {currentMessage?.msUntilNextUpdate &&
                currentMessage.messageTimestamp ? (
                  <RefreshCounter
                    msUntilNextUpdate={currentMessage?.msUntilNextUpdate}
                    messageTimestamp={currentMessage?.messageTimestamp}
                  />
                ) : undefined}
              </Grid>
            </Grid.Container>
            <Grid.Container justify="center" gap={3} marginBottom={2}>
              <Grid>
                <ButtonGroup>
                  <Button
                    style={{
                      backgroundColor:
                        view === "quick" ? palette.violet : "inherit",
                      color: view === "quick" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("quick")}
                  >
                    Quick
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        view === "total" ? palette.violet : "inherit",
                      color: view === "total" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("total")}
                  >
                    Totals
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        view === "ats" ? palette.violet : "inherit",
                      color: view === "ats" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("ats")}
                  >
                    Spreads
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        view === "bets" ? palette.violet : "inherit",
                      color: view === "bets" ? palette.foreground : "inherit",
                    }}
                    onClick={() => setView("bets")}
                  >
                    Bets
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid.Container>
            {view === "quick" ? (
              <QuickView
                games={currentMessage?.games}
                messageTimestamp={currentMessage?.messageTimestamp}
              />
            ) : undefined}
            {view === "total" || view === "ats" ? (
              <Games
                view={view}
                games={currentMessage?.games}
                messageTimestamp={currentMessage?.messageTimestamp}
              />
            ) : undefined}
            {view === "bets" ? (
              <BetTable
                historicalBetting={currentMessage?.historicalBetting || null}
              />
            ) : undefined}
          </>
        ) : undefined}
      </Page>
      <BetModal
        isOpen={newBetModalOpen}
        onClose={() => setNewBetModalOpen(false)}
        betMessage={betMessage}
      />
    </div>
  );
}
