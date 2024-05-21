import {Timestamp} from "firebase-admin/firestore";
import {DAS} from "helius-sdk";
export enum Events {
  IntializedPoolEvent = "InitializedPoolEvent",
  PurchasedPresaleEvent = "PurchasedPresaleEvent",
  CheckClaimEvent = "CheckClaimEvent",
  ClaimRewardsForCreatorEvent = "ClaimRewardsForCreatorEvent",
  ClaimRewardsEvent = "ClaimRewardsEvent",
  LaunchTokenAmmEvent = "LaunchTokenAmmEvent",
  WithdrawLpForCreatorEvent = "WithdrawLpForCreatorEvent",
  WithdrawLpEvent = "WithdrawLpEvent",
  WithdrawEvent = "WithdrawEvent",
}

export enum Status {
  Launched = "Launched",
  Initialized = "Initialized",
  Ended = "Ended",
}

export interface IReply {
  id: string;
  content: string;
  score: number;
  user: string;
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
  user: string;
  numReplies: number;
  negativeScoreRecord: Array<string>;
  positiveScoreRecord: Array<string>;
};

export interface InitializedPoolEvent {
  delegate: string;
  authority: string;
  pool: string;
  mint: string;
  quoteMint: string;
  presaleTarget: string;
  presaleTimeLimit: string;
  creatorFeeBasisPoints: string;
  liquidityPoolSupply: string;
  initialSupply: string;
  initialSupplyForCreator: string;
  decimal: string;
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
  lpElligible: string;
  mintElligible: string;
}

export interface ClaimRewardEvent {
  payer: string;
  pool: string;
  originalMint: string;
  originalMintOwner: string;
  mintElligible: string;
}

export interface ClaimRewardForCreatorEvent {
  payer: string;
  pool: string;
  mintElligible: string;
}

export interface WithdrawLpTokenForCreatorEvent {
  payer: string;
  pool: string;
  lastClaimedAt: string;
  lpClaimed: string;
}

export interface WithdrawLpTokenEvent {
  payer: string;
  pool: string;
  lastClaimedAt: string;
  lpClaimed: string;
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
}
export interface WithdrawEvent {
  payer: string;
  pool: string;
  originalMint: string;
  amountWithdrawn: string;
  originalMintOwner: string;
}

export interface PoolType {
  // overall claim settings
  totalLpClaimed: number;
  totalMintClaimed: number;
  // token metadata
  name: string;
  symbol: string;
  decimal: number;
  description: string;
  image: string;
  valid: boolean;
  mintMetadata: DAS.GetAssetResponse;
  // liquidity pool info
  amountCoin: number;
  amountLpReceived: number;
  totalAmountWithdrawn: number;
  amountPc: number;
  // pool settings
  authority: string;
  creatorFeeBasisPoints: number;
  liquidityCollected: number;
  lpMint: string;
  mint: string;
  quoteMint: string;
  pool: string;
  presaleTarget: number;
  presaleTimeLimit: number;
  totalSupply: number;
  liquidityPoolSupply: number;
  initialSupply: number;
  vestingPeriod: number;
  vestingStartedAt: number;
  maxAmountPerPurchase: number;
  collectionsRequired: any[];
  // pool authority claim progress
  initialSupplyForCreator: number;
  initialSupplyClaimedByCreator: number;
  lpClaimedByCreator: number;
  lpLastClaimedByCreator: number;
  // others
  createdAt: Timestamp | number | null;
  updatedAt: Timestamp | number | null;
  additionalInfo?: string;
  rewards: Reward[];
}

export interface Reward {
  id: string;
  title: string;
  content: string;
  delivery?: {
    countries: Array<string>;
    estimatedDate: number;
  };
  price?: number;
  quantity?: number;
  quantityLeft?: number;
}

export interface MintType {
  originalMint: string;
  pool: string;
  amount: number;
  amountWithdrawn: number;
  lastClaimedAt: number;
  mintElligible: number;
  mintClaimed: number;
  lpElligible: number;
  lpClaimed: number;
  updatedAt: Timestamp | number | null;
}

export interface CollectionDetails {
  name: string;
  image: string;
  mintAddress: string;
}
