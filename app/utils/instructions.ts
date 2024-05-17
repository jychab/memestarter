import { BN, Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import {
  NATIVE_MINT,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  RAYDIUM_AMM_CONFIG,
  RAYDIUM_CPMM,
  RAYDIUM_FEE_COLLECTOR,
} from "./constants";
import {
  generateRandomU64,
  getAuthAddress,
  getOrCreateAssociatedTokenAccountInstruction,
  getOrcleAccountAddress,
  getPoolAddress,
  getPoolLpMintAddress,
  getPoolVaultAddress,
} from "./helper";
import { SafePresale } from "./idl";
import IDL from "./idl.json";
import {
  BuyPresaleArgs,
  CheckClaimElligbilityArgs,
  ClaimRewardArgs,
  ClaimRewardForCreatorsArgs,
  CreatePurchaseAuthorisationRecordArgs,
  InitializePoolArgs,
  LaunchTokenAmmArgs,
  WithdrawArgs,
  WithdrawLpArgs,
  WithdrawLpForCreatorArgs,
} from "./types";

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
  const token_0_mint =
    new BN(args.mint.toBuffer()) < new BN(args.quoteMint.toBuffer())
      ? args.mint
      : args.quoteMint;
  const token_1_mint =
    new BN(args.mint.toBuffer()) < new BN(args.quoteMint.toBuffer())
      ? args.quoteMint
      : args.mint;
  const [auth] = await getAuthAddress(RAYDIUM_CPMM);
  const [poolAddress] = await getPoolAddress(
    RAYDIUM_AMM_CONFIG,
    token_0_mint,
    token_1_mint,
    RAYDIUM_CPMM
  );
  const [lpMintAddress] = await getPoolLpMintAddress(poolAddress, RAYDIUM_CPMM);
  const [vault0] = await getPoolVaultAddress(
    poolAddress,
    token_0_mint,
    RAYDIUM_CPMM
  );
  const [vault1] = await getPoolVaultAddress(
    poolAddress,
    token_1_mint,
    RAYDIUM_CPMM
  );
  const [observationAddress] = await getOrcleAccountAddress(
    poolAddress,
    RAYDIUM_CPMM
  );

  const userTokenLp = getAssociatedTokenAddressSync(
    lpMintAddress,
    args.signer,
    true
  );
  const poolTokenLp = getAssociatedTokenAddressSync(
    lpMintAddress,
    args.poolId,
    true
  );
  const remainingAccounts = [
    { pubkey: lpMintAddress, isSigner: false, isWritable: true },
    { pubkey: userTokenLp, isSigner: false, isWritable: true },
    { pubkey: poolTokenLp, isSigner: false, isWritable: true },
    {
      pubkey: RAYDIUM_AMM_CONFIG,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: auth, isSigner: false, isWritable: false },
    {
      pubkey: poolAddress,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: vault0, isSigner: false, isWritable: true },
    { pubkey: vault1, isSigner: false, isWritable: true },
    {
      pubkey: RAYDIUM_FEE_COLLECTOR,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: observationAddress,
      isSigner: false,
      isWritable: true,
    },
  ];

  const userTokenCoin = getAssociatedTokenAddressSync(
    args.mint,
    args.signer,
    true
  );
  const userTokenPc = getAssociatedTokenAddressSync(
    args.quoteMint,
    args.signer,
    true
  );
  const poolTokenCoin = getAssociatedTokenAddressSync(
    args.mint,
    args.poolId,
    true
  );
  const poolTokenPc = getAssociatedTokenAddressSync(
    args.quoteMint,
    args.poolId,
    true
  );

  return await program(connection)
    .methods.launchTokenAmm(new BN(Date.now() / 1000))
    .accounts({
      pool: args.poolId,
      userWallet: args.signer,
      userTokenCoin: userTokenCoin,
      userTokenPc: userTokenPc,
      poolTokenCoin: poolTokenCoin,
      poolTokenPc: poolTokenPc,
      tokenProgram: TOKEN_PROGRAM_ID,
      ammCoinMint: args.mint,
      ammPcMint: args.quoteMint,
      program: program(connection).programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
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
