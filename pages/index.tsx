import Head from "next/head";
import { Page, Text, Display, Grid, Divider } from "@geist-ui/react";
import { ATSBetTable } from "./ATSBetTable";
import { TotalBetTable } from "./TotalBetTable";
import { RefreshCounter } from "./RefreshCounter";
import { GameCard } from "./TotalGraph";

export default function Home() {
  return (
    <div>
      <Head>
        <title>bet bot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page dotBackdrop width="1200px" padding={0}>
        <Display
          title="bet bot"
          caption={<>welcome to the bet bot</>}
          margin={0}
        >
          <Text h1>🤖 🏀</Text>
        </Display>
        <Grid.Container justify="center" gap={3}>
          <Grid>
            <RefreshCounter />
          </Grid>
          {/* <Grid justify="center">
            <ATSBetTable />
          </Grid> */}
        </Grid.Container>
        {/* <Divider /> */}
        {/* <Grid.Container justify="center" gap={3}>
        <Grid justify="center">
            <TotalBetTable />
          </Grid>
        </Grid.Container> */}
        {/* <Divider /> */}
        <Grid.Container gap={2} justify="center">
          <Grid width="600px">
            <GameCard isLoading />
          </Grid>
          <Grid width="600px">
            <GameCard />
          </Grid>
          <Grid>
            <GameCard />
          </Grid>
          <Grid>
            <GameCard />
          </Grid>
          <Grid>
            <GameCard />
          </Grid>
          <Grid>
            <GameCard />
          </Grid>
        </Grid.Container>
      </Page>
    </div>
  );
}
