import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db, umi} from "./utils";
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
import {FieldValue} from "firebase-admin/firestore";

async function uploadMetadata(
  name: string,
  description: string,
  imageUrl: string,
  externalUrl: string
) {
  const uri = await umi.uploader.uploadJson({
    name: name,
    symbol: name,
    description: description,
    image: imageUrl,
    external_url: externalUrl,
  });
  return uri;
}
export default async function mintNft(context: CallableContext): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }

  const collectionNft = publicKey(
    "Bs1sGga8rTdnwqi9W5f8eEP2neqBQstmv1ehDDDdGsGe"
  );

  const {name, uri} = await db.runTransaction(async (dbTx) => {
    const details = await dbTx.get(db.collection("Collection").doc("Details"));
    const index = details.exists ? details.data()!.supply : 0;
    const name = `#${index + 1}`;
    const uri = await uploadMetadata(
      name,
      "",
      "https://bafkreieapbefkc5xkr7ncdqegdsl4slmaw4wz3o2r44ksaw5nfujto2daq.ipfs.nftstorage.link/",
      "www.memestarter.app"
    );
    dbTx.set(
      db.collection("Collection").doc("Details"),
      {
        supply: FieldValue.increment(1),
      },
      {merge: true}
    );
    return {name, uri};
  });
  const randomNft = generateSigner(umi);
  const transaction = createNft(umi, {
    mint: randomNft,
    name: name,
    tokenOwner: publicKey(context.auth.uid),
    uri: uri,
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
        source: createNoopSigner(publicKey(context.auth.uid)),
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
