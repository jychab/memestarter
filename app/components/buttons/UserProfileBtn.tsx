import React, { FC, useEffect, useRef, useState } from "react";
import { auth } from "../../utils/firebase";
import Image from "next/image";
import Link from "next/link";
import { useLogin } from "../../hooks/useLogin";
import { useWallet } from "@solana/wallet-adapter-react";
import placeholder from "../../public/favicon.ico";
import { useNetworkConfiguration } from "../../contexts/NetworkConfigurationProvider";
import { useRouter } from "next/router";

export const UserProfileBtn: FC = () => {
  const [expand, setExpand] = useState(false);
  const { user } = useLogin();
  const { publicKey, disconnect, wallet } = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setExpand(false);
      }
    };

    // Attach event listener when the dialog is open
    if (expand) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expand]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpand(!expand)}
        className="flex text-sm bg-gray-800 rounded md:me-0 focus:ring-4 focus:ring-gray-600"
        id="user-menu-button"
      >
        <Image
          width={0}
          height={0}
          sizes="100vw"
          className="w-8 h-auto rounded"
          src={wallet ? wallet.adapter.icon : placeholder}
          alt={""}
        />
      </button>
      <div
        ref={dialogRef}
        hidden={!expand}
        className="absolute right-0 z-50 my-4 text-base list-none divide-y rounded-lg shadow bg-gray-700 divide-gray-600"
        id="user-dropdown"
      >
        <div className="px-4 py-3">
          <span className="block text-sm truncate max-w-36 text-white">
            {publicKey ? publicKey.toString() : ""}
          </span>
          <span className="block text-sm truncate text-gray-400">
            {networkConfiguration}
          </span>
        </div>
        <ul className="py-2">
          <li>
            <button
              onClick={() => {
                router.push("/profile");
                setExpand(false);
              }}
              className="flex w-full px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
            >
              Profile
            </button>
          </li>
          {/* <li>
            <button
              onClick={() => {
                router.push(`/transactions`);
                setExpand(false);
              }}
              className="flex w-full px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
            >
              Transactions
            </button>
          </li> */}
          <li>
            <button
              onClick={async () => {
                if (publicKey) {
                  await disconnect();
                }
                if (user !== null) {
                  await auth.signOut();
                }
                setExpand(false);
              }}
              className="flex w-full px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
