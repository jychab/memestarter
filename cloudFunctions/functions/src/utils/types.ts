import {DAS} from "helius-sdk";

export enum Events {
  IntializedPoolEvent = "InitializedPoolEvent",
  PurchasedPresaleEvent = "PurchasedPresaleEvent",
  CheckClaimEvent = "CheckClaimEvent",
  ClaimRewardsEvent = "ClaimRewardsEvent",
  LaunchTokenAmmEvent = "LaunchTokenAmmEvent",
  WithdrawLpEvent = "WithdrawLpEvent",
  WithdrawEvent = "WithdrawEvent",
}

export interface InitializedPoolEvent {
  authority: string;
  pool: string;
  mint: string;
  decimal: string;
  presaleTarget: string;
  presaleTimeLimit: string;
  creatorFeeBasisPoints: string;
  vestedSupply: string;
  totalSupply: string;
  vestingPeriod: string;
}

export interface PurchasedPresaleEvent {
  payer: string;
  amount: string;
  pool: string;
  originalMint: string;
}

export interface CheckClaimEvent {
  payer: string;
  pool: string;
  originalMint: string;
  mintElligible: string;
  lpElligible: string;
  lpElligibleAfterFees: string;
}

export interface ClaimRewardsEvent {
  payer: string;
  pool: string;
  lastClaimedAt: string;
  mintClaimed: string;
  originalMint: string;
  originalMintOwner: string;
}

export interface LaunchTokenAmmEvent {
  authority: string;
  pool: string;
  amountCoin: string;
  amountPc: string;
  amountLpReceived: string;
  lpMint: string;
  mint: string;
  vestingStartedAt: string;
  vestingEndingAt: string;
}
export interface WithdrawLpTokenEvent {
  payer: string;
  pool: string;
  originalMint: string;
  amountLpWithdrawn: string;
  lpMint: string;
}
export interface WithdrawEvent {
  payer: string;
  pool: string;
  originalMint: string;
  amountWsolWithdrawn: string;
  wsolMint: string;
}

export interface Pool {
  mintMetadata: DAS.GetAssetResponse;
  amountCoin: number;
  amountLpReceived: number;
  amountPc: number;
  authority: string;
  creatorFeeBasisPoints: string;
  liquidityCollected: number;
  lpMint: string;
  mint: string;
  pool: string;
  presaleTarget: number;
  presaleTimeLimit: number;
  totalSupply: number;
  vestedSupply: number;
  vestingEndingAt: number;
  vestingPeriod: number;
  vestingStartedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Mint {
  originalMint: string;
  pool: string;
  amount: number;
  lpElligible: number;
  mintClaimed: number;
  mintElligible: number;
  lpElligibleAfterFees: string;
  updatedAt: number;
  mintMetadata: DAS.GetAssetResponse;
}
