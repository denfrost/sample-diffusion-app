import "../styles/globals.css";
import { trpc } from "../utils/trpc";
import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import Head from "next/head";
import { AppProps } from "next/app";
import { LazyMotion, domAnimation } from "framer-motion";
import { RouterTransition } from "../components/RouterTransition";
import { NotificationsProvider } from "@mantine/notifications";

function App(props: AppProps) {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props;

  return (
    <>
      <Head>
        <title>Sampleforge</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <LazyMotion features={domAnimation}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: "dark",
            fontFamily: "Inter",
            primaryColor: "pink",
            radius: {
              xl: 5,
            },
          }}
        >
          <RouterTransition />
          <SessionProvider session={session}>
            <NotificationsProvider>
              <Component {...pageProps} />
            </NotificationsProvider>
          </SessionProvider>
        </MantineProvider>
      </LazyMotion>
    </>
  );
}

export default trpc.withTRPC(App);
