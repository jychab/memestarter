/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/safe_presale.json`.
 */
export type SafePresale = {
  address: "Cbq8bFSvGDjxmqEfPcxaujgfW1ZgggzYgDwcQRNY4jr";
  metadata: {
    name: "safePresale";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "buyPresale";
      discriminator: [113, 18, 193, 68, 35, 36, 215, 8];
      accounts: [
        {
          name: "purchaseReceipt";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [114, 101, 99, 101, 105, 112, 116];
              },
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "account";
                path: "nft";
              }
            ];
          };
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "poolQuoteMintTokenAccount";
          writable: true;
        },
        {
          name: "quoteMint";
        },
        {
          name: "nft";
        },
        {
          name: "nftMetadata";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "const";
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ];
              },
              {
                kind: "account";
                path: "nft";
              }
            ];
            program: {
              kind: "const";
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ];
            };
          };
        },
        {
          name: "purchaseAuthorisationRecord";
          optional: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "payerQuoteMintTokenAccount";
          writable: true;
        },
        {
          name: "feeCollectorQuoteMintTokenAccount";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
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
      name: "checkClaimEllgibility";
      discriminator: [69, 254, 161, 172, 13, 109, 252, 221];
      accounts: [
        {
          name: "purchaseReceipt";
          writable: true;
        },
        {
          name: "purchaseReceiptLpTokenAccount";
          writable: true;
        },
        {
          name: "poolLpTokenAccount";
          writable: true;
        },
        {
          name: "lpMint";
        },
        {
          name: "purchaseReceiptRewardTokenAccount";
          writable: true;
        },
        {
          name: "poolRewardTokenAccount";
          writable: true;
        },
        {
          name: "rewardMint";
        },
        {
          name: "pool";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    },
    {
      name: "claimRewardToken";
      discriminator: [176, 116, 134, 32, 198, 128, 53, 38];
      accounts: [
        {
          name: "purchaseReceipt";
          writable: true;
        },
        {
          name: "purchaseReceiptRewardTokenAccount";
          writable: true;
        },
        {
          name: "pool";
        },
        {
          name: "nftOwnerNftTokenAccount";
        },
        {
          name: "nftOwnerRewardTokenAccount";
          writable: true;
        },
        {
          name: "nftOwner";
        },
        {
          name: "nftMetadata";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "const";
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ];
              },
              {
                kind: "account";
                path: "purchase_receipt.original_mint";
                account: "purchaseReceipt";
              }
            ];
            program: {
              kind: "const";
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ];
            };
          };
        },
        {
          name: "rewardMint";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    },
    {
      name: "claimRewardTokenForCreators";
      discriminator: [109, 121, 210, 38, 66, 40, 31, 248];
      accounts: [
        {
          name: "poolRewardTokenAccount";
          writable: true;
        },
        {
          name: "poolAuthorityRewardTokenAccount";
          writable: true;
        },
        {
          name: "rewardMint";
        },
        {
          name: "pool";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    },
    {
      name: "createPurchaseAuthorisation";
      discriminator: [93, 0, 163, 170, 86, 135, 221, 106];
      accounts: [
        {
          name: "purchaseAuthorisationRecord";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  115,
                  97,
                  116,
                  105,
                  111,
                  110
                ];
              },
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "arg";
                path: "collectionMint";
              }
            ];
          };
        },
        {
          name: "pool";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "collectionMint";
          type: "pubkey";
        }
      ];
    },
    {
      name: "initPool";
      discriminator: [116, 233, 199, 204, 115, 159, 171, 36];
      accounts: [
        {
          name: "rewardMint";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 105, 110, 116];
              },
              {
                kind: "arg";
                path: "args.random_key";
              }
            ];
          };
        },
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "rewardMint";
              }
            ];
          };
        },
        {
          name: "rewardMintMetadata";
          writable: true;
        },
        {
          name: "poolRewardMintTokenAccount";
          writable: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "mplTokenProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: {
              name: "initPoolArgs";
            };
          };
        }
      ];
    },
    {
      name: "launchTokenAmm";
      discriminator: [15, 155, 143, 4, 15, 227, 35, 103];
      accounts: [
        {
          name: "pool";
          writable: true;
        },
        {
          name: "userWallet";
          docs: ["Pays to mint the position"];
          writable: true;
          signer: true;
        },
        {
          name: "userTokenCoin";
          writable: true;
        },
        {
          name: "userTokenPc";
          writable: true;
        },
        {
          name: "poolTokenCoin";
          writable: true;
        },
        {
          name: "poolTokenPc";
          writable: true;
        },
        {
          name: "rent";
          docs: ["Sysvar for token mint and ATA creation"];
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "systemProgram";
          docs: ["Program to create the position manager state account"];
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          docs: ["Program to create mint account and mint tokens"];
        },
        {
          name: "associatedTokenProgram";
          docs: ["Program to create an ATA for receiving position NFT"];
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "ammCoinMint";
        },
        {
          name: "ammPcMint";
        },
        {
          name: "raydiumAmmProgram";
          address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
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
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "purchaseReceipt";
          writable: true;
        },
        {
          name: "nftOwnerNftTokenAccount";
        },
        {
          name: "pool";
        },
        {
          name: "nftOwnerQuoteMintTokenAccount";
          writable: true;
        },
        {
          name: "poolQuoteMintTokenAccount";
          writable: true;
        },
        {
          name: "quoteMint";
        },
        {
          name: "nftOwner";
          writable: true;
        },
        {
          name: "nftMetadata";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "const";
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ];
              },
              {
                kind: "account";
                path: "purchase_receipt.original_mint";
                account: "purchaseReceipt";
              }
            ];
            program: {
              kind: "const";
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ];
            };
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["Program to create the position manager state account"];
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          docs: ["Program to create mint account and mint tokens"];
        },
        {
          name: "associatedTokenProgram";
          docs: ["Program to create an ATA for receiving position NFT"];
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    },
    {
      name: "withdrawLpTokens";
      discriminator: [58, 6, 25, 91, 179, 55, 213, 78];
      accounts: [
        {
          name: "purchaseReceipt";
          writable: true;
        },
        {
          name: "purchaseReceiptLpTokenAccount";
          writable: true;
        },
        {
          name: "pool";
        },
        {
          name: "nftOwnerNftTokenAccount";
        },
        {
          name: "nftOwnerLpTokenAccount";
          writable: true;
        },
        {
          name: "nftOwner";
        },
        {
          name: "nftMetadata";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "const";
                value: [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ];
              },
              {
                kind: "account";
                path: "purchase_receipt.original_mint";
                account: "purchaseReceipt";
              }
            ];
            program: {
              kind: "const";
              value: [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ];
            };
          };
        },
        {
          name: "lpMint";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    },
    {
      name: "withdrawLpTokensForCreators";
      discriminator: [209, 155, 234, 168, 20, 70, 36, 229];
      accounts: [
        {
          name: "poolLpTokenAccount";
          writable: true;
        },
        {
          name: "poolAuthorityLpTokenAccount";
          writable: true;
        },
        {
          name: "lpMint";
        },
        {
          name: "pool";
          writable: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "eventAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              }
            ];
          };
        },
        {
          name: "program";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "pool";
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188];
    },
    {
      name: "purchaseAuthorisationRecord";
      discriminator: [53, 101, 232, 117, 221, 194, 30, 117];
    },
    {
      name: "purchaseReceipt";
      discriminator: [79, 127, 222, 137, 154, 131, 150, 134];
    }
  ];
  events: [
    {
      name: "checkClaimEvent";
      discriminator: [12, 65, 62, 39, 108, 27, 102, 0];
    },
    {
      name: "claimRewardEvent";
      discriminator: [207, 16, 14, 170, 176, 71, 40, 53];
    },
    {
      name: "claimRewardForCreatorEvent";
      discriminator: [91, 232, 122, 102, 62, 234, 51, 220];
    },
    {
      name: "createPurchaseAuthorisationEvent";
      discriminator: [97, 236, 251, 29, 134, 101, 1, 39];
    },
    {
      name: "initializedPoolEvent";
      discriminator: [227, 128, 183, 214, 34, 48, 149, 240];
    },
    {
      name: "launchTokenAmmEvent";
      discriminator: [192, 241, 93, 6, 188, 153, 59, 170];
    },
    {
      name: "purchasedPresaleEvent";
      discriminator: [38, 22, 129, 9, 151, 2, 177, 167];
    },
    {
      name: "withdrawEvent";
      discriminator: [22, 9, 133, 26, 160, 44, 71, 192];
    },
    {
      name: "withdrawLpTokenEvent";
      discriminator: [117, 87, 56, 70, 106, 235, 16, 201];
    },
    {
      name: "withdrawLpTokenForCreatorEvent";
      discriminator: [138, 18, 33, 108, 27, 75, 136, 207];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "nftIsNotNonFungible";
      msg: "Nft must be Non-Fungible";
    },
    {
      code: 6001;
      name: "presaleIsStillOngoing";
      msg: "Presale is still ongoing";
    },
    {
      code: 6002;
      name: "presaleHasEnded";
      msg: "Presale has ended";
    },
    {
      code: 6003;
      name: "presaleTargetNotMet";
      msg: "Presale target not met";
    },
    {
      code: 6004;
      name: "presaleTargetExceeded";
      msg: "Presale target exceeded";
    },
    {
      code: 6005;
      name: "tokenHasLaunched";
      msg: "Token already launched";
    },
    {
      code: 6006;
      name: "poolHasExpired";
      msg: "Creator failed to launch project within 7 days.";
    },
    {
      code: 6007;
      name: "waitingForCreatorToLaunch";
      msg: "Presale target is met, Unable to withdraw. ";
    },
    {
      code: 6008;
      name: "conversionFailure";
      msg: "Conversion to u64 failed with an overflow or underflow";
    },
    {
      code: 6009;
      name: "integerOverflow";
      msg: "Integer Overflow Error";
    },
    {
      code: 6010;
      name: "invalidNegativeValue";
      msg: "Number cannot be negative";
    },
    {
      code: 6011;
      name: "mintNotAllowedInPool";
      msg: "Mint not allowed in this pool";
    },
    {
      code: 6012;
      name: "invalidMintMetadataOwner";
      msg: "Mint metadata is owned by the incorrect program";
    },
    {
      code: 6013;
      name: "invalidMintMetadata";
      msg: "Invalid mint metadata";
    },
    {
      code: 6014;
      name: "mintNotAllowed";
      msg: "Invalid Mint";
    },
    {
      code: 6015;
      name: "invalidPool";
      msg: "Invalid pool to claim";
    },
    {
      code: 6016;
      name: "invalidRewardMint";
      msg: "Invalid reward mint";
    },
    {
      code: 6017;
      name: "invalidLpMint";
      msg: "Invalid lp mint";
    },
    {
      code: 6018;
      name: "maximumAmountClaimed";
      msg: "Nothing left to claim";
    },
    {
      code: 6019;
      name: "unauthorizedAtCurrentTime";
      msg: "Either presale or vesting is still ongoing";
    },
    {
      code: 6020;
      name: "creatorBasisPointsExceedMaximumAmount";
      msg: "Creator Fees Basis Points cannot exceed 10000";
    },
    {
      code: 6021;
      name: "numberCannotBeZero";
      msg: "Amount cannot be zero";
    },
    {
      code: 6022;
      name: "amountPurchaseExceeded";
      msg: "Purchase amount exceeded";
    },
    {
      code: 6023;
      name: "checkClaimFirstBeforeClaiming";
      msg: "Check elligibility first";
    },
    {
      code: 6024;
      name: "claimedAlreadyChecked";
      msg: "Already checked";
    },
    {
      code: 6025;
      name: "invalidSigner";
      msg: "Signer must be owner of nft";
    },
    {
      code: 6026;
      name: "purchaseAuthorisationRecordMissing";
      msg: "Purchase authorisation record is missing";
    },
    {
      code: 6027;
      name: "unauthorisedCollection";
      msg: "Collection is not authorised";
    }
  ];
  types: [
    {
      name: "checkClaimEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "originalMint";
            type: "pubkey";
          },
          {
            name: "lpElligible";
            type: "u64";
          },
          {
            name: "mintElligible";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "claimRewardEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "originalMint";
            type: "pubkey";
          },
          {
            name: "originalMintOwner";
            type: "pubkey";
          },
          {
            name: "mintElligible";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "claimRewardForCreatorEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "mintElligible";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "createPurchaseAuthorisationEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "collectionMint";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "initPoolArgs";
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
            name: "liquidityPoolSupply";
            type: "u64";
          },
          {
            name: "initialSupply";
            type: "u64";
          },
          {
            name: "creatorFeeBasisPoints";
            type: "u16";
          },
          {
            name: "delegate";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "randomKey";
            type: "u64";
          },
          {
            name: "requiresCollection";
            type: "bool";
          },
          {
            name: "quoteMint";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "initializedPoolEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "delegate";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
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
            name: "creatorFeeBasisPoints";
            type: "u16";
          },
          {
            name: "liquidityPoolSupply";
            type: "u64";
          },
          {
            name: "initialSupply";
            type: "u64";
          },
          {
            name: "initialSupplyForCreator";
            type: "u64";
          },
          {
            name: "decimal";
            type: "u8";
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
            name: "requiresCollection";
            type: "bool";
          },
          {
            name: "quoteMint";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "launchTokenAmmEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "amountCoin";
            type: "u64";
          },
          {
            name: "amountPc";
            type: "u64";
          },
          {
            name: "amountLpReceived";
            type: "u64";
          },
          {
            name: "lpMint";
            type: "pubkey";
          },
          {
            name: "vestingStartedAt";
            type: "i64";
          }
        ];
      };
    },
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
            name: "quoteMint";
            type: "pubkey";
          },
          {
            name: "requiresCollection";
            type: "bool";
          },
          {
            name: "delegate";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "lpMint";
            type: {
              option: "pubkey";
            };
          },
          {
            name: "lpMintSupply";
            type: {
              option: "u64";
            };
          },
          {
            name: "lpMintSupplyForCreator";
            type: {
              option: "u64";
            };
          },
          {
            name: "lpMintClaimedByCreator";
            type: "u64";
          },
          {
            name: "lpMintLastClaimedByCreator";
            type: {
              option: "i64";
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
            name: "liquidityPoolSupply";
            type: "u64";
          },
          {
            name: "initialSupply";
            type: "u64";
          },
          {
            name: "initialSupplyForCreator";
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
            type: "pubkey";
          },
          {
            name: "collectionMint";
            type: "pubkey";
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
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "mintElligible";
            type: {
              option: "u64";
            };
          },
          {
            name: "mintClaimed";
            type: "bool";
          },
          {
            name: "lpElligible";
            type: {
              option: "u64";
            };
          },
          {
            name: "originalMint";
            type: "pubkey";
          },
          {
            name: "lpClaimed";
            type: "u64";
          },
          {
            name: "lastClaimedAt";
            type: {
              option: "i64";
            };
          }
        ];
      };
    },
    {
      name: "purchasedPresaleEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "originalMint";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "withdrawEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "originalMint";
            type: "pubkey";
          },
          {
            name: "amountWithdrawn";
            type: "u64";
          },
          {
            name: "originalMintOwner";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "withdrawLpTokenEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "lpClaimed";
            type: "u64";
          },
          {
            name: "lastClaimedAt";
            type: "i64";
          },
          {
            name: "originalMint";
            type: "pubkey";
          },
          {
            name: "originalMintOwner";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "withdrawLpTokenForCreatorEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "payer";
            type: "pubkey";
          },
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "lpClaimed";
            type: "u64";
          },
          {
            name: "lastClaimedAt";
            type: "i64";
          }
        ];
      };
    }
  ];
};
