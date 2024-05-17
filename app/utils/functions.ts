import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { ref, uploadBytes, uploadString } from "firebase/storage";
import { toast } from "react-toastify";
import { DOMAIN_API_URL } from "./constants";
import { db, storage } from "./firebase";
import { getCollectionMintAddress } from "./helper";
import {
  buyPresaleIx,
  createPurchaseAuthorisationIx,
  initializePoolIx,
  launchTokenAmm,
} from "./instructions";
import { buildAndSendTransaction } from "./transactions";
import { CreatePoolArgs, DAS, PoolType } from "./types";

export async function launchToken(
  pool: PoolType,
  connection: Connection,
  publicKey: PublicKey,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
  const docRef = await getDocs(
    query(collection(db, `Pool/${pool.pool}/Market/`), limit(1))
  );
  if (
    (!amountOfSolInWallet ||
      amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 0.4) &&
    docRef.empty
  ) {
    throw new Error("Insufficient Sol. You need at least 0.4 Sol.");
  }

  toast.info("Launching Token...");
  const ix = await launchTokenAmm(
    {
      mint: new PublicKey(pool.mint),
      quoteMint: new PublicKey(pool.quoteMint),
      signer: publicKey,
      poolId: new PublicKey(pool.pool),
    },
    connection
  );
  await buildAndSendTransaction(connection, [ix], publicKey, signTransaction);
}

export async function buyPresale(
  pool: PoolType,
  nft: DAS.GetAssetResponse,
  amountToPurchase: string,
  publicKey: PublicKey,
  connection: Connection,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
  const amount = parseFloat(amountToPurchase);
  if (
    !amountOfSolInWallet ||
    amountOfSolInWallet.lamports < amount * LAMPORTS_PER_SOL * 1.01
  ) {
    throw Error(`Insufficient Sol. You need at least ${amount * 1.01} Sol.`);
  }
  let nftCollection;
  if (pool.collectionsRequired) {
    const collectionMintAddress = getCollectionMintAddress(nft);
    if (!collectionMintAddress) {
      throw Error("NFT has no collection");
    }
    nftCollection = new PublicKey(collectionMintAddress);
  }

  const ix = await buyPresaleIx(
    {
      quoteMint: new PublicKey(pool.quoteMint),
      amount: amount * LAMPORTS_PER_SOL,
      nft: new PublicKey(nft.id),
      nftCollection: nftCollection,
      poolId: new PublicKey(pool.pool),
      signer: publicKey,
    },
    connection
  );

  await buildAndSendTransaction(connection, ix, publicKey, signTransaction);
}

export async function uploadMetadata(
  name: string,
  symbol: string,
  description: string,
  image: string,
  externalUrl: string
) {
  const payload = {
    name,
    symbol,
    description,
    image,
    externalUrl,
  };
  const uuid = crypto.randomUUID();
  const reference = ref(storage, uuid);
  // 'file' comes from the Blob or File API
  await uploadString(reference, JSON.stringify(payload));
  const uri = `${DOMAIN_API_URL}/metadata/${uuid}`;
  return uri;
}

export async function uploadImage(picture: Blob) {
  const uuid = crypto.randomUUID();
  const reference = ref(storage, uuid);
  // 'file' comes from the Blob or File API
  await uploadBytes(reference, picture);
  const imageUrl = `${DOMAIN_API_URL}/images/${uuid}`;
  return imageUrl;
}

export async function createPool(
  args: CreatePoolArgs,
  connection: Connection,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  if (args.initialSupply < 0) {
    throw new Error("Liquidity Pool Supply cannot be higher than total supply");
  }
  if (args.creatorFeesBasisPoints > 5000) {
    throw new Error("Creator's Share cannot be higher than 50%");
  }
  if (args.presaleTarget < LAMPORTS_PER_SOL) {
    throw new Error(
      "Presale Target is too low. It needs to be higher than 1 Sol."
    );
  }
  if (args.presaleDuration > 30 * 24 * 60 * 60) {
    throw new Error("Presale duration cannot be longer than a month");
  }
  let ix = [];
  const { instruction, poolId } = await initializePoolIx(
    {
      quoteMint: args.quoteMint,
      name: args.name,
      symbol: args.symbol,
      decimal: args.decimal,
      uri: args.uri,
      creatorFeesBasisPoints: args.creatorFeesBasisPoints,
      presaleDuration: args.presaleDuration,
      presaleTarget: args.presaleTarget,
      vestingPeriod: args.vestingPeriod,
      initialSupply: args.initialSupply,
      liquidityPoolSupply: args.liquidityPoolSupply,
      signer: args.publicKey,
      maxAmountPerPurchase: args.maxAmountPerPurchase,
      requiresCollection: args.requiresCollection,
    },
    connection
  );
  ix.push(instruction);
  if (args.requiresCollection) {
    ix = ix.concat(
      await Promise.all(
        args.collectionsRequired.map((collection) =>
          createPurchaseAuthorisationIx(
            {
              collectionMint: new PublicKey(collection.mintAddress),
              signer: args.publicKey,
              poolId: poolId,
            },
            connection
          )
        )
      )
    );
  }
  await buildAndSendTransaction(
    connection,
    ix,
    args.publicKey,
    signTransaction
  );
}
