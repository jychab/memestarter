import Image from "next/image";
import React, { FC, useEffect, useRef, useState } from "react";
import { Wallet, useWallet } from "@solana/wallet-adapter-react";
export const SignInBtn: FC = () => {
  const [open, setOpen] = useState(false);
  const { select, wallets, connected, connecting, signIn } = useWallet();

  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [connectionStatus, setConectionStatus] = useState<string>();

  const signInDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedWallet && select) {
      select(selectedWallet.adapter.name);
      if (connecting) {
        setConectionStatus("Connecting");
      } else if (connected) {
        setConectionStatus("Connected");
      }
    }
  }, [selectedWallet, connecting, connected, select]);

  useEffect(() => {
    // Function to handle click outside the dialog
    const handleClickOutside = (event: MouseEvent) => {
      if (
        signInDialogRef.current &&
        !signInDialogRef.current.contains(event.target as Node)
      ) {
        // Click occurred outside the dialog, so close the dialog
        setOpen(false);
      }
    };

    // Attach event listener when the dialog is open
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove event listener when the dialog is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-4 py-1 border flex gap-2 border-blue-gray-200 border-blue-gray-700 rounded-lg text-white text-blue-gray-200 hover:border-blue-gray-400 hover:border-blue-gray-500 hover:text-blue-gray-400 hover:text-blue-gray-300 hover:shadow transition duration-150"
        >
          Sign In
        </button>
      </div>
      <div
        className="fixed overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black/50"
        hidden={!open}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="rounded p-4 w-2/3 max-w-fit max-h-full flex flex-col items-center font-semibold justify-center text-white text-base bg-gray-800 border-2 border-gray-700">
            <div
              ref={signInDialogRef}
              className="flex flex-col gap-4 items-center justify-center"
            >
              <span>Select a wallet</span>
              {open &&
              wallets.filter((wallet) => wallet.readyState === "Installed")
                .length > 0 ? (
                wallets
                  .filter((wallet) => wallet.readyState === "Installed")
                  .map((wallet) => (
                    <button
                      className="flex items-center gap-4 max-w-sm px-4 py-2 border rounded-lg shadow bg-gray-800 border-gray-700 hover:bg-gray-700"
                      key={wallet.adapter.name}
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <Image
                        width={30}
                        height={30}
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                      />
                      {selectedWallet && wallet === selectedWallet
                        ? connectionStatus
                        : wallet.adapter.name}
                    </button>
                  ))
              ) : (
                <p className="text-center flex flex-col gap-2">
                  <span>No wallet found.</span>
                  <span>Please download a supported Solana wallet</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
