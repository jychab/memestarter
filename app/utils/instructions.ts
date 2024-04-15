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
  MAINNET_PROGRAM_ID,
} from "@raydium-io/raydium-sdk";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
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

export const program = (connection: Connection) =>
  new Program<SafePresale>(SafePresaleIdl, PROGRAM_ID, { connection });

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const PROGRAM_ID = new PublicKey(
  "memep6GYetMx84qtBgB9p1rncn81HMmZZa1UoxauYGt"
);

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
  const purchaseReceiptLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    purchaseReceipt,
    true
  );
  return await program(connection)
    .methods.withdrawLpToken()
    .accounts({
      purchaseReceipt: purchaseReceipt,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      pool: args.poolId,
      poolAuthorityLpTokenAccount: poolAuthorityLpTokenAccount,
      userWallet: args.signer,
      userLpTokenAccount: signerLpTokenAccount,
      purchaseReceiptLpTokenAccount: purchaseReceiptLpTokenAccount,
      lpMint: args.lpMint,
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
  const nftOwnerRewardMintTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.nftOwner,
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
  const purchaseReceiptMintTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    purchaseReceipt,
    true
  );
  return await program(connection)
    .methods.claimRewards()
    .accounts({
      nftMetadata: nftMetadata,
      purchaseReceipt: purchaseReceipt,
      pool: args.poolId,
      nftOwner: args.nftOwner,
      nftOwnerNftTokenAccount: nftOwnerOriginalMintAta,
      purchaseReceiptMintTokenAccount: purchaseReceiptMintTokenAccount,
      rewardMint: args.mint,
      nftOwnerRewardMintTokenAccount: nftOwnerRewardMintTokenAccount,
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
  const purchaseReceiptMintTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    purchaseReceipt,
    true
  );
  const purchaseReceiptLpTokenAccount = getAssociatedTokenAddressSync(
    args.lpMint,
    purchaseReceipt,
    true
  );
  const poolMintTokenAccount = getAssociatedTokenAddressSync(
    args.mint,
    args.poolId,
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
      purchaseReceiptMintTokenAccount: purchaseReceiptMintTokenAccount,
      poolLpTokenAccount: poolLpTokenAccount,
      poolMintTokenAccount: poolMintTokenAccount,
      rewardMint: args.mint,
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
    baseDecimals: 6,
    quoteDecimals: WSOL.decimals,
    programId: MAINNET_PROGRAM_ID.AmmV4,
    marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
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
    .methods.launchTokenAmm(poolInfo.nonce, new BN(Date.now()))
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
      raydiumAmmProgram: MAINNET_PROGRAM_ID.AmmV4,
    })
    .remainingAccounts(remainingAccounts)
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
      dexProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
      makeTxVersion: TxVersion.V0,
    });
  return { innerTransactions, address };
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
  const poolData = await program(connection).account.pool.fetchNullable(
    args.poolId
  );
  if (poolData === null) {
    throw Error("Pool does not exist!");
  } else if (poolData.requiresCollection) {
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
        vestedSupply: new BN(args.vestedSupply),
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
