import { BN, Program } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Liquidity,
  WSOL,
  RENT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  MarketV2,
  TxVersion,
  generatePubKey,
  ZERO,
  splitTxAndSigners,
  MARKET_STATE_LAYOUT_V2,
  InstructionType,
} from "@raydium-io/raydium-sdk";
import {
  createInitializeAccountInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { generateRandomU64 } from "./helper";
import {
  WithdrawArgs,
  WithdrawLpArgs,
  ClaimArgs,
  CheckClaimElligbilityArgs,
  LaunchTokenAmmArgs,
  CreateMarketArgs,
  BuyPresaleArgs,
  CreatePurchaseAuthorisationRecordArgs,
  InitializePoolArgs,
} from "./types";
import { SafePresale, IDL as SafePresaleIdl } from "./idl";
import {
  FEE_COLLECTOR,
  LOOKUP_TABLE,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  OPENBOOK_MARKET_PROGRAM_ID,
  PROGRAM_ID,
  RAYDIUM_AMM_V4,
  RAYDIUM_FEE_COLLECTOR,
} from "./constants";

export const program = (connection: Connection) =>
  new Program<SafePresale>(SafePresaleIdl, PROGRAM_ID, { connection });

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
  const [nftMetadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      args.nft.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  return await program(connection)
    .methods.withdraw()
    .accounts({
      nftMetadata: nftMetadata,
      purchaseReceipt: purchaseReceipt,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      pool: args.poolId,
      payer: args.signer,
      payerWsolTokenAccount: signerWsolTokenAccount,
      nftOwner: args.nftOwner,
      poolWsolTokenAccount: poolWsolTokenAccount,
      wsol: NATIVE_MINT,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
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
  const nftOwnerLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.nftOwner,
    true
  );
  const poolAuthorityLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolAuthority,
    true
  );
  const [nftMetadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      args.nft.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
  const purchaseReceiptLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    purchaseReceipt,
    true
  );
  return await program(connection)
    .methods.withdrawLpTokens()
    .accounts({
      purchaseReceiptLpTokenAccount: purchaseReceiptLpTokenAccount,
      poolAuthority: args.poolAuthority,
      poolAuthorityLpTokenAccount: poolAuthorityLpTokenAccount,
      nftOwnerLpTokenAccount: nftOwnerLpTokenAccount,
      nftMetadata: nftMetadata,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nftOwner: args.nftOwner,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      lpMint: args.lpMint,
      payer: args.signer,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
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
  const purchaseReceiptLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    purchaseReceipt,
    true
  );
  const poolLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.checkClaimEllgibility()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      payer: args.signer,
      purchaseReceiptLpTokenAccount: purchaseReceiptLpTokenAccount,
      poolLpTokenAccount: poolLpTokenAccount,
      lpMint: args.lpMint,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
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
    baseDecimals: args.decimals,
    quoteDecimals: WSOL.decimals,
    programId: RAYDIUM_AMM_V4,
    marketProgramId: OPENBOOK_MARKET_PROGRAM_ID,
  });
  const userTokenLp = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    args.signer,
    true
  );
  const poolTokenLp = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    args.poolId,
    true
  );
  const remainingAccounts = [
    { pubkey: poolInfo.lpMint, isSigner: false, isWritable: true },
    { pubkey: userTokenLp, isSigner: false, isWritable: true },
    { pubkey: poolTokenLp, isSigner: false, isWritable: true },
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
      pubkey: RAYDIUM_FEE_COLLECTOR,
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

  return await program(connection)
    .methods.launchTokenAmm(poolInfo.nonce, new BN(Date.now() / 1000))
    .accounts({
      pool: args.poolId,
      userWallet: args.signer,
      poolAuthority: args.poolAuthority,
      userTokenCoin: userTokenCoin,
      userTokenPc: userTokenPc,
      poolTokenCoin: poolTokenCoin,
      poolTokenPc: poolTokenPc,
      rent: RENT_PROGRAM_ID,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      ammCoinMint: poolInfo.baseMint,
      ammPcMint: poolInfo.quoteMint,
      raydiumAmmProgram: RAYDIUM_AMM_V4,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
}
export async function createMarketPart3(
  mint: PublicKey,
  decimal: number,
  lotSize: number,
  tickSize: number,
  marketId: PublicKey,
  baseVault: PublicKey,
  quoteVault: PublicKey,
  requestQueue: PublicKey,
  eventQueue: PublicKey,
  bids: PublicKey,
  asks: PublicKey,
  vaultSignerNonce: BN
) {
  const baseLotSize = new BN(Math.round(10 ** decimal * lotSize));
  const quoteLotSize = new BN(
    Math.round(lotSize * 10 ** WSOL.decimals * tickSize)
  );
  const feeRateBps = 0;
  const quoteDustThreshold = new BN(100);

  if (baseLotSize.eq(ZERO)) throw Error("lot size is too small");
  if (quoteLotSize.eq(ZERO)) throw Error("tick size or lot size is too small");

  const ix3 = MarketV2.initializeMarketInstruction({
    programId: OPENBOOK_MARKET_PROGRAM_ID,
    marketInfo: {
      id: marketId,
      requestQueue: requestQueue,
      eventQueue: eventQueue,
      bids: bids,
      asks: asks,
      baseVault: baseVault,
      quoteVault: quoteVault,
      baseMint: mint,
      quoteMint: NATIVE_MINT,
      baseLotSize: baseLotSize,
      quoteLotSize: quoteLotSize,
      feeRateBps: feeRateBps,
      vaultSignerNonce: vaultSignerNonce,
      quoteDustThreshold: quoteDustThreshold,
    },
  });

  return { instructions: ix3 };
}
export async function createMarketPart2(
  signer: PublicKey,
  market: { publicKey: PublicKey; seed: string },
  connection: Connection
) {
  const requestQueue = generatePubKey({
    fromPublicKey: signer,
    programId: OPENBOOK_MARKET_PROGRAM_ID,
  });
  const eventQueue = generatePubKey({
    fromPublicKey: signer,
    programId: OPENBOOK_MARKET_PROGRAM_ID,
  });
  const bids = generatePubKey({
    fromPublicKey: signer,
    programId: OPENBOOK_MARKET_PROGRAM_ID,
  });
  const asks = generatePubKey({
    fromPublicKey: signer,
    programId: OPENBOOK_MARKET_PROGRAM_ID,
  });

  const ins2: TransactionInstruction[] = [];
  ins2.push(
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: market.seed,
      newAccountPubkey: market.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        MARKET_STATE_LAYOUT_V2.span
      ),
      space: MARKET_STATE_LAYOUT_V2.span,
      programId: OPENBOOK_MARKET_PROGRAM_ID,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: requestQueue.seed,
      newAccountPubkey: requestQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(5120 + 12),
      space: 5120 + 12,
      programId: OPENBOOK_MARKET_PROGRAM_ID,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: eventQueue.seed,
      newAccountPubkey: eventQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: OPENBOOK_MARKET_PROGRAM_ID,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: bids.seed,
      newAccountPubkey: bids.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: OPENBOOK_MARKET_PROGRAM_ID,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: asks.seed,
      newAccountPubkey: asks.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: OPENBOOK_MARKET_PROGRAM_ID,
    })
  );
  return {
    instructions: ins2,
    market,
    requestQueue,
    eventQueue,
    bids,
    asks,
  };
}

export async function createMarketPart1(
  connection: Connection,
  signer: PublicKey,
  mint: PublicKey,
  vaultOwner: PublicKey
) {
  const baseVault = generatePubKey({
    fromPublicKey: signer,
    programId: TOKEN_PROGRAM_ID,
  });
  const quoteVault = generatePubKey({
    fromPublicKey: signer,
    programId: TOKEN_PROGRAM_ID,
  });
  const ins1: TransactionInstruction[] = [];
  const accountLamports = await connection.getMinimumBalanceForRentExemption(
    165
  );
  ins1.push(
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: baseVault.seed,
      newAccountPubkey: baseVault.publicKey,
      lamports: accountLamports,
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: signer,
      basePubkey: signer,
      seed: quoteVault.seed,
      newAccountPubkey: quoteVault.publicKey,
      lamports: accountLamports,
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(baseVault.publicKey, mint, vaultOwner),
    createInitializeAccountInstruction(
      quoteVault.publicKey,
      NATIVE_MINT,
      vaultOwner
    )
  );

  return {
    instructions: ins1,
    baseVault,
    quoteVault,
  };
}

export function getVaultOwnerAndNonce(market: PublicKey) {
  const vaultSignerNonce: BN = new BN(0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const vaultOwner = PublicKey.createProgramAddressSync(
        [market.toBuffer(), vaultSignerNonce.toArrayLike(Buffer, "le", 8)],
        OPENBOOK_MARKET_PROGRAM_ID
      );
      return { vaultOwner, vaultSignerNonce };
    } catch (e) {
      vaultSignerNonce.iaddn(1);
      if (vaultSignerNonce.gt(new BN(25555)))
        throw Error("find vault owner error");
    }
  }
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
  const [nftMetadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      args.nft.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
  const nftOwnerOriginalMintAta = getAssociatedTokenAddressSync(
    args.nft,
    args.signer,
    true
  );

  let purchaseAuthorisationRecord: PublicKey | null = null;
  if (args.nftCollection) {
    [purchaseAuthorisationRecord] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("authorisation"),
        args.poolId.toBuffer(),
        args.nftCollection.toBuffer(),
      ],
      program(connection).programId
    );
  }

  return await program(connection)
    .methods.buyPresale(new BN(args.amount))
    .accounts({
      purchaseAuthorisationRecord: purchaseAuthorisationRecord,
      nftMetadata: nftMetadata,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      wsolMint: NATIVE_MINT,
      poolWsolTokenAccount: poolAndWSOLATA,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nft: args.nft,
      payer: args.signer,
      feeCollector: FEE_COLLECTOR,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
export async function createPurchaseAuthorisationIx(
  args: CreatePurchaseAuthorisationRecordArgs,
  connection: Connection
) {
  const [purchaseAuthorisationRecord] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("authorisation"),
      args.poolId.toBuffer(),
      args.collectionMint.toBuffer(),
    ],
    program(connection).programId
  );
  return await program(connection)
    .methods.createPurchaseAuthorisation(args.collectionMint)
    .accounts({
      payer: args.signer,
      pool: args.poolId,
      purchaseAuthorisationRecord: purchaseAuthorisationRecord,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
export async function initializePoolIx(
  args: InitializePoolArgs,
  connection: Connection
) {
  const randomKey = generateRandomU64();
  const [rewardMintKey] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), new BN(randomKey).toArrayLike(Buffer, "le", 8)],
    program(connection).programId
  );
  const [poolId] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), rewardMintKey.toBuffer()],
    program(connection).programId
  );
  const rewardMint = {
    mint: rewardMintKey,
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

  return {
    instruction: await program(connection)
      .methods.initPool({
        name: rewardMint.name,
        symbol: rewardMint.symbol,
        decimals: rewardMint.decimal,
        uri: rewardMint.uri,
        presaleDuration: args.presaleDuration,
        presaleTarget: new BN(args.presaleTarget),
        creatorFeeBasisPoints: args.creatorFeesBasisPoints,
        vestingPeriod: args.vestingPeriod,
        totalSupply: new BN(args.totalSupply),
        randomKey: new BN(randomKey),
        maxAmountPerPurchase: args.maxAmountPerPurchase
          ? new BN(args.maxAmountPerPurchase)
          : null,
        delegate: null,
        requiresCollection: args.requiresCollection,
      })
      .accounts({
        payer: args.signer,
        pool: poolId,
        rewardMint: rewardMint.mint,
        rewardMintMetadata: rewardMintMetadata,
        poolRewardMintTokenAccount: poolAndMintRewardAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        mplTokenProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
    poolId: poolId,
  };
}
