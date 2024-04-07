import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const useUmi = () => {
  // Import useWallet hook
  const wallet = useWallet();
  const { connection } = useConnection();

  // Create Umi instance
  const umi = createUmi(connection.rpcEndpoint)
    .use(
      nftStorageUploader({
        token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY!,
      })
    )
    // Register Wallet Adapter to Umi
    .use(walletAdapterIdentity(wallet))
    .use(dasApi())
    .use(mplTokenMetadata());

  return umi;
};

export default useUmi;
