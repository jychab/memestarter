import { LoginProvider } from "../contexts/LoginProvider";
import Layout from "../sections/Layout";
import type { AppProps } from "next/app";
import { ContextProvider } from "../contexts/ContextProvider";
import "../styles/globals.css";
import React from "react";
import { DataProvider } from "../contexts/DataProvider";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextProvider>
      <LoginProvider>
        <DataProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DataProvider>
      </LoginProvider>
    </ContextProvider>
  );
}
