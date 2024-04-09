import {CallableContext} from "firebase-functions/v1/https";
import {Keypair, PublicKey} from "@solana/web3.js";
import nacl = require("tweetnacl");
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

admin.initializeApp();

export const db = admin.firestore();
export let helius: Helius;
export let umi: Umi;
export let program: Program<SafePresale>;
export const programEventAuthority = defineString("PROGRAM_EVENT_AUTHORITY");
const programId = defineString("PROGRAM_ID");
const collectionAuthority = defineString("COLLECTION_AUTHORITY");
const heliusApiKey = defineString("HELIUS_API_KEY");
const prod = false;
onInit(() => {
  helius = new Helius(heliusApiKey.value(), prod ? "mainnet-beta" : "devnet");
  umi = createUmi(helius.connection);
  const key = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode(collectionAuthority.value())
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

/**
 * Verifies a given signature against a public key using a message and the NaCl library.
 * @param {CallableContext} context - The context object containing information about the call.
 * @param {string} signature - The signature to verify, encoded in base64 format.
 * @param {string} pubKey - The public key used for verification.
 * @return {boolean} Returns true if the signature is valid, false otherwise.
 */
export function verifyPubKey(
  context: CallableContext,
  signature: string,
  pubKey: string
): boolean {
  const idToken =
    context.rawRequest.headers.authorization!.split("Bearer ")[1]!;
  const prepend = "Sign In To Meme Starter!\n\nSession Key: ";
  const msg = new TextEncoder().encode(prepend + idToken);
  const sig = new Uint8Array(Buffer.from(signature, "base64"));
  const publicKey = new PublicKey(pubKey).toBytes();
  return nacl.sign.detached.verify(msg, sig, publicKey);
}
