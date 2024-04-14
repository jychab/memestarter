import { PublicKey } from "@solana/web3.js";
import {
  AssetSortBy,
  AssetSortDirection,
  Interface,
  Scope,
  Context,
  OwnershipModel,
  RoyaltyModel,
  UseMethods,
} from "./enums";
import { Timestamp } from "firebase/firestore";
import { Market } from "@raydium-io/raydium-sdk";

export enum Status {
  PresaleTargetMet = "Presale Target Met",
  VestingInProgress = "Vesting In Progress",
  VestingCompleted = "Vesting Completed",
  PresaleInProgress = "Presale In Progress",
  Expired = "Expired",
  ReadyToLaunch = "Ready To Launch",
}
export interface LaunchTokenAmmArgs {
  marketId: PublicKey;
  mint: PublicKey;
  signer: PublicKey;
  poolAuthority: PublicKey;
  poolId: PublicKey;
}

export interface CreateMarketArgs {
  signer: PublicKey;
  mint: PublicKey;
  decimal: number;
  lotSize: number;
  tickSize: number;
}
export interface BuyPresaleArgs {
  amount: number;
  nft: PublicKey;
  nftCollection: PublicKey;
  poolId: PublicKey;
  signer: PublicKey;
}

export interface CreatePoolArgs extends InitializePoolArgs {
  publicKey: PublicKey;
  collectionsRequired: CollectionDetails[];
  externalUrl: string;
  description: string;
}

export interface InitializePoolArgs {
  name: string;
  symbol: string;
  decimal: number;
  uri: string;
  creatorFeesBasisPoints: number;
  presaleDuration: number;
  presaleTarget: number;
  vestingPeriod: number;
  vestedSupply: number;
  totalSupply: number;
  signer: PublicKey;
  maxAmountPerPurchase: number | null;
  requiresCollection: boolean;
}

export interface CreatePurchaseAuthorisationRecordArgs {
  collectionMint: PublicKey;
  signer: PublicKey;
  poolId: PublicKey;
}

export interface WithdrawArgs {
  poolId: PublicKey;
  nft: PublicKey;
  nftOwner: PublicKey;
  signer: PublicKey;
}

export interface WithdrawLpArgs {
  poolId: PublicKey;
  nft: PublicKey;
  signer: PublicKey;
  poolAuthority: PublicKey;
  lpMint: PublicKey;
}

export interface ClaimArgs {
  signer: PublicKey;
  nftOwner: PublicKey;
  nft: PublicKey;
  poolId: PublicKey;
  mint: PublicKey;
}

export interface CheckClaimElligbilityArgs {
  poolId: PublicKey;
  nft: PublicKey;
  signer: PublicKey;
  lpMint: PublicKey;
  mint: PublicKey;
}

export interface UpdateMarketDataArgs {
  pubKey: string;
  poolId: string;
  marketDetails: MarketDetails;
}
export interface MarketDetails {
  marketId: string;
  requestQueue: string;
  eventQueue: string;
  bids: string;
  asks: string;
  baseVault: string;
  quoteVault: string;
  baseMint: string;
  quoteMint: string;
}

export interface DetermineOptimalParams {
  pool: string;
  decimal: number;
}

export interface CollectionDetails {
  name: string;
  image: string;
  mintAddress: string;
}

export interface PoolType {
  decimal: number;
  mintMetadata: DAS.GetAssetResponse;
  amountCoin: number;
  amountLpReceived: number;
  amountLpWithdrawn: number;
  amountWsolWithdrawn: number;
  amountPc: number;
  authority: string;
  creatorFeeBasisPoints: string;
  liquidityCollected: number;
  totalClaimed: number;
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
  createdAt: Timestamp | number | null;
  updatedAt: Timestamp | number | null;
  name: string;
  symbol: string;
  description: string;
  image: string;
  valid: boolean;
  maxAmountPerPurchase: number;
  collectionsRequired: CollectionDetails[] | null;
}

export interface MintType {
  originalMint: string;
  pool: string;
  amount: number;
  lastClaimedAt: number;
  lpElligible: number;
  lpClaimed: number;
  mintClaimed: number;
  lpElligibleAfterFees: number;
  mintElligible: number;
  updatedAt: Timestamp | number | null;
}

export interface Transaction {
  event: string;
  signature: string;
  updatedAt: Timestamp | number | null;
}

export declare namespace DAS {
  interface AssetsByOwnerRequest {
    ownerAddress: string;
    page: number;
    limit?: number;
    before?: string;
    after?: string;
    displayOptions?: DisplayOptions;
    sortBy?: AssetSortingRequest;
  }
  type AssetsByCreatorRequest = {
    creatorAddress: string;
    page: number;
    onlyVerified?: boolean;
    limit?: number;
    before?: string;
    after?: string;
    displayOptions?: DisplayOptions;
    sortBy?: AssetSortingRequest;
  };
  type GetAssetBatchRequest = {
    ids: Array<string>;
    displayOptions?: GetAssetDisplayOptions;
  };
  type AssetsByGroupRequest = {
    groupValue: string;
    groupKey: string;
    page: number;
    limit?: number;
    before?: string;
    after?: string;
    displayOptions?: DisplayOptions;
    sortBy?: AssetSortingRequest;
  };
  type GetAssetsBatchRequest = {
    ids: string[];
  };
  interface SearchAssetsRequest {
    page: number;
    limit?: number;
    before?: string;
    after?: string;
    creatorAddress?: string;
    ownerAddress?: string;
    jsonUri?: string;
    grouping?: string[];
    burnt?: boolean;
    sortBy?: AssetSortingRequest;
    frozen?: boolean;
    supplyMint?: string;
    supply?: number;
    interface?: string;
    delegate?: number;
    ownerType?: OwnershipModel;
    royaltyAmount?: number;
    royaltyTarget?: string;
    royaltyTargetType?: RoyaltyModel;
    compressible?: boolean;
    compressed?: boolean;
  }
  type AssetsByAuthorityRequest = {
    authorityAddress: string;
    page: number;
    limit?: number;
    before?: string;
    after?: string;
    displayOptions?: DisplayOptions;
    sortBy?: AssetSortingRequest;
  };
  type GetAssetRequest = {
    id: string;
    displayOptions?: GetAssetDisplayOptions;
  };
  type GetAssetProofRequest = {
    id: string;
  };
  type GetSignaturesForAssetRequest = {
    id: string;
    page: number;
    limit?: number;
    before?: string;
    after?: string;
  };
  interface AssetSorting {
    sort_by: AssetSortBy;
    sort_direction: AssetSortDirection;
  }
  type AssetSortingRequest = {
    sortBy: AssetSortBy;
    sortDirection: AssetSortDirection;
  };
  type GetAssetResponse = {
    interface: Interface;
    id: string;
    content?: Content;
    authorities?: Authorities[];
    compression?: Compression;
    grouping?: Grouping[];
    royalty?: Royalty;
    ownership: Ownership;
    creators?: Creators[];
    uses?: Uses;
    supply?: Supply;
    mutable: boolean;
    burnt: boolean;
    token_info: TokenInfo;
  };
  type TokenInfo = {
    decimals: number;
    mint_authority: string;
    supply: number;
    token_program: string;
  };
  type GetAssetResponseList = {
    grand_total?: boolean;
    total: number;
    limit: number;
    page: number;
    items: GetAssetResponse[];
  };
  interface GetAssetProofResponse {
    root: string;
    proof: Array<string>;
    node_index: number;
    leaf: string;
    tree_id: string;
  }
  interface GetSignaturesForAssetResponse {
    total: number;
    limit: number;
    page?: number;
    before?: string;
    after?: string;
    items: Array<Array<string>>;
  }
  type DisplayOptions = {
    showUnverifiedCollections?: boolean;
    showCollectionMetadata?: boolean;
    showGrandTotal?: boolean;
  };
  type GetAssetDisplayOptions = {
    showUnverifiedCollections?: boolean;
    showCollectionMetadata?: boolean;
  };
  interface Ownership {
    frozen: boolean;
    delegated: boolean;
    delegate?: string;
    ownership_model: OwnershipModel;
    owner: string;
  }
  interface Supply {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce?: number;
  }
  interface Uses {
    use_method: UseMethods;
    remaining: number;
    total: number;
  }
  interface Creators {
    address: string;
    share: number;
    verified: boolean;
  }
  interface Royalty {
    royalty_model: RoyaltyModel;
    target?: string;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  }
  interface Grouping {
    group_key: string;
    group_value: string;
    verified?: boolean;
    collection_metadata?: CollectionMetadata;
  }
  interface CollectionMetadata {
    name?: string;
    symbol?: string;
    image?: string;
    description?: string;
    external_url?: string;
  }
  interface Authorities {
    address: string;
    scopes: Array<Scope>;
  }
  type Links = {
    external_url?: string;
    image?: string;
    animation_url?: string;
    [Symbol.iterator](): Iterator<Links>;
  };
  interface Content {
    $schema: string;
    json_uri: string;
    files?: Files;
    metadata: Metadata;
    links?: Links;
  }
  interface File {
    uri?: string;
    mime?: string;
    cdn_uri?: string;
    quality?: FileQuality;
    contexts?: Context[];
    [Symbol.iterator](): Iterator<File>;
  }
  type Files = File[];
  interface FileQuality {
    schema: string;
  }
  interface Metadata {
    attributes?: Attribute[];
    description: string;
    name: string;
    symbol: string;
  }
  interface Attribute {
    value: string;
    trait_type: string;
  }
  interface Compression {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  }
}

export type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Confirmations =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32;
