import { getFunctions, httpsCallable } from "firebase/functions";
import { UpdateMarketDataArgs } from "./types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";

export async function getCurrentPrice(): Promise<{
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
  };
  success: boolean;
}> {
  const getPrice = httpsCallable(getFunctions(), "getPrice");
  return (
    await getPrice({ address: "So11111111111111111111111111111111111111112" })
  ).data as {
    data: {
      value: number;
      updateUnixTime: number;
      updateHumanTime: string;
    };
    success: boolean;
  };
}

export async function updateMarketData(
  payload: UpdateMarketDataArgs,
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  handleLogin: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => Promise<void>
) {
  await handleLogin(publicKey, signMessage);
  const updateMarket = httpsCallable(getFunctions(), "updateMarketDetails");
  await updateMarket(payload);
}

export async function verifyAndGetToken(
  publicKey: PublicKey,
  output: Uint8Array
) {
  const verifyResponse = httpsCallable(getFunctions(), "verifySignIn");
  return (
    await verifyResponse({
      signature: bs58.encode(output),
      publicKey: publicKey.toBase58(),
    })
  ).data as string;
}

export async function mintNft(
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  handleLogin: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => Promise<void>
) {
  await handleLogin(publicKey, signMessage);
  const mintNftFn = httpsCallable(getFunctions(), "mintNft");
  const { tx, mint } = (await mintNftFn()).data as {
    tx: string;
    mint: string;
  };
  return { tx, mint };
}

export async function linkAsset(
  asset: DasApiAsset,
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  handleLogin: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => Promise<void>
) {
  await handleLogin(publicKey, signMessage);
  const linkAssetFn = httpsCallable(getFunctions(), "linkAsset");
  await linkAssetFn({ nft: asset });
}

export async function unlinkAsset(
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  handleLogin: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => Promise<void>
) {
  await handleLogin(publicKey, signMessage);
  const unlinkAsset = httpsCallable(getFunctions(), "unlinkAsset");
  await unlinkAsset();
}
