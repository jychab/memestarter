import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode, useCallback, useMemo } from "react";
import {
  NetworkConfigurationProvider,
  useNetworkConfiguration,
} from "./NetworkConfigurationProvider";
import React from "react";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], [network]);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
    <ConnectionProvider
      endpoint={
        "https://devnet.helius-rpc.com/?api-key=67cc99fc-f14e-499c-9507-48127506901f"
      }
    >
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <WalletContextProvider>{children}</WalletContextProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
