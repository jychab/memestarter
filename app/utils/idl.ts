export type SafePresale = {
  version: "0.1.0";
  name: "safe_presale";
  instructions: [
    {
      name: "buyPresale";
      accounts: [
        {
          name: "purchaseReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolWsolTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftOwnerNftTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "wsolMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nft";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "purchaseAuthorisationRecord";
          isMut: false;
          isSigner: false;
          isOptional: true;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feeCollector";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "claimRewards";
      accounts: [
        {
          name: "purchaseReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "purchaseReceiptMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftOwnerNftTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftOwnerRewardMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftOwner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initPool";
      accounts: [
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardMintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolRewardMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mplTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "InitPoolArgs";
          };
        }
      ];
    },
    {
      name: "createPurchaseAuthorisation";
      accounts: [
        {
          name: "purchaseAuthorisationRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "collectionMint";
          type: "publicKey";
        }
      ];
    },
    {
      name: "withdrawLpToken";
      accounts: [
        {
          name: "purchaseReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftOwnerNftTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "poolAuthorityLpTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userWallet";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userLpTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "purchaseReceiptLpTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lpMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create the position manager state account"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create mint account and mint tokens"];
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create an ATA for receiving position NFT"];
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "purchaseReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftOwnerNftTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payerWsolTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolWsolTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "wsol";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftOwner";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create the position manager state account"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create mint account and mint tokens"];
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create an ATA for receiving position NFT"];
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "checkClaimEllgibility";
      accounts: [
        {
          name: "purchaseReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "purchaseReceiptLpTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "purchaseReceiptMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolLpTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolMintTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lpMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "launchTokenAmm";
      accounts: [
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userWallet";
          isMut: true;
          isSigner: true;
          docs: ["Pays to mint the position"];
        },
        {
          name: "poolAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userTokenCoin";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userTokenPc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolTokenCoin";
          isMut: true;
          isSigner: false;
        },
        {
          name: "poolTokenPc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["Sysvar for token mint and ATA creation"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create the position manager state account"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create mint account and mint tokens"];
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Program to create an ATA for receiving position NFT"];
        },
        {
          name: "ammCoinMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "ammPcMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "raydiumAmmProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "nonce";
          type: "u8";
        },
        {
          name: "openTime";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "pool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "requiresCollection";
            type: "bool";
          },
          {
            name: "launched";
            type: "bool";
          },
          {
            name: "delegate";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "lpMint";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "lpMintSupply";
            type: {
              option: "u64";
            };
          },
          {
            name: "liquidityCollected";
            type: "u64";
          },
          {
            name: "maxAmountPerPurchase";
            type: {
              option: "u64";
            };
          },
          {
            name: "creatorFeeBasisPoints";
            type: "u16";
          },
          {
            name: "vestedSupply";
            type: "u64";
          },
          {
            name: "totalSupply";
            type: "u64";
          },
          {
            name: "presaleTarget";
            type: "u64";
          },
          {
            name: "presaleTimeLimit";
            type: "i64";
          },
          {
            name: "vestingPeriod";
            type: "u32";
          },
          {
            name: "vestingStartedAt";
            type: {
              option: "i64";
            };
          },
          {
            name: "vestingPeriodEnd";
            type: {
              option: "i64";
            };
          }
        ];
      };
    },
    {
      name: "purchaseAuthorisationRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "collectionMint";
            type: "publicKey";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "purchaseReceipt";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isInitialized";
            type: "bool";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "pool";
            type: "publicKey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "lpElligible";
            type: {
              option: "u64";
            };
          },
          {
            name: "originalMint";
            type: "publicKey";
          },
          {
            name: "mintClaimed";
            type: "u64";
          },
          {
            name: "mintElligible";
            type: {
              option: "u64";
            };
          },
          {
            name: "lastClaimedAt";
            type: {
              option: "i64";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitPoolArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "symbol";
            type: "string";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "decimals";
            type: "u8";
          },
          {
            name: "presaleTarget";
            type: "u64";
          },
          {
            name: "presaleDuration";
            type: "u32";
          },
          {
            name: "vestingPeriod";
            type: "u32";
          },
          {
            name: "maxAmountPerPurchase";
            type: {
              option: "u64";
            };
          },
          {
            name: "vestedSupply";
            type: "u64";
          },
          {
            name: "totalSupply";
            type: "u64";
          },
          {
            name: "creatorFeeBasisPoints";
            type: "u16";
          },
          {
            name: "delegate";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "randomKey";
            type: "u64";
          },
          {
            name: "requiresCollection";
            type: "bool";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "InitializedPoolEvent";
      fields: [
        {
          name: "delegate";
          type: {
            option: "publicKey";
          };
          index: false;
        },
        {
          name: "authority";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "mint";
          type: "publicKey";
          index: false;
        },
        {
          name: "presaleTarget";
          type: "u64";
          index: false;
        },
        {
          name: "presaleTimeLimit";
          type: "i64";
          index: false;
        },
        {
          name: "creatorFeeBasisPoints";
          type: "u16";
          index: false;
        },
        {
          name: "vestedSupply";
          type: "u64";
          index: false;
        },
        {
          name: "totalSupply";
          type: "u64";
          index: false;
        },
        {
          name: "decimal";
          type: "u8";
          index: false;
        },
        {
          name: "vestingPeriod";
          type: "u32";
          index: false;
        },
        {
          name: "maxAmountPerPurchase";
          type: {
            option: "u64";
          };
          index: false;
        },
        {
          name: "requiresCollection";
          type: "bool";
          index: false;
        }
      ];
    },
    {
      name: "CreatePurchaseAuthorisationEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "PurchasedPresaleEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "originalMint";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "CheckClaimEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "originalMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "mintElligible";
          type: "u64";
          index: false;
        },
        {
          name: "lpElligible";
          type: "u64";
          index: false;
        },
        {
          name: "lpElligibleAfterFees";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "ClaimRewardsEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "mintClaimed";
          type: "u64";
          index: false;
        },
        {
          name: "lastClaimedAt";
          type: "i64";
          index: false;
        },
        {
          name: "originalMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "originalMintOwner";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "LaunchTokenAmmEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "amountCoin";
          type: "u64";
          index: false;
        },
        {
          name: "amountPc";
          type: "u64";
          index: false;
        },
        {
          name: "amountLpReceived";
          type: "u64";
          index: false;
        },
        {
          name: "lpMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "vestingStartedAt";
          type: "i64";
          index: false;
        },
        {
          name: "vestingEndingAt";
          type: "i64";
          index: false;
        }
      ];
    },
    {
      name: "WithdrawLpTokenEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "originalMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "amountLpWithdrawn";
          type: "u64";
          index: false;
        },
        {
          name: "lpMint";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "WithdrawEvent";
      fields: [
        {
          name: "payer";
          type: "publicKey";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "originalMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "amountWsolWithdrawn";
          type: "u64";
          index: false;
        },
        {
          name: "originalMintOwner";
          type: "publicKey";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "NftIsNotNonFungible";
      msg: "Nft must be Non-Fungible";
    },
    {
      code: 6001;
      name: "PresaleIsStillOngoing";
      msg: "Presale is still ongoing";
    },
    {
      code: 6002;
      name: "PresaleHasEnded";
      msg: "Presale has ended";
    },
    {
      code: 6003;
      name: "PresaleTargetNotMet";
      msg: "Presale target not met";
    },
    {
      code: 6004;
      name: "TokenHasLaunched";
      msg: "Token already launched";
    },
    {
      code: 6005;
      name: "PoolHasExpired";
      msg: "Creator failed to launch project within 7 days.";
    },
    {
      code: 6006;
      name: "WaitingForCreatorToLaunch";
      msg: "Presale target is met, Unable to withdraw. ";
    },
    {
      code: 6007;
      name: "ConversionFailure";
      msg: "Conversion to u64 failed with an overflow or underflow";
    },
    {
      code: 6008;
      name: "IntegerOverflow";
      msg: "Integer Overflow Error";
    },
    {
      code: 6009;
      name: "InvalidNegativeValue";
      msg: "Number cannot be negative";
    },
    {
      code: 6010;
      name: "MintNotAllowedInPool";
      msg: "Mint not allowed in this pool";
    },
    {
      code: 6011;
      name: "InvalidMintMetadataOwner";
      msg: "Mint metadata is owned by the incorrect program";
    },
    {
      code: 6012;
      name: "InvalidMintMetadata";
      msg: "Invalid mint metadata";
    },
    {
      code: 6013;
      name: "MintNotAllowed";
      msg: "Invalid Mint";
    },
    {
      code: 6014;
      name: "InvalidPool";
      msg: "Invalid pool to claim";
    },
    {
      code: 6015;
      name: "InvalidRewardMint";
      msg: "Invalid reward mint";
    },
    {
      code: 6016;
      name: "InvalidLpMint";
      msg: "Invalid lp mint";
    },
    {
      code: 6017;
      name: "MaximumAmountClaimed";
      msg: "Nothing left to claim";
    },
    {
      code: 6018;
      name: "UnauthorizedAtCurrentTime";
      msg: "Either presale or vesting is still ongoing";
    },
    {
      code: 6019;
      name: "VestingSupplyLargerThanTotalSupply";
      msg: "Vesting Supply cannot be larger than Total Supply";
    },
    {
      code: 6020;
      name: "CreatorBasisPointsExceedMaximumAmount";
      msg: "Creator Fees Basis Points cannot exceed 10000";
    },
    {
      code: 6021;
      name: "NumberCannotBeZero";
      msg: "Amount cannot be zero";
    },
    {
      code: 6022;
      name: "AmountPurchaseExceeded";
      msg: "Purchase amount exceeded";
    },
    {
      code: 6023;
      name: "CheckClaimFirstBeforeClaiming";
      msg: "Check elligibility first";
    },
    {
      code: 6024;
      name: "ClaimedAlreadyChecked";
      msg: "Already checked";
    },
    {
      code: 6025;
      name: "InvalidSigner";
      msg: "Signer must be owner of nft";
    },
    {
      code: 6026;
      name: "PurchaseAuthorisationRecordMissing";
      msg: "Purchase authorisation record is missing";
    },
    {
      code: 6027;
      name: "UnauthorisedCollection";
      msg: "Collection is not authorised";
    }
  ];
};

export const IDL: SafePresale = {
  version: "0.1.0",
  name: "safe_presale",
  instructions: [
    {
      name: "buyPresale",
      accounts: [
        {
          name: "purchaseReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolWsolTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftOwnerNftTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "wsolMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nft",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "purchaseAuthorisationRecord",
          isMut: false,
          isSigner: false,
          isOptional: true,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feeCollector",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "claimRewards",
      accounts: [
        {
          name: "purchaseReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "purchaseReceiptMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftOwnerNftTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftOwnerRewardMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftOwner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initPool",
      accounts: [
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardMintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolRewardMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mplTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "InitPoolArgs",
          },
        },
      ],
    },
    {
      name: "createPurchaseAuthorisation",
      accounts: [
        {
          name: "purchaseAuthorisationRecord",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "collectionMint",
          type: "publicKey",
        },
      ],
    },
    {
      name: "withdrawLpToken",
      accounts: [
        {
          name: "purchaseReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftOwnerNftTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "poolAuthorityLpTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userWallet",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userLpTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "purchaseReceiptLpTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lpMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create the position manager state account"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create mint account and mint tokens"],
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create an ATA for receiving position NFT"],
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "purchaseReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftOwnerNftTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payerWsolTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolWsolTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "wsol",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftOwner",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create the position manager state account"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create mint account and mint tokens"],
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create an ATA for receiving position NFT"],
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "checkClaimEllgibility",
      accounts: [
        {
          name: "purchaseReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "purchaseReceiptLpTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "purchaseReceiptMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolLpTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolMintTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lpMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "launchTokenAmm",
      accounts: [
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userWallet",
          isMut: true,
          isSigner: true,
          docs: ["Pays to mint the position"],
        },
        {
          name: "poolAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userTokenCoin",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userTokenPc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolTokenCoin",
          isMut: true,
          isSigner: false,
        },
        {
          name: "poolTokenPc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["Sysvar for token mint and ATA creation"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create the position manager state account"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create mint account and mint tokens"],
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Program to create an ATA for receiving position NFT"],
        },
        {
          name: "ammCoinMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ammPcMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "raydiumAmmProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "nonce",
          type: "u8",
        },
        {
          name: "openTime",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "requiresCollection",
            type: "bool",
          },
          {
            name: "launched",
            type: "bool",
          },
          {
            name: "delegate",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "lpMint",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "lpMintSupply",
            type: {
              option: "u64",
            },
          },
          {
            name: "liquidityCollected",
            type: "u64",
          },
          {
            name: "maxAmountPerPurchase",
            type: {
              option: "u64",
            },
          },
          {
            name: "creatorFeeBasisPoints",
            type: "u16",
          },
          {
            name: "vestedSupply",
            type: "u64",
          },
          {
            name: "totalSupply",
            type: "u64",
          },
          {
            name: "presaleTarget",
            type: "u64",
          },
          {
            name: "presaleTimeLimit",
            type: "i64",
          },
          {
            name: "vestingPeriod",
            type: "u32",
          },
          {
            name: "vestingStartedAt",
            type: {
              option: "i64",
            },
          },
          {
            name: "vestingPeriodEnd",
            type: {
              option: "i64",
            },
          },
        ],
      },
    },
    {
      name: "purchaseAuthorisationRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "collectionMint",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "purchaseReceipt",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isInitialized",
            type: "bool",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "pool",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "lpElligible",
            type: {
              option: "u64",
            },
          },
          {
            name: "originalMint",
            type: "publicKey",
          },
          {
            name: "mintClaimed",
            type: "u64",
          },
          {
            name: "mintElligible",
            type: {
              option: "u64",
            },
          },
          {
            name: "lastClaimedAt",
            type: {
              option: "i64",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitPoolArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "presaleTarget",
            type: "u64",
          },
          {
            name: "presaleDuration",
            type: "u32",
          },
          {
            name: "vestingPeriod",
            type: "u32",
          },
          {
            name: "maxAmountPerPurchase",
            type: {
              option: "u64",
            },
          },
          {
            name: "vestedSupply",
            type: "u64",
          },
          {
            name: "totalSupply",
            type: "u64",
          },
          {
            name: "creatorFeeBasisPoints",
            type: "u16",
          },
          {
            name: "delegate",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "randomKey",
            type: "u64",
          },
          {
            name: "requiresCollection",
            type: "bool",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "InitializedPoolEvent",
      fields: [
        {
          name: "delegate",
          type: {
            option: "publicKey",
          },
          index: false,
        },
        {
          name: "authority",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "mint",
          type: "publicKey",
          index: false,
        },
        {
          name: "presaleTarget",
          type: "u64",
          index: false,
        },
        {
          name: "presaleTimeLimit",
          type: "i64",
          index: false,
        },
        {
          name: "creatorFeeBasisPoints",
          type: "u16",
          index: false,
        },
        {
          name: "vestedSupply",
          type: "u64",
          index: false,
        },
        {
          name: "totalSupply",
          type: "u64",
          index: false,
        },
        {
          name: "decimal",
          type: "u8",
          index: false,
        },
        {
          name: "vestingPeriod",
          type: "u32",
          index: false,
        },
        {
          name: "maxAmountPerPurchase",
          type: {
            option: "u64",
          },
          index: false,
        },
        {
          name: "requiresCollection",
          type: "bool",
          index: false,
        },
      ],
    },
    {
      name: "CreatePurchaseAuthorisationEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "collectionMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "PurchasedPresaleEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "originalMint",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "CheckClaimEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "originalMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "mintElligible",
          type: "u64",
          index: false,
        },
        {
          name: "lpElligible",
          type: "u64",
          index: false,
        },
        {
          name: "lpElligibleAfterFees",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "ClaimRewardsEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "mintClaimed",
          type: "u64",
          index: false,
        },
        {
          name: "lastClaimedAt",
          type: "i64",
          index: false,
        },
        {
          name: "originalMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "originalMintOwner",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "LaunchTokenAmmEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "amountCoin",
          type: "u64",
          index: false,
        },
        {
          name: "amountPc",
          type: "u64",
          index: false,
        },
        {
          name: "amountLpReceived",
          type: "u64",
          index: false,
        },
        {
          name: "lpMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "vestingStartedAt",
          type: "i64",
          index: false,
        },
        {
          name: "vestingEndingAt",
          type: "i64",
          index: false,
        },
      ],
    },
    {
      name: "WithdrawLpTokenEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "originalMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "amountLpWithdrawn",
          type: "u64",
          index: false,
        },
        {
          name: "lpMint",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "WithdrawEvent",
      fields: [
        {
          name: "payer",
          type: "publicKey",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "originalMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "amountWsolWithdrawn",
          type: "u64",
          index: false,
        },
        {
          name: "originalMintOwner",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NftIsNotNonFungible",
      msg: "Nft must be Non-Fungible",
    },
    {
      code: 6001,
      name: "PresaleIsStillOngoing",
      msg: "Presale is still ongoing",
    },
    {
      code: 6002,
      name: "PresaleHasEnded",
      msg: "Presale has ended",
    },
    {
      code: 6003,
      name: "PresaleTargetNotMet",
      msg: "Presale target not met",
    },
    {
      code: 6004,
      name: "TokenHasLaunched",
      msg: "Token already launched",
    },
    {
      code: 6005,
      name: "PoolHasExpired",
      msg: "Creator failed to launch project within 7 days.",
    },
    {
      code: 6006,
      name: "WaitingForCreatorToLaunch",
      msg: "Presale target is met, Unable to withdraw. ",
    },
    {
      code: 6007,
      name: "ConversionFailure",
      msg: "Conversion to u64 failed with an overflow or underflow",
    },
    {
      code: 6008,
      name: "IntegerOverflow",
      msg: "Integer Overflow Error",
    },
    {
      code: 6009,
      name: "InvalidNegativeValue",
      msg: "Number cannot be negative",
    },
    {
      code: 6010,
      name: "MintNotAllowedInPool",
      msg: "Mint not allowed in this pool",
    },
    {
      code: 6011,
      name: "InvalidMintMetadataOwner",
      msg: "Mint metadata is owned by the incorrect program",
    },
    {
      code: 6012,
      name: "InvalidMintMetadata",
      msg: "Invalid mint metadata",
    },
    {
      code: 6013,
      name: "MintNotAllowed",
      msg: "Invalid Mint",
    },
    {
      code: 6014,
      name: "InvalidPool",
      msg: "Invalid pool to claim",
    },
    {
      code: 6015,
      name: "InvalidRewardMint",
      msg: "Invalid reward mint",
    },
    {
      code: 6016,
      name: "InvalidLpMint",
      msg: "Invalid lp mint",
    },
    {
      code: 6017,
      name: "MaximumAmountClaimed",
      msg: "Nothing left to claim",
    },
    {
      code: 6018,
      name: "UnauthorizedAtCurrentTime",
      msg: "Either presale or vesting is still ongoing",
    },
    {
      code: 6019,
      name: "VestingSupplyLargerThanTotalSupply",
      msg: "Vesting Supply cannot be larger than Total Supply",
    },
    {
      code: 6020,
      name: "CreatorBasisPointsExceedMaximumAmount",
      msg: "Creator Fees Basis Points cannot exceed 10000",
    },
    {
      code: 6021,
      name: "NumberCannotBeZero",
      msg: "Amount cannot be zero",
    },
    {
      code: 6022,
      name: "AmountPurchaseExceeded",
      msg: "Purchase amount exceeded",
    },
    {
      code: 6023,
      name: "CheckClaimFirstBeforeClaiming",
      msg: "Check elligibility first",
    },
    {
      code: 6024,
      name: "ClaimedAlreadyChecked",
      msg: "Already checked",
    },
    {
      code: 6025,
      name: "InvalidSigner",
      msg: "Signer must be owner of nft",
    },
    {
      code: 6026,
      name: "PurchaseAuthorisationRecordMissing",
      msg: "Purchase authorisation record is missing",
    },
    {
      code: 6027,
      name: "UnauthorisedCollection",
      msg: "Collection is not authorised",
    },
  ],
};
