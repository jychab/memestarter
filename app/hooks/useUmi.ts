import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import useSWR from "swr";

const useUmi = () => {
  // Import useWallet hook
  const wallet = useWallet();
  const { connection } = useConnection();

  // Create Umi instance memoized with useMemo
  const umi = useMemo(() => {
    return (
      createUmi(connection.rpcEndpoint)
        // Register Wallet Adapter to Umi
        .use(walletAdapterIdentity(wallet))
        .use(dasApi())
        .use(mplTokenMetadata())
    );
  }, [connection.rpcEndpoint, wallet]);

  const searchAssets = (input: string | null | undefined) => {
    const { data, error, isLoading } = useSWR(
      input ? JSON.parse(input) : null,
      umi.rpc.searchAssets
    );
    return { data, error, isLoading };
  };

  const getAsset = (assetId: string | null | undefined) => {
    const { data, error, isLoading } = useSWR(
      assetId ? publicKey(assetId) : null,
      umi.rpc.getAsset
    );
    return { data, error, isLoading };
  };

  return { searchAssets, getAsset };
};

export default useUmi;
