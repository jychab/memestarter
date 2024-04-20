import {
  buildSimpleTransaction,
  generatePubKey,
  TxVersion,
} from "@raydium-io/raydium-sdk";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { updateMarketData } from "./cloudFunctions";
import { db } from "./firebase";
import { determineOptimalParameters, getCollectionMintAddress } from "./helper";
import {
  buyPresaleIx,
  createMarketPart1,
  createMarketPart2,
  createMarketPart3,
  createPurchaseAuthorisationIx,
  getVaultOwnerAndNonce,
  initializePoolIx,
  launchTokenAmm,
} from "./instructions";
import { buildAndSendTransaction } from "./transactions";
import { CreatePoolArgs, DAS, MarketDetails, PoolType } from "./types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { OPENBOOK_MARKET_PROGRAM_ID } from "./constants";
import { BN } from "@coral-xyz/anchor";

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
      amountOfSolInWallet.lamports <= LAMPORTS_PER_SOL * 4) &&
    docRef.empty
  ) {
    throw new Error("Insufficient Sol. You need at least 4 Sol.");
  }

  let {
    created,
    marketId,
    marketSeed,
    baseVault,
    quoteVault,
    requestQueue,
    eventQueue,
    bids,
    asks,
    vaultSignerNonce,
  } = !docRef.empty
    ? (docRef.docs[0].data() as MarketDetails)
    : ({} as MarketDetails);
  if (!created) {
    if (!marketId || !marketSeed || !baseVault || !quoteVault) {
      toast.info("Creating Market Part 1...");
      const market = generatePubKey({
        fromPublicKey: publicKey,
        programId: OPENBOOK_MARKET_PROGRAM_ID,
      });

      const { vaultOwner, vaultSignerNonce: nonce } = getVaultOwnerAndNonce(
        market.publicKey
      );
      const {
        instructions: ix1,
        baseVault: bv,
        quoteVault: qv,
      } = await createMarketPart1(
        connection,
        publicKey,
        new PublicKey(pool.mint),
        vaultOwner
      );
      await buildAndSendTransaction(
        connection,
        ix1,
        publicKey,
        signTransaction
      );
      await updateMarketData({
        pubKey: publicKey.toBase58(),
        poolId: pool.pool,
        marketDetails: {
          vaultSignerNonce: Number(nonce),
          marketSeed: market.seed,
          marketId: market.publicKey.toBase58(),
          baseVault: bv.publicKey.toBase58(),
          quoteVault: qv.publicKey.toBase58(),
          created: false,
        },
      });
      created = false;
      vaultSignerNonce = Number(nonce);
      marketSeed = market.seed;
      marketId = market.publicKey.toBase58();
      baseVault = bv.publicKey.toBase58();
      quoteVault = qv.publicKey.toBase58();
    }

    if (!requestQueue || !eventQueue || !bids || !asks) {
      toast.info("Creating Market Part 2...");
      const {
        instructions: ix2,
        requestQueue: rq,
        eventQueue: eq,
        bids: b,
        asks: a,
      } = await createMarketPart2(
        publicKey,
        { publicKey: new PublicKey(marketId), seed: marketSeed },
        connection
      );
      await buildAndSendTransaction(
        connection,
        ix2,
        publicKey,
        signTransaction
      );
      await updateMarketData({
        pubKey: publicKey.toBase58(),
        poolId: pool.pool,
        marketDetails: {
          marketId: marketId,
          requestQueue: rq.publicKey.toBase58(),
          eventQueue: eq.publicKey.toBase58(),
          bids: b.publicKey.toBase58(),
          asks: a.publicKey.toBase58(),
          created: false,
        },
      });
      created = false;
      requestQueue = rq.publicKey.toBase58();
      eventQueue = eq.publicKey.toBase58();
      bids = b.publicKey.toBase58();
      asks = a.publicKey.toBase58();
    }

    toast.info("Creating Market Part 3...");
    const { tickSize, orderSize } = await determineOptimalParameters(
      { pool: pool.pool, decimal: pool.decimal },
      connection
    );
    const { instructions: ix3 } = await createMarketPart3(
      new PublicKey(pool.mint),
      pool.decimal,
      orderSize,
      tickSize,
      new PublicKey(marketId),
      new PublicKey(baseVault),
      new PublicKey(quoteVault),
      new PublicKey(requestQueue),
      new PublicKey(eventQueue),
      new PublicKey(bids),
      new PublicKey(asks),
      new BN(vaultSignerNonce)
    );
    await buildAndSendTransaction(
      connection,
      [ix3],
      publicKey,
      signTransaction
    );
    await updateMarketData({
      pubKey: publicKey.toBase58(),
      poolId: pool.pool,
      marketDetails: {
        marketId: marketId,
        created: true,
      },
    });
  }
  toast.info("Launching Token...");
  const ix4 = await launchTokenAmm(
    {
      marketId: new PublicKey(marketId),
      mint: new PublicKey(pool.mint),
      signer: publicKey,
      poolAuthority: new PublicKey(pool.authority),
      poolId: new PublicKey(pool.pool),
    },
    connection
  );
  await buildAndSendTransaction(connection, [ix4], publicKey, signTransaction);
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
  if (
    !amountOfSolInWallet ||
    amountOfSolInWallet.lamports <
      parseFloat(amountToPurchase) * LAMPORTS_PER_SOL
  ) {
    throw Error(`Insufficient Sol. You need at least ${amountToPurchase} Sol.`);
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
      amount: parseFloat(amountToPurchase) * LAMPORTS_PER_SOL,
      nft: new PublicKey(nft.id),
      nftCollection: nftCollection,
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
