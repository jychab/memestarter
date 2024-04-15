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
import { toast } from "react-toastify";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], [network]);

  const onError = useCallback((error: WalletError) => {
    toast.error(error.message ? `${error.name}: ${error.message}` : error.name);
  }, []);

  return (
    <ConnectionProvider
      endpoint={`https://${network}.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`}
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
