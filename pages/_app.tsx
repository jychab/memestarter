import { LoginProvider } from "../contexts/LoginProvider";
import Layout from "../sections/Layout";
import type { AppProps } from "next/app";
import { ContextProvider } from "../contexts/ContextProvider";
import "../styles/globals.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContextProvider>
      <LoginProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </LoginProvider>
    </ContextProvider>
  );
}
