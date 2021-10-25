import { GeistProvider, CssBaseline } from '@geist-ui/react'
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <GeistProvider themeType='dark'>
          <CssBaseline />
          <Component {...pageProps} />
        </GeistProvider> 
}

export default MyApp;