import {
  publicKey,
  signAllTransactions,
  signTransaction,
} from "@metaplex-foundation/umi";
import { buildSimpleTransaction, TxVersion } from "@raydium-io/raydium-sdk";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { getDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { updateMarketData, verifyAndGetToken } from "./cloudFunctions";
import { auth, db } from "./firebase";
import {
  createLoginMessage,
  determineOptimalParameters,
  getCollectionMintAddress,
} from "./helper";
import {
  buyPresaleIx,
  createMarket,
  createPurchaseAuthorisationIx,
  initializePoolIx,
  launchTokenAmm,
} from "./instructions";
import { sendTransactions, buildAndSendTransaction } from "./transactions";
import { CreatePoolArgs, MarketDetails, PoolType } from "./types";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function launchToken(
  pool: PoolType,
  connection: Connection,
  publicKey: PublicKey,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>,
  signAllTransactions: <T extends VersionedTransaction | Transaction>(
    transactions: T[]
  ) => Promise<T[]>
) {
  const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
  const docRef = await getDoc(doc(db, `Pool/${pool.pool}/Market/${pool.mint}`));
  let marketId;
  if (
    (!amountOfSolInWallet ||
      amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 3) &&
    !docRef.exists()
  ) {
    throw new Error("Insufficient Sol. You need at least 3 Sol.");
  } else if (
    (!amountOfSolInWallet ||
      amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 0.2) &&
    docRef.exists()
  ) {
    throw new Error("Insufficient Sol. You need at least 0.2 Sol.");
  }
  if (!docRef.exists()) {
    toast.info("Determining optimal parameters...");
    const { tickSize, orderSize } = await determineOptimalParameters(
      { pool: pool.pool, decimal: pool.decimal },
      connection
    );
    toast.info("Creating Market..");
    const { innerTransactions, address } = await createMarket(
      {
        signer: publicKey,
        mint: new PublicKey(pool.mint),
        decimal: pool.decimal,
        lotSize: orderSize,
        tickSize: tickSize,
      },
      connection
    );
    const txs = await buildSimpleTransaction({
      connection: connection,
      makeTxVersion: TxVersion.V0,
      payer: publicKey,
      innerTransactions,
    });
    await sendTransactions(
      connection,
      txs as VersionedTransaction[],
      signAllTransactions
    );
    await updateMarketData({
      pubKey: publicKey.toBase58(),
      poolId: pool.pool,
      marketDetails: {
        marketId: address.marketId.toBase58(),
        requestQueue: address.requestQueue.toBase58(),
        eventQueue: address.eventQueue.toBase58(),
        bids: address.bids.toBase58(),
        asks: address.asks.toBase58(),
        baseVault: address.baseVault.toBase58(),
        quoteVault: address.quoteVault.toBase58(),
        baseMint: address.baseMint.toBase58(),
        quoteMint: address.quoteMint.toBase58(),
      } as MarketDetails,
    });
    marketId = address.marketId.toBase58();
  } else {
    marketId = (docRef.data() as MarketDetails).marketId;
  }
  let ix = [];
  ix.push(
    await launchTokenAmm(
      {
        marketId: new PublicKey(marketId),
        mint: new PublicKey(pool.mint),
        signer: publicKey,
        poolAuthority: new PublicKey(pool.authority),
        poolId: new PublicKey(pool.pool),
      },
      connection
    )
  );
  await buildAndSendTransaction(connection, ix, publicKey, signTransaction);
}

export async function buyPresale(
  pool: PoolType,
  nft: DasApiAsset,
  amountToPurchase: string,
  publicKey: PublicKey,
  connection: Connection,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  const amountOfSolInWallet = await connection.getAccountInfo(publicKey);
  if (
    !amountOfSolInWallet ||
    amountOfSolInWallet.lamports <=
      parseFloat(amountToPurchase) * LAMPORTS_PER_SOL
  ) {
    throw new Error(
      `Insufficient Sol. You need at least ${amountToPurchase} Sol.`
    );
  }
  const nftCollection = getCollectionMintAddress(nft);
  if (!nftCollection) {
    throw Error("NFT has no collection");
  }
  const ix = await buyPresaleIx(
    {
      amount: parseFloat(amountToPurchase) * LAMPORTS_PER_SOL,
      nft: new PublicKey(nft.id),
      nftCollection: new PublicKey(nftCollection),
      poolId: new PublicKey(pool.pool),
      signer: publicKey,
    },
    connection
  );

  await buildAndSendTransaction(connection, [ix], publicKey, signTransaction);
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
  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  const storage = getStorage();
  const uuid = crypto.randomUUID();
  const reference = ref(storage, uuid);
  // 'file' comes from the Blob or File API
  await uploadBytes(reference, blob);
  const uri = await getDownloadURL(reference);
  return uri;
}

export async function uploadImage(picture: Blob) {
  const storage = getStorage();
  const uuid = crypto.randomUUID();
  const reference = ref(storage, uuid);
  // 'file' comes from the Blob or File API
  await uploadBytes(reference, picture);
  const imageUrl = await getDownloadURL(reference);
  return imageUrl;
}

export async function createPool(
  args: CreatePoolArgs,
  connection: Connection,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  if (args.creatorFeesBasisPoints > 5000) {
    throw new Error("Creator Fees cannot be higher than 50%");
  }
  if (args.presaleTarget < LAMPORTS_PER_SOL) {
    throw new Error(
      "Presale Target is too low. It needs to be higher than 1 Sol."
    );
  }
  if (args.totalSupply < 1000000) {
    throw new Error("Total supply cannot be lower than 1,000,000");
  }
  if (args.vestedSupply > args.totalSupply) {
    throw new Error("Vesting supply cannot be higher than Total supply");
  }
  if (args.presaleDuration > 30 * 24 * 60 * 60) {
    throw new Error("Presale duration cannot be longer than a month");
  }
  let ix = [];
  const { instruction, poolId } = await initializePoolIx(
    {
      name: args.name,
      symbol: args.symbol,
      decimal: args.decimal,
      uri: args.uri,
      creatorFeesBasisPoints: args.creatorFeesBasisPoints,
      presaleDuration: args.presaleDuration,
      presaleTarget: args.presaleTarget,
      vestingPeriod: args.vestingPeriod,
      vestedSupply: args.vestedSupply,
      totalSupply: args.totalSupply,
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
