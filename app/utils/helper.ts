import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  BuyPresaleArgs,
  CheckClaimElligbilityArgs,
  ClaimArgs,
  CreateMarketArgs,
  DAS,
  InitializePoolArgs,
  LaunchTokenAmmArgs,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  PROGRAM_ID,
  PoolType,
  Status,
  WithdrawArgs,
  WithdrawLpArgs,
} from "./types";
import {
  Connection,
  TransactionInstruction,
  PublicKey,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import {
  DEVNET_PROGRAM_ID,
  Liquidity,
  MarketV2,
  RENT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TxVersion,
  WSOL,
  buildSimpleTransaction,
  publicKey,
} from "@raydium-io/raydium-sdk";
import { toast } from "react-toastify";
import { IDL as SafePresaleIdl, SafePresale } from "./idl";
import { User } from "firebase/auth";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";

export const program = (connection: Connection) =>
  new Program<SafePresale>(SafePresaleIdl, PROGRAM_ID, { connection });
/**
 * Retrieves the collection mint address from the provided asset response.
 * @param {DAS.GetAssetResponse} item - The asset response object.
 * @return {string | undefined} The collection mint address if found, otherwise undefined.
 */
export function getCollectionMintAddress(
  item: DAS.GetAssetResponse
): string | undefined {
  if (item.grouping) {
    const group = item.grouping?.find(
      (group) => group.group_key === "collection"
    );
    return group ? group.group_value : undefined;
  } else {
    return undefined;
  }
}

/**
 * Retrieves the attributes from the provided asset response.
 * @param {DAS.GetAssetResponse} item - The asset response object.
 * @return {DAS.Attribute[] | undefined} The attributes array if found, otherwise undefined.
 */
export function getAttributes(
  item: DAS.GetAssetResponse
): DAS.Attribute[] | undefined {
  if (item.content && item.content.metadata.attributes) {
    return item.content.metadata.attributes;
  } else {
    return undefined;
  }
}

export async function buildAndSendTransaction(
  connection: Connection,
  ixs: TransactionInstruction[],
  publicKey: PublicKey,
  signTransaction: <T extends VersionedTransaction | Transaction>(
    transaction: T
  ) => Promise<T>
) {
  const [microLamports, units, recentBlockhash] = await Promise.all([
    100,
    getSimulationUnits(connection, ixs, publicKey, []),
    connection.getLatestBlockhash(),
  ]);
  ixs.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
  if (units) {
    // probably should add some margin of error to units
    ixs.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: units * 1.1 })
    );
  }
  let tx = new VersionedTransaction(
    new TransactionMessage({
      instructions: ixs,
      recentBlockhash: recentBlockhash.blockhash,
      payerKey: publicKey,
    }).compileToV0Message()
  );
  const signedTx = await signTransaction(tx);
  const txId = await connection.sendTransaction(
    signedTx as VersionedTransaction
  );
  await connection.confirmTransaction({
    signature: txId,
    blockhash: recentBlockhash.blockhash,
    lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
  });
}

export async function sendTransactions(
  connection: Connection,
  txs: VersionedTransaction[],
  signTransaction: <T extends VersionedTransaction>(
    transaction: T
  ) => Promise<T>
) {
  const recentBlockhash = await connection.getLatestBlockhash();
  for (let tx of txs) {
    const simulation = await connection.simulateTransaction(tx);
    if (simulation.value.err) {
      throw new Error(JSON.stringify(simulation.value.err));
    } else {
      const signedTx = await signTransaction(tx);
      const txId = await connection.sendTransaction(
        signedTx as VersionedTransaction
      );
      await connection.confirmTransaction({
        signature: txId,
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      });
    }
  }
}

export async function getSimulationUnits(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: AddressLookupTableAccount[]
): Promise<number | undefined> {
  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  ];

  const testVersionedTxn = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables)
  );

  const simulation = await connection.simulateTransaction(testVersionedTxn, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
  if (simulation.value.err) {
    return undefined;
  }
  return simulation.value.unitsConsumed;
}

export async function initializePoolIx(
  args: InitializePoolArgs,
  connection: Connection
) {
  console.log(args);
  const [rewardMintPubKey] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), args.signer.toBuffer()],
    program(connection).programId
  );
  const [poolId] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), args.signer.toBuffer()],
    program(connection).programId
  );
  const rewardMint = {
    mint: rewardMintPubKey,
    name: args.name,
    symbol: args.symbol,
    decimal: args.decimal,
    uri: args.uri,
  };
  const [rewardMintMetadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      rewardMint.mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  const poolAndMintRewardAta = getAssociatedTokenAddressSync(
    rewardMint.mint,
    poolId,
    true
  );

  return await program(connection)
    .methods.initPool({
      name: rewardMint.name,
      symbol: rewardMint.symbol,
      decimals: rewardMint.decimal,
      uri: rewardMint.uri,
      presaleTarget: new BN(args.presaleTarget),
      maxPresaleTime: args.maxPresaleTime,
      creatorFeeBasisPoints: args.creator_fees_basis_points,
      vestingPeriod: args.vestingPeriod,
      vestedSupply: new BN(args.vestedSupply),
      totalSupply: new BN(args.totalSupply),
      delegate: null,
    })
    .accounts({
      payer: args.signer,
      pool: poolId,
      rewardMint: rewardMint.mint,
      rewardMintMetadata: rewardMintMetadata,
      poolRewardMintAta: poolAndMintRewardAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      mplTokenProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function buyPresaleIx(
  args: BuyPresaleArgs,
  connection: Connection
) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );
  const poolAndWSOLATA = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    args.poolId,
    true
  );

  const poolData = await program(connection).account.pool.fetchNullable(
    args.poolId
  );
  if (poolData === null) {
    throw Error("Pool does not exist!");
  }
  return await program(connection)
    .methods.buyPresale(new BN(args.amount))
    .accounts({
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      wsolMint: NATIVE_MINT,
      poolWsolTokenAccount: poolAndWSOLATA,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nft: args.nft,
      payer: args.signer,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function createMarket(
  args: CreateMarketArgs,
  connection: Connection
) {
  const { innerTransactions, address } =
    await MarketV2.makeCreateMarketInstructionSimple({
      connection: connection,
      wallet: args.signer,
      baseInfo: {
        mint: args.mint,
        decimals: args.decimal,
      },
      quoteInfo: {
        mint: NATIVE_MINT,
        decimals: WSOL.decimals,
      },
      lotSize: args.lotSize,
      tickSize: args.tickSize,
      dexProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
      makeTxVersion: TxVersion.V0,
    });
  return { innerTransactions, address };
}

export async function launchTokenAmm(
  args: LaunchTokenAmmArgs,
  connection: Connection
) {
  const poolInfo = Liquidity.getAssociatedPoolKeys({
    version: 4,
    marketVersion: 3,
    marketId: args.marketId,
    baseMint: args.mint,
    quoteMint: NATIVE_MINT,
    baseDecimals: 6,
    quoteDecimals: WSOL.decimals,
    programId: DEVNET_PROGRAM_ID.AmmV4,
    marketProgramId: DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
  });

  const remainingAccounts = [
    { pubkey: poolInfo.id, isSigner: false, isWritable: true },
    { pubkey: poolInfo.authority, isSigner: false, isWritable: false },
    {
      pubkey: poolInfo.openOrders,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: poolInfo.baseVault, isSigner: false, isWritable: true },
    { pubkey: poolInfo.quoteVault, isSigner: false, isWritable: true },
    { pubkey: poolInfo.targetOrders, isSigner: false, isWritable: true },
    { pubkey: poolInfo.configId, isSigner: false, isWritable: false },
    {
      pubkey: new PublicKey("3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"),
      isSigner: false,
      isWritable: true,
    },
    { pubkey: poolInfo.marketProgramId, isSigner: false, isWritable: false },
    { pubkey: poolInfo.marketId, isSigner: false, isWritable: false },
  ];

  const userTokenCoin = getAssociatedTokenAddressSync(
    poolInfo.baseMint,
    args.signer,
    true
  );
  const userTokenPc = getAssociatedTokenAddressSync(
    poolInfo.quoteMint,
    args.signer,
    true
  );
  const userTokenLp = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    args.signer,
    true
  );
  const poolTokenCoin = getAssociatedTokenAddressSync(
    poolInfo.baseMint,
    args.poolId,
    true
  );
  const poolTokenPc = getAssociatedTokenAddressSync(
    poolInfo.quoteMint,
    args.poolId,
    true
  );
  const poolTokenLp = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.launchTokenAmm(poolInfo.nonce, new BN(Date.now()))
    .accounts({
      pool: args.poolId,
      userWallet: args.signer,
      userTokenCoin: userTokenCoin,
      userTokenPc: userTokenPc,
      userTokenLp: userTokenLp,
      poolTokenCoin: poolTokenCoin,
      poolTokenPc: poolTokenPc,
      poolTokenLp: poolTokenLp,
      rent: RENT_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      ammCoinMint: poolInfo.baseMint,
      ammPcMint: poolInfo.quoteMint,
      ammLpMint: poolInfo.lpMint,
      raydiumAmmProgram: DEVNET_PROGRAM_ID.AmmV4,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
}

export async function checkClaimElligibility(
  args: CheckClaimElligbilityArgs,
  connection: Connection
) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );

  return await program(connection)
    .methods.checkClaimEllgibility()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      payer: args.signer,
    })
    .instruction();
}

export async function claim(args: ClaimArgs, connection: Connection) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );
  const nftOwnerOriginalMintAta = getAssociatedTokenAddressSync(
    args.nft,
    args.nftOwner,
    true
  );
  const nftOwnerRewardMintTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.nftOwner,
    true
  );
  return await program(connection)
    .methods.claimRewards()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nft: args.nft,
      nftOwner: args.nftOwner,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      rewardMint: args.mint,
      nftOwnerRewardMintTokenAccount: nftOwnerRewardMintTokenAccount,
      payer: args.signer,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function withdrawLp(args: WithdrawLpArgs, connection: Connection) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );
  const nftOwnerOriginalMintAta = getAssociatedTokenAddressSync(
    args.nft,
    args.signer,
    true
  );
  const poolAuthorityLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolAuthority,
    true
  );
  const signerLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.signer,
    true
  );
  const poolLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.withdrawLpToken()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      pool: args.poolId,
      poolAuthorityTokenLp: poolAuthorityLpTokenAccount,
      userWallet: args.signer,
      userTokenLp: signerLpTokenAccount,
      poolTokenLp: poolLpTokenAccount,
      lpMint: args.lpMint,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export async function withdraw(args: WithdrawArgs, connection: Connection) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );
  const nftOwnerOriginalMintAta = getAssociatedTokenAddressSync(
    args.nft,
    args.signer,
    true
  );
  const signerWsolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    args.signer,
    true
  );
  const poolWsolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    args.poolId,
    true
  );

  return await program(connection)
    .methods.withdraw()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      pool: args.poolId,
      payer: args.signer,
      payerTokenWsol: signerWsolTokenAccount,
      nft: args.nft,
      nftOwner: args.nftOwner,
      poolTokenWsol: poolWsolTokenAccount,
      wsol: NATIVE_MINT,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}

export function getStatus(pool: PoolType) {
  if (pool.vestingEndingAt && Date.now() / 1000 > pool.vestingEndingAt) {
    return Status.VestingCompleted;
  } else if (pool.vestingStartedAt) {
    return Status.VestingInProgress;
  } else if (
    pool.presaleTimeLimit &&
    ((Date.now() / 1000 > pool.presaleTimeLimit &&
      pool.liquidityCollected < pool.presaleTarget) ||
      Date.now() / 1000 > pool.presaleTimeLimit + 7 * 24 * 60 * 60)
  ) {
    return Status.Expired;
  } else if (
    pool.presaleTimeLimit &&
    Date.now() / 1000 > pool.presaleTimeLimit &&
    pool.liquidityCollected >= pool.presaleTarget
  ) {
    return Status.ReadyToLaunch;
  } else if (pool.liquidityCollected >= pool.presaleTarget) {
    return Status.PresaleTargetMet;
  } else if (pool.presaleTimeLimit) {
    return Status.PresaleInProgress;
  }
  return;
}

export function separateNumberWithComma(number: string) {
  let numberString = number;

  // Insert commas for thousands separation
  let separatedNumber = "";
  for (let i = numberString.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      separatedNumber = "," + separatedNumber;
    }
    separatedNumber = numberString[i] + separatedNumber;
  }

  return separatedNumber;
}

export function convertSecondsToNearestUnit(seconds: number) {
  // Define constants for conversion
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30; // Approximation for a month
  const year = day * 365; // Approximation for a year

  // Determine the nearest unit
  if (seconds < minute) {
    return `${seconds.toFixed(0)} second${seconds === 1 ? "" : "s"}`;
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    const remainingSeconds = seconds % minute;
    return `${minutes} minute${minutes === 1 ? "" : "s"}${
      remainingSeconds > 0
        ? ` ${Math.round(remainingSeconds)} second${
            remainingSeconds === 1 ? "" : "s"
          }`
        : ""
    }`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    const remainingMinutes = (seconds % hour) / minute;
    return `${hours} hour${hours === 1 ? "" : "s"}${
      remainingMinutes > 0
        ? ` ${Math.round(remainingMinutes)} minute${
            remainingMinutes === 1 ? "" : "s"
          }`
        : ""
    }`;
  } else if (seconds < month) {
    const days = Math.floor(seconds / day);
    const remainingHours = (seconds % day) / hour;
    return `${days} day${days === 1 ? "" : "s"}${
      remainingHours > 0
        ? ` ${remainingHours.toFixed(0)} hour${remainingHours === 1 ? "" : "s"}`
        : ""
    }`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    const remainingDays = (seconds % month) / day;
    return `${months} month${months === 1 ? "" : "s"}${
      remainingDays > 0
        ? ` ${remainingDays.toFixed(1)} day${remainingDays === 1 ? "" : "s"}`
        : ""
    }`;
  } else {
    const years = Math.floor(seconds / year);
    const remainingMonths = (seconds % year) / month;
    return `${years} year${years === 1 ? "" : "s"}${
      remainingMonths > 0
        ? ` ${remainingMonths.toFixed(1)} month${
            remainingMonths === 1 ? "" : "s"
          }`
        : ""
    }`;
  }
}

export async function getSignature(
  user: User,
  signedMessage: string | null,
  sessionKey: string | null,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  setSignedMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setSessionKey: React.Dispatch<React.SetStateAction<string | null>>
) {
  const sessKey = await user.getIdToken();
  let sig = signedMessage;
  if (!sig || sessionKey !== sessKey) {
    const prepend = "Sign In To Meme Starter!\n\nSession Key: ";
    const message = new TextEncoder().encode(prepend + sessKey);
    sig = Buffer.from(await signMessage(message)).toString("base64");
    setSignedMessage(sig);
    setSessionKey(sessKey);
  }
  return sig;
}

export async function getMetadata(pool: string): Promise<any | undefined> {
  if (typeof pool === "string") {
    const res = await fetch(pool);
    const data = res.json();
    return data;
  }
  return;
}
