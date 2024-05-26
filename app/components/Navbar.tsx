import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import logo from "../public/name.png";
import { CreateProjectBtn } from "./buttons/CreateProjectBtn";
import { SignInBtn } from "./buttons/SignInBtn";
import { UserProfileBtn } from "./buttons/UserProfileBtn";

export const Navbar: FC = () => {
  const { publicKey } = useWallet();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 pt-8 pb-8 shadow-sm">
      <div className="mx-auto flex justify-between items-center max-w-screen-2xl">
        <Link className="text-black uppercase text-base md:text-xl" href="/">
          <Image src={logo} width={140} className="h-auto" alt={"logo"} />
        </Link>
        <div className="flex items-center justify-end gap-2">
          <CreateProjectBtn />
          {!publicKey ? <SignInBtn /> : <UserProfileBtn />}
        </div>
      </div>
    </nav>
  );
};
