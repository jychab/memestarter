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
import { HELIUS_ENDPOINT } from "../utils/constants";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const wallets = useMemo(() => [], [network]);

  const onError = useCallback((error: WalletError) => {
    console.log(error);
  }, []);

  return (
    <ConnectionProvider endpoint={HELIUS_ENDPOINT}>
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
