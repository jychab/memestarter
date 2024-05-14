import { BN } from "@coral-xyz/anchor";
import { generatePubKey } from "@raydium-io/raydium-sdk";
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
import { updateMarketData } from "./cloudFunctions";
import { DOMAIN_API_URL, OPENBOOK_MARKET_PROGRAM_ID } from "./constants";
import { db, storage } from "./firebase";
import { determineOptimalParameters, getCollectionMintAddress } from "./helper";
import {
  buyPresaleIx,
  createMarketPart1,
  createMarketPart2,
  createPurchaseAuthorisationIx,
  getVaultOwnerAndNonce,
  initializePoolIx,
  launchTokenAmm,
} from "./instructions";
import { buildAndSendTransaction } from "./transactions";
import { CreatePoolArgs, DAS, MarketDetails, PoolType } from "./types";

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
  if (
    !marketId ||
    !marketSeed ||
    !baseVault ||
    !quoteVault ||
    !requestQueue ||
    !eventQueue ||
    !bids ||
    !asks
  ) {
    toast.info("Launching Token Part 1...");
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
      requestQueue: rq,
      eventQueue: eq,
      bids: b,
      asks: a,
    } = await createMarketPart1(
      connection,
      publicKey,
      new PublicKey(pool.mint),
      new PublicKey(pool.quoteMint),
      vaultOwner,
      market
    );
    await buildAndSendTransaction(connection, ix1, publicKey, signTransaction);
    await updateMarketData({
      pubKey: publicKey.toBase58(),
      poolId: pool.pool,
      marketDetails: {
        vaultSignerNonce: Number(nonce),
        marketSeed: market.seed,
        marketId: market.publicKey.toBase58(),
        baseVault: bv.publicKey.toBase58(),
        quoteVault: qv.publicKey.toBase58(),
        requestQueue: rq.publicKey.toBase58(),
        eventQueue: eq.publicKey.toBase58(),
        bids: b.publicKey.toBase58(),
        asks: a.publicKey.toBase58(),
      },
    });
    vaultSignerNonce = Number(nonce);
    marketSeed = market.seed;
    marketId = market.publicKey.toBase58();
    baseVault = bv.publicKey.toBase58();
    quoteVault = qv.publicKey.toBase58();
    requestQueue = rq.publicKey.toBase58();
    eventQueue = eq.publicKey.toBase58();
    bids = b.publicKey.toBase58();
    asks = a.publicKey.toBase58();

    toast.info("Launching Token Part 2...");
    const { tickSize, orderSize } = await determineOptimalParameters(
      pool.totalSupply / 10 ** pool.decimal
    );
    const { instructions: ix2 } = await createMarketPart2(
      new PublicKey(pool.mint),
      new PublicKey(pool.quoteMint),
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
    const ix3 = await launchTokenAmm(
      {
        decimals: pool.decimal,
        marketId: new PublicKey(marketId),
        mint: new PublicKey(pool.mint),
        quoteMint: new PublicKey(pool.quoteMint),
        signer: publicKey,
        poolAuthority: new PublicKey(pool.authority),
        poolId: new PublicKey(pool.pool),
      },
      connection
    );
    await buildAndSendTransaction(
      connection,
      [ix2, ix3],
      publicKey,
      signTransaction
    );
  }
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
