import React, { FC } from "react";
import Link from "next/link";
import { SignInBtn } from "./buttons/SignInBtn";
import { UserProfileBtn } from "./buttons/UserProfileBtn";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateProjectBtn } from "./buttons/CreateProjectBtn";

export const Navbar: FC = () => {
  const { publicKey } = useWallet();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 pt-8 pb-8 shadow-sm">
      <div className="mx-auto flex justify-between items-center max-w-screen-2xl">
        <Link className="text-black uppercase text-base lg:text-xl" href="/">
          MEME STARTER
        </Link>
        <div className="flex items-center justify-end gap-4">
          {publicKey && <CreateProjectBtn />}
          {!publicKey ? <SignInBtn /> : <UserProfileBtn />}
        </div>
      </div>
    </nav>
  );
};
