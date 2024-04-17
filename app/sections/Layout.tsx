import React, { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OnboardingScreen } from "./OnboardScreen";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Meme Starter</title>
        <meta name="description" content="Fund your favourite memes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <OnboardingScreen />
      <div className="bg-white">
        <Navbar />
        <main className="flex text-white justify-center p-6 w-full min-h-screen">
          <ToastContainer
            className="mb-16"
            position="bottom-left"
            theme="light"
          />
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
