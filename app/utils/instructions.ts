import {
  TOKEN_PROGRAM_ID,
  Liquidity,
  WSOL,
  MarketV2,
  generatePubKey,
  ZERO,
  MARKET_STATE_LAYOUT_V2,
} from "@raydium-io/raydium-sdk";
import {
  NATIVE_MINT,
  createCloseAccountInstruction,
  createInitializeAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  generateRandomU64,
  getOrCreateAssociatedTokenAccountInstruction,
} from "./helper";
import {
  WithdrawArgs,
  WithdrawLpArgs,
  CheckClaimElligbilityArgs,
  LaunchTokenAmmArgs,
  BuyPresaleArgs,
  CreatePurchaseAuthorisationRecordArgs,
  InitializePoolArgs,
  WithdrawLpForCreatorArgs,
  ClaimRewardArgs,
  ClaimRewardForCreatorsArgs,
} from "./types";
import { SafePresale } from "./idl";
import IDL from "./idl.json";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  OPENBOOK_MARKET_PROGRAM_ID,
  RAYDIUM_AMM_V4,
  RAYDIUM_FEE_COLLECTOR,
} from "./constants";
import { BN, Program } from "@coral-xyz/anchor";

export const program = (connection: Connection) =>
  new Program<SafePresale>(IDL as SafePresale, { connection });

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
  const nftOwnerQuoteMintTokenAccount = getAssociatedTokenAddressSync(
    args.quoteMint,
    args.nftOwner,
    true
  );
  const poolQuoteMintTokenAccount = getAssociatedTokenAddressSync(
    args.quoteMint,
    args.poolId,
    true
  );
  const ixs = [];
  ixs.push(
    await program(connection)
      .methods.withdraw()
      .accounts({
        purchaseReceipt: purchaseReceipt,
        nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
        pool: args.poolId,
        payer: args.signer,
        nftOwnerQuoteMintTokenAccount: nftOwnerQuoteMintTokenAccount,
        nftOwner: args.nftOwner,
        quoteMint: args.quoteMint,
        poolQuoteMintTokenAccount: poolQuoteMintTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        program: program(connection).programId,
      })
      .instruction()
  );
  if (args.quoteMint.toBase58() == NATIVE_MINT.toBase58()) {
    ixs.push(
      createCloseAccountInstruction(
        nftOwnerQuoteMintTokenAccount,
        args.nftOwner,
        args.signer
      )
    );
  }
  return ixs;
}
export async function withdrawLpForCreator(
  args: WithdrawLpForCreatorArgs,
  connection: Connection
) {
  const poolAuthorityLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolAuthority,
    true
  );
  const poolLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.withdrawLpTokensForCreators()
    .accounts({
      poolLpTokenAccount: poolLpTokenAccount,
      poolAuthorityLpTokenAccount: poolAuthorityLpTokenAccount,
      pool: args.poolId,
      lpMint: args.lpMint,
      payer: args.signer,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program(connection).programId,
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
    args.nftOwner,
    true
  );
  const nftOwnerLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    args.nftOwner,
    true
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
      nftOwnerLpTokenAccount: nftOwnerLpTokenAccount,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nftOwner: args.nftOwner,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      lpMint: args.lpMint,
      payer: args.signer,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program(connection).programId,
    })
    .instruction();
}
export async function claimRewardForCreators(
  args: ClaimRewardForCreatorsArgs,
  connection: Connection
) {
  const poolAuthorityRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.poolAuthority,
    true
  );
  const poolRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.claimRewardTokenForCreators()
    .accounts({
      poolRewardTokenAccount: poolRewardTokenAccount,
      poolAuthorityRewardTokenAccount: poolAuthorityRewardTokenAccount,
      pool: args.poolId,
      rewardMint: args.mint,
      payer: args.signer,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program(connection).programId,
    })
    .instruction();
}

export async function claimReward(
  args: ClaimRewardArgs,
  connection: Connection
) {
  const [purchaseReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), args.poolId.toBuffer(), args.nft.toBuffer()],
    program(connection).programId
  );
  const nftOwnerOriginalMintAta = getAssociatedTokenAddressSync(
    args.nft,
    args.nftOwner,
    true
  );
  const nftOwnerRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.nftOwner,
    true
  );
  const purchaseReceiptRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    purchaseReceipt,
    true
  );
  return await program(connection)
    .methods.claimRewardToken()
    .accounts({
      purchaseReceiptRewardTokenAccount: purchaseReceiptRewardTokenAccount,
      nftOwnerRewardTokenAccount: nftOwnerRewardTokenAccount,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nftOwner: args.nftOwner,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      rewardMint: args.mint,
      payer: args.signer,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program(connection).programId,
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
  const purchaseReceiptRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    purchaseReceipt,
    true
  );
  const poolRewardTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.poolId,
    true
  );
  return await program(connection)
    .methods.checkClaimEllgibility()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      payer: args.signer,
      purchaseReceiptRewardTokenAccount: purchaseReceiptRewardTokenAccount,
      poolRewardTokenAccount: poolRewardTokenAccount,
      purchaseReceiptLpTokenAccount: purchaseReceiptLpTokenAccount,
      poolLpTokenAccount: poolLpTokenAccount,
      rewardMint: args.mint,
      lpMint: args.lpMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      program: program(connection).programId,
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
    quoteMint: args.quoteMint,
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
      userTokenCoin: userTokenCoin,
      userTokenPc: userTokenPc,
      poolTokenCoin: poolTokenCoin,
      poolTokenPc: poolTokenPc,
      tokenProgram: TOKEN_PROGRAM_ID,
      ammCoinMint: poolInfo.baseMint,
      ammPcMint: poolInfo.quoteMint,
      program: program(connection).programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
}
export async function createMarketPart3(
  mint: PublicKey,
  quoteMint: PublicKey,
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
      quoteMint: quoteMint,
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
  quoteMint: PublicKey,
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
      quoteMint,
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
  const ixs: any[] = [];
  const poolQuoteMintTokenAccount =
    await getOrCreateAssociatedTokenAccountInstruction(
      ixs,
      args.signer,
      args.quoteMint,
      args.poolId,
      true,
      connection
    );
  const payerQuoteMintTokenAccount =
    await getOrCreateAssociatedTokenAccountInstruction(
      ixs,
      args.signer,
      args.quoteMint,
      args.signer,
      true,
      connection
    );
  const feeCollectorQuoteMintTokenAccount =
    await getOrCreateAssociatedTokenAccountInstruction(
      ixs,
      args.signer,
      args.quoteMint,
      new PublicKey("73hCTYpoZNdFiwbh2PrW99ykAyNcQVfUwPMUhu9ogNTg"),
      true,
      connection
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
  if (args.quoteMint.toBase58() === NATIVE_MINT.toBase58()) {
    ixs.push(
      SystemProgram.transfer({
        fromPubkey: args.signer,
        toPubkey: payerQuoteMintTokenAccount,
        lamports: Math.round(args.amount * 1.01),
      })
    );
    ixs.push(createSyncNativeInstruction(payerQuoteMintTokenAccount));
  }

  ixs.push(
    await program(connection)
      .methods.buyPresale(new BN(args.amount))
      .accounts({
        quoteMint: args.quoteMint,
        poolQuoteMintTokenAccount: poolQuoteMintTokenAccount,
        payerQuoteMintTokenAccount: payerQuoteMintTokenAccount,
        feeCollectorQuoteMintTokenAccount: feeCollectorQuoteMintTokenAccount,
        purchaseAuthorisationRecord: purchaseAuthorisationRecord,
        tokenProgram: TOKEN_PROGRAM_ID,
        pool: args.poolId,
        nft: args.nft,
        payer: args.signer,
        program: program(connection).programId,
      })
      .instruction()
  );
  return ixs;
}
export async function createPurchaseAuthorisationIx(
  args: CreatePurchaseAuthorisationRecordArgs,
  connection: Connection
) {
  return await program(connection)
    .methods.createPurchaseAuthorisation(args.collectionMint)
    .accounts({
      payer: args.signer,
      pool: args.poolId,
      program: program(connection).programId,
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
        quoteMint: args.quoteMint,
        name: rewardMint.name,
        symbol: rewardMint.symbol,
        decimals: rewardMint.decimal,
        uri: rewardMint.uri,
        presaleDuration: args.presaleDuration,
        presaleTarget: new BN(args.presaleTarget),
        creatorFeeBasisPoints: args.creatorFeesBasisPoints,
        vestingPeriod: args.vestingPeriod,
        initialSupply: new BN(args.initialSupply),
        liquidityPoolSupply: new BN(args.liquidityPoolSupply),
        randomKey: new BN(randomKey),
        maxAmountPerPurchase: args.maxAmountPerPurchase
          ? new BN(args.maxAmountPerPurchase)
          : null,
        delegate: null,
        requiresCollection: args.requiresCollection,
      })
      .accounts({
        payer: args.signer,
        rewardMintMetadata: rewardMintMetadata,
        poolRewardMintTokenAccount: poolAndMintRewardAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        program: program(connection).programId,
      })
      .instruction(),
    poolId: poolId,
  };
}
