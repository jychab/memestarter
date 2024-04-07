import React, { FC } from "react";
import Link from "next/link";
import { SignInBtn } from "./buttons/SignInBtn";
import { UserProfileBtn } from "./buttons/UserProfileBtn";
import { useWallet } from "@solana/wallet-adapter-react";
import { CreateProjectBtn } from "./buttons/CreateProjectBtn";

export const Navbar: FC = () => {
  const { publicKey } = useWallet();

  return (
    <nav>
      <div className="container mx-auto w-full p-4 flex justify-between items-center">
        <Link
          className="shadow-2xl text-blue-100 uppercase text-base lg:text-2xl"
          href="/"
        >
          MEME STARTER
        </Link>
        <div className="flex items-end justify-end gap-4">
          <CreateProjectBtn />
          {!publicKey ? <SignInBtn /> : <UserProfileBtn />}
        </div>
      </div>
    </nav>
  );
};
