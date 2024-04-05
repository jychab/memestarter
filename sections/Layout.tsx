import React, { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Meme Starter</title>
        <meta name="description" content="Fund your favourite memes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-gray-900">
        <Navbar />
        <main className="flex text-white justify-center p-6 w-full min-h-screen">
          <ToastContainer position="bottom-left" theme="dark" />
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
