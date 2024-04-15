import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

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

  return umi;
};

export default useUmi;
