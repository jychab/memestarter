import {Response, Request} from "firebase-functions/v1";
import {log} from "firebase-functions/logger";
import {db, program, programEventAuthority} from "./utils";
import * as anchor from "@coral-xyz/anchor";
import {
  CheckClaimEvent,
  ClaimRewardEvent,
  ClaimRewardForCreatorEvent,
  CreatePurchaseAuthorisationEvent,
  Events,
  InitializedPoolEvent,
  LaunchTokenAmmEvent,
  PurchasedPresaleEvent,
  Status,
  WithdrawEvent,
  WithdrawLpTokenEvent,
  WithdrawLpTokenForCreatorEvent,
} from "./utils/types";
import {FieldValue} from "firebase-admin/firestore";
import {IdlEvent} from "@coral-xyz/anchor/dist/cjs/idl";

export default async function programWebhook(req: Request, res: Response) {
  if (req.method === "GET") {
    res.status(200).json({message: "Webhook is running"});
  } else if (req.method === "POST") {
    log(JSON.stringify(req.body));
    const batch = db.batch();
    const data = req.body as any[];
    data.forEach((tx) => {
      const instructions = tx.instructions as {
        accounts: string[];
        data: string;
        innerInstructions: {
          accounts: string[];
          data: string;
          programId: string;
        }[];
        programId: string;
      }[];
      instructions
        .filter((ix) => {
          return (
            ix.programId === program.programId.toBase58() &&
            ix.innerInstructions.find(
              (item) =>
                item.accounts.length === 1 &&
                item.accounts.includes(programEventAuthority.value()) &&
                item.programId === program.programId.toBase58()
            ) !== undefined
          );
        })
        .map((ix) => {
          const innerIx = ix.innerInstructions.find(
            (item) =>
              item.accounts.length === 1 &&
              item.accounts.includes(programEventAuthority.value()) &&
              item.programId === program.programId.toBase58()
          );
          return innerIx?.data;
        })
        .forEach((emittedData) => {
          if (!emittedData) {
            return;
          }
          const ixData = anchor.utils.bytes.bs58.decode(emittedData);
          const eventData = anchor.utils.bytes.base64.encode(ixData.slice(8));
          const event = program.coder.events.decode(eventData);
          if (!event) {
            return;
          }
          switch (event.name) {
          case program.idl.events[0].name:
            processCheckClaimEvent(event, batch, tx);
            break;
          case program.idl.events[1].name:
            processClaimRewardEvent(event, batch, tx);
            break;
          case program.idl.events[2].name:
            processClaimRewardForCreatorEvent(event, batch, tx);
            break;
          case program.idl.events[3].name:
            processCreatePurchaseAuthorisationEvent(event, batch, tx);
            break;
          case program.idl.events[4].name:
            processIntializePoolEvent(event, batch, tx);
            break;
          case program.idl.events[5].name:
            processLaunchAmmEvent(event, batch, tx);
            break;
          case program.idl.events[6].name:
            processPurchasePresaleEvent(event, batch, tx);
            break;
          case program.idl.events[7].name:
            processWithdrawEvent(event, batch, tx);
            break;
          case program.idl.events[8].name:
            processWithdrawLpTokenEvent(event, batch, tx);
            break;
          case program.idl.events[9].name:
            processWithdrawLpTokenForCreatorEvent(event, batch, tx);
            break;
          default:
            break;
          }
        });
    });

    await batch.commit();

    res.status(200).json({message: "Success"});
  }
}
function processWithdrawEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const withdrawEvent = JSON.parse(JSON.stringify(event.data)) as WithdrawEvent;
  batch.set(
    db.collection("Pool").doc(withdrawEvent.pool),
    {
      totalAmountWithdrawn: FieldValue.increment(
        parseInt(withdrawEvent.amountWithdrawn, 16)
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Mint")
      .doc(withdrawEvent.originalMint)
      .collection("Pool")
      .doc(withdrawEvent.pool),
    {
      amountWithdrawn: parseInt(withdrawEvent.amountWithdrawn, 16),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  if (withdrawEvent.originalMintOwner !== withdrawEvent.payer) {
    batch.set(
      db
        .collection("Users")
        .doc(withdrawEvent.originalMintOwner)
        .collection("Transactions")
        .doc(tx.signature),
      {
        signature: tx.signature,
        event: Events.WithdrawEvent,
        eventData: {
          ...withdrawEvent,
          amountWithdrawn: parseInt(withdrawEvent.amountWithdrawn, 16),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }
    );
  }
  batch.set(
    db
      .collection("Users")
      .doc(withdrawEvent.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.WithdrawEvent,
      eventData: {
        ...withdrawEvent,
        amountWithdrawn: parseInt(withdrawEvent.amountWithdrawn, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processLaunchAmmEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const launchTokenEventData = JSON.parse(
    JSON.stringify(event.data)
  ) as LaunchTokenAmmEvent;
  batch.set(
    db.collection("Pool").doc(launchTokenEventData.pool),
    {
      ...launchTokenEventData,
      status: Status.Launched,
      amountCoin: parseInt(launchTokenEventData.amountCoin, 16),
      amountPc: parseInt(launchTokenEventData.amountPc, 16),
      amountLpReceived: parseInt(launchTokenEventData.amountLpReceived, 16),
      vestingStartedAt: parseInt(launchTokenEventData.vestingStartedAt, 16),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(launchTokenEventData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.LaunchTokenAmmEvent,
      eventData: {
        ...launchTokenEventData,
        amountCoin: parseInt(launchTokenEventData.amountCoin, 16),
        amountPc: parseInt(launchTokenEventData.amountPc, 16),
        amountLpReceived: parseInt(launchTokenEventData.amountLpReceived, 16),
        vestingStartedAt: parseInt(launchTokenEventData.vestingStartedAt, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processWithdrawLpTokenEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const withdrawLpTokenData = JSON.parse(
    JSON.stringify(event.data)
  ) as WithdrawLpTokenEvent;
  batch.set(
    db
      .collection("Mint")
      .doc(withdrawLpTokenData.originalMint)
      .collection("Pool")
      .doc(withdrawLpTokenData.pool),
    {
      lpClaimed: FieldValue.increment(
        parseInt(withdrawLpTokenData.lpClaimed, 16)
      ),
      lastClaimedAt: parseInt(withdrawLpTokenData.lastClaimedAt, 16),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db.collection("Pool").doc(withdrawLpTokenData.pool),
    {
      totalLpClaimed: FieldValue.increment(
        parseInt(withdrawLpTokenData.lpClaimed, 16)
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  if (withdrawLpTokenData.originalMintOwner !== withdrawLpTokenData.payer) {
    batch.set(
      db
        .collection("Users")
        .doc(withdrawLpTokenData.originalMintOwner)
        .collection("Transactions")
        .doc(tx.signature),
      {
        signature: tx.signature,
        event: Events.ClaimRewardsEvent,
        eventData: {
          ...withdrawLpTokenData,
          lastClaimedAt: parseInt(withdrawLpTokenData.lastClaimedAt, 16),
          lpClaimed: parseInt(withdrawLpTokenData.lpClaimed, 16),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }
    );
  }
  batch.set(
    db
      .collection("Users")
      .doc(withdrawLpTokenData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.WithdrawLpEvent,
      eventData: {
        ...withdrawLpTokenData,
        lastClaimedAt: parseInt(withdrawLpTokenData.lastClaimedAt, 16),
        lpClaimed: parseInt(withdrawLpTokenData.lpClaimed, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processWithdrawLpTokenForCreatorEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const withdrawLpTokenForCreatorData = JSON.parse(
    JSON.stringify(event.data)
  ) as WithdrawLpTokenForCreatorEvent;
  batch.set(
    db.collection("Pool").doc(withdrawLpTokenForCreatorData.pool),
    {
      totalLpClaimed: FieldValue.increment(
        parseInt(withdrawLpTokenForCreatorData.lpClaimed, 16)
      ),
      lpClaimedByCreator: FieldValue.increment(
        parseInt(withdrawLpTokenForCreatorData.lpClaimed, 16)
      ),
      lpLastClaimedByCreator: parseInt(
        withdrawLpTokenForCreatorData.lastClaimedAt,
        16
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(withdrawLpTokenForCreatorData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.WithdrawLpForCreatorEvent,
      eventData: {
        ...withdrawLpTokenForCreatorData,
        lastClaimedAt: parseInt(
          withdrawLpTokenForCreatorData.lastClaimedAt,
          16
        ),
        lpClaimed: parseInt(withdrawLpTokenForCreatorData.lpClaimed, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processClaimRewardForCreatorEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const claimRewardForCreatorData = JSON.parse(
    JSON.stringify(event.data)
  ) as ClaimRewardForCreatorEvent;
  batch.set(
    db.collection("Pool").doc(claimRewardForCreatorData.pool),
    {
      totalMintClaimed: FieldValue.increment(
        parseInt(claimRewardForCreatorData.mintElligible, 16)
      ),
      initialSupplyClaimedByCreator: parseInt(
        claimRewardForCreatorData.mintElligible,
        16
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(claimRewardForCreatorData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.ClaimRewardsForCreatorEvent,
      eventData: {
        ...claimRewardForCreatorData,
        mintElligible: parseInt(claimRewardForCreatorData.mintElligible, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processClaimRewardEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const claimRewardData = JSON.parse(
    JSON.stringify(event.data)
  ) as ClaimRewardEvent;
  batch.set(
    db
      .collection("Mint")
      .doc(claimRewardData.originalMint)
      .collection("Pool")
      .doc(claimRewardData.pool),
    {
      mintClaimed: parseInt(claimRewardData.mintElligible, 16),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db.collection("Pool").doc(claimRewardData.pool),
    {
      totalMintClaimed: FieldValue.increment(
        parseInt(claimRewardData.mintElligible, 16)
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  if (claimRewardData.originalMintOwner !== claimRewardData.payer) {
    batch.set(
      db
        .collection("Users")
        .doc(claimRewardData.originalMintOwner)
        .collection("Transactions")
        .doc(tx.signature),
      {
        signature: tx.signature,
        event: Events.ClaimRewardsEvent,
        eventData: {
          ...claimRewardData,
          mintElligible: parseInt(claimRewardData.mintElligible, 16),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }
    );
  }
  batch.set(
    db
      .collection("Users")
      .doc(claimRewardData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.ClaimRewardsEvent,
      eventData: {
        ...claimRewardData,
        mintElligible: parseInt(claimRewardData.mintElligible, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processCheckClaimEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const checkClaimData = JSON.parse(
    JSON.stringify(event.data)
  ) as CheckClaimEvent;
  batch.set(
    db
      .collection("Mint")
      .doc(checkClaimData.originalMint)
      .collection("Pool")
      .doc(checkClaimData.pool),
    {
      mintElligible: parseInt(checkClaimData.mintElligible, 16),
      lpElligible: parseInt(checkClaimData.lpElligible, 16),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(checkClaimData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.CheckClaimEvent,
      eventData: {
        ...checkClaimData,
        mintElligible: parseInt(checkClaimData.mintElligible, 16),
        lpElligible: parseInt(checkClaimData.lpElligible, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processPurchasePresaleEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const purchaseEventData = JSON.parse(
    JSON.stringify(event.data)
  ) as PurchasedPresaleEvent;

  batch.set(
    db
      .collection("Mint")
      .doc(purchaseEventData.originalMint)
      .collection("Pool")
      .doc(purchaseEventData.pool),
    {
      ...purchaseEventData,
      amount: FieldValue.increment(parseInt(purchaseEventData.amount, 16)),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Pool")
      .doc(purchaseEventData.pool)
      .collection("Mint")
      .doc(purchaseEventData.originalMint),
    {
      amount: FieldValue.increment(parseInt(purchaseEventData.amount, 16)),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db.collection("Pool").doc(purchaseEventData.pool),
    {
      liquidityCollected: FieldValue.increment(
        parseInt(purchaseEventData.amount, 16)
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(purchaseEventData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.PurchasedPresaleEvent,
      eventData: {
        ...purchaseEventData,
        amount: parseInt(purchaseEventData.amount, 16),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processCreatePurchaseAuthorisationEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const purchaseAuthorisationData = JSON.parse(
    JSON.stringify(event.data)
  ) as CreatePurchaseAuthorisationEvent;
  batch.set(
    db.collection("Pool").doc(purchaseAuthorisationData.pool),
    {
      collectionsRequired: FieldValue.arrayUnion(
        purchaseAuthorisationData.collectionMint
      ),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true}
  );
  batch.set(
    db
      .collection("Users")
      .doc(purchaseAuthorisationData.payer)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.CheckClaimEvent,
      eventData: purchaseAuthorisationData,
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}

function processIntializePoolEvent(
  event: anchor.Event<IdlEvent, Record<string, string>>,
  batch: FirebaseFirestore.WriteBatch,
  tx: any
) {
  const poolEventData = JSON.parse(
    JSON.stringify(event.data)
  ) as InitializedPoolEvent;

  batch.set(db.collection("Pool").doc(poolEventData.pool), {
    ...poolEventData,
    status: Status.Initialized,
    liquidityCollected: 0,
    decimal: parseInt(poolEventData.decimal, 16),
    presaleTarget: parseInt(poolEventData.presaleTarget, 16),
    presaleTimeLimit: parseInt(poolEventData.presaleTimeLimit, 16),
    liquidityPoolSupply: parseInt(poolEventData.liquidityPoolSupply, 16),
    initialSupply: parseInt(poolEventData.initialSupply, 16),
    initialSupplyForCreator: parseInt(
      poolEventData.initialSupplyForCreator,
      16
    ),
    totalSupply:
      parseInt(poolEventData.liquidityPoolSupply, 16) +
      parseInt(poolEventData.initialSupply, 16),
    vestingPeriod: parseInt(poolEventData.vestingPeriod),
    maxAmountPerPurchase: poolEventData.maxAmountPerPurchase ?
      parseInt(poolEventData.maxAmountPerPurchase, 16) :
      null,
    collectionsRequired: poolEventData.requiresCollection ? [] : null,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(
    db
      .collection("Users")
      .doc(poolEventData.authority)
      .collection("Transactions")
      .doc(tx.signature),
    {
      signature: tx.signature,
      event: Events.IntializedPoolEvent,
      eventData: {
        ...poolEventData,
        decimal: parseInt(poolEventData.decimal, 16),
        presaleTarget: parseInt(poolEventData.presaleTarget, 16),
        presaleTimeLimit: parseInt(poolEventData.presaleTimeLimit, 16),
        liquidityPoolSupply: parseInt(poolEventData.liquidityPoolSupply, 16),
        initialSupplyForCreator: parseInt(
          poolEventData.initialSupplyForCreator,
          16
        ),
        initialSupply: parseInt(poolEventData.initialSupply, 16),
        vestingPeriod: parseInt(poolEventData.vestingPeriod),
        maxAmountPerPurchase: poolEventData.maxAmountPerPurchase ?
          parseInt(poolEventData.maxAmountPerPurchase, 16) :
          null,
      },
      updatedAt: FieldValue.serverTimestamp(),
    }
  );
}
