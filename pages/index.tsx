import Head from 'next/head'
import { Page, Text, Image, Display, Button, Grid } from '@geist-ui/react'
import BetTable from './BetTable';

export default function Home() {
  const gh = 'https://github.com/geist-org/react'
  const docs = 'https://react.geist-ui.dev'
  const redirect = (url: string) => {
    window.open(url)
  }

  return (
    <div>
      <Head>
        <title>Geist UI with NextJS</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page dotBackdrop width="800px" padding={0}>
        <Display
          title="Geist UI"
          caption={
            <>
              welcome to the bet bot
            </>
          }>
          <Text h1>🤖 🏀</Text>
        </Display>
        <Grid.Container justify="center" gap={3} mt="100px">
          <Grid xs={20} sm={7} justify="center">
            <BetTable />
          </Grid>
        </Grid.Container>
      </Page>
    </div>
  )
}