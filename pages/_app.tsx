import { GeistProvider, CssBaseline } from "@geist-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <GeistProvider themeType="dark">
          <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Component {...pageProps} />
        </QueryClientProvider>
      </GeistProvider>
  );
}

export default MyApp;
