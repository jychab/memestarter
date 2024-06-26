import Head from "next/head";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Head>
        <title>Meme Starter</title>
        <meta name="description" content="Fund your favourite memes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <div className="bg-white">
        <Navbar />
        <main className="flex justify-center p-4 w-full min-h-screen">
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
