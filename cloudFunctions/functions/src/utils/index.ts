import {Keypair, PublicKey} from "@solana/web3.js";
import admin = require("firebase-admin");
import {Helius} from "helius-sdk";
import {AnchorProvider, Program, Wallet} from "@coral-xyz/anchor";
import {IDL as SafePresaleIdl, SafePresale} from "./idl";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {Umi, keypairIdentity} from "@metaplex-foundation/umi";
import {bs58} from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {defineString} from "firebase-functions/params";
import {onInit} from "firebase-functions/v1";
import {nftStorageUploader} from "@metaplex-foundation/umi-uploader-nft-storage";

admin.initializeApp();

export const db = admin.firestore();
export let helius: Helius;
export let umi: Umi;
export let program: Program<SafePresale>;
export const programEventAuthority = defineString("PROGRAM_EVENT_AUTHORITY");
const programId = defineString("PROGRAM_ID");
const collectionAuthority = defineString("COLLECTION_AUTHORITY");
const heliusApiKey = defineString("HELIUS_API_KEY");
const nftStorageKey = defineString("NFT_STORAGE_KEY");
export const birdEyeApiKey = defineString("BIRDEYE_API_KEY");
export const prod = true;
onInit(() => {
  helius = new Helius(heliusApiKey.value(), prod ? "mainnet-beta" : "devnet");
  umi = createUmi(helius.connection);
  const key = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode(collectionAuthority.value())
  );
  umi.use(
    nftStorageUploader({
      token: nftStorageKey.value(),
    })
  );
  umi.use(mplTokenMetadata());
  umi.use(keypairIdentity(key));

  program = new Program<SafePresale>(
    SafePresaleIdl,
    new PublicKey(programId.value()),
    new AnchorProvider(helius.connection, new Wallet(Keypair.generate()), {
      commitment: "confirmed",
    })
  );
});
