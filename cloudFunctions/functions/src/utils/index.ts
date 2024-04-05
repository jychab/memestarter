import {CallableContext} from "firebase-functions/v1/https";
import {Keypair, PublicKey} from "@solana/web3.js";
import nacl = require("tweetnacl");
import admin = require("firebase-admin");
import {Helius} from "helius-sdk";
import {AnchorProvider, Program, Wallet} from "@coral-xyz/anchor";
import {IDL as SafePresaleIdl, SafePresale} from "./idl";

admin.initializeApp();

export const db = admin.firestore();

const prod = false;

export const helius = new Helius(
  process.env.HELIUS_API_KEY!,
  prod ? "mainnet-beta" : "devnet"
);

export const programId = "8caweP2SL16aUW55my9muRgp5xvfQh2qepYNtB3SFDjx";
export const programEventAuthority =
  "H84Lfmj1aaMzJP53xdVF6VtnkFJ8YePW81rd5dfFxkgK";

export const program = new Program<SafePresale>(
  SafePresaleIdl,
  new PublicKey(programId),
  new AnchorProvider(helius.connection, new Wallet(Keypair.generate()), {
    commitment: "confirmed",
  })
);

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
  const msg = new TextEncoder().encode(idToken);
  const sig = new Uint8Array(Buffer.from(signature, "base64"));
  const publicKey = new PublicKey(pubKey).toBytes();
  return nacl.sign.detached.verify(msg, sig, publicKey);
}
