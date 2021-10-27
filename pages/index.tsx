import Head from "next/head";
import { Page, Text, Display, Grid } from "@geist-ui/react";
import { ATSBetTable } from "./ATSBetTable";
import { TotalBetTable } from "./TotalBetTable";
import { RefreshCounter } from "./RefreshCounter";
import { TotalGraph } from "./TotalGraph";

export default function Home() {
  return (
    <div>
      <Head>
        <title>bet bot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page dotBackdrop width="800px" padding={0}>
        <Display title="bet bot" caption={<>welcome to the bet bot</>}>
          <Text h1>🤖 🏀</Text>
        </Display>
        <Grid.Container justify="flex-start" gap={3}>
          <Grid justify="center">
            <RefreshCounter />
          </Grid>
          <Grid justify="center">
            <ATSBetTable />
          </Grid>
          <Grid justify="center">
            <TotalBetTable />
          </Grid>
        </Grid.Container>
        <Grid.Container>
          <TotalGraph />
        </Grid.Container>
      </Page>
    </div>
  );
}
