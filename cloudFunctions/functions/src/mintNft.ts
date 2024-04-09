import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {umi, verifyPubKey} from "./utils";
import {
  createNft,
  findMetadataPda,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createNoopSigner,
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import {transferSol} from "@metaplex-foundation/mpl-toolbox";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {base64} from "@coral-xyz/anchor/dist/cjs/utils/bytes";

interface MintNft {
  signature: string;
  pubKey: string;
}

export default async function mintNft(
  data: MintNft,
  context: CallableContext
): Promise<any> {
  // Checking that the user is authenticated.
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }
  if (context.auth.token.firebase.sign_in_provider === "anonymous") {
    if (!data.signature || !data.pubKey) {
      throw new HttpsError("aborted", "Missing pubkey or signature!");
    }
    const isValid = verifyPubKey(context, data.signature, data.pubKey);
    if (!isValid) {
      throw new HttpsError("aborted", "Pubkey signature verification failed");
    }
  } else {
    throw new HttpsError("aborted", "Wrong Authentication Provider!");
  }
  const collectionNft = publicKey(
    "Bs1sGga8rTdnwqi9W5f8eEP2neqBQstmv1ehDDDdGsGe"
  );
  const randomNft = generateSigner(umi);
  const transaction = createNft(umi, {
    mint: randomNft,
    name: "test",
    tokenOwner: publicKey(data.pubKey),
    uri: "https://example.com/my-collection.json",
    sellerFeeBasisPoints: percentAmount(3.33, 2),
    collection: {
      verified: false,
      key: collectionNft,
    },
  })
    .append(
      verifyCollectionV1(umi, {
        metadata: findMetadataPda(umi, {
          mint: randomNft.publicKey,
        })[0],
        collectionMint: collectionNft,
        authority: umi.identity,
      })
    )
    .append(
      transferSol(umi, {
        source: createNoopSigner(publicKey(data.pubKey)),
        destination: umi.identity.publicKey,
        amount: {
          basisPoints: new anchor.BN(0.5 * LAMPORTS_PER_SOL),
          identifier: "SOL",
          decimals: 9,
        },
      })
    );

  const tx = await transaction.buildAndSign(umi);
  return {
    tx: base64.encode(Buffer.from(umi.transactions.serialize(tx))),
    mint: randomNft.publicKey,
  };
}
