import {Timestamp} from "firebase-admin/firestore";
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

export enum Status {
  Launched = "Launched",
  Initialized = "Initialized",
  Ended = "Ended",
}
export interface IUser {
  publicKey?: string;
}
export interface IReply {
  id: string;
  content: string;
  score: number;
  user: IUser;
  createdAt: Timestamp;
  replyingTo: string;
  negativeScoreRecord: Array<string>;
  positiveScoreRecord: Array<string>;
}
export type IComment = {
  pinned: boolean;
  id: string;
  content: string;
  createdAt: Timestamp;
  score: number;
  user: IUser;
  numReplies: number;
  negativeScoreRecord: Array<string>;
  positiveScoreRecord: Array<string>;
};

export interface InitializedPoolEvent {
  delegate: string;
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
  maxAmountPerPurchase: string | null;
  requiresCollection: string;
}

export interface CreatePurchaseAuthorisationEvent {
  payer: string;
  collectionMint: string;
  pool: string;
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
  payer: string;
  pool: string;
  amountCoin: string;
  amountPc: string;
  amountLpReceived: string;
  lpMint: string;
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
  originalMintOwner: string;
}

export interface Pool {
  delegate: string | null;
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
  collectionsRequired: any[];
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
