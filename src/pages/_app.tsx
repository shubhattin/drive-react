import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'jotai';
import Head from 'next/head';
import 'styles/globals.scss';
import LangChange from 'components/LangChange';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Provider>
        <Component {...pageProps} />
      </Provider>
      <LangChange />
    </>
  );
}

export default MyApp;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
export interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}
