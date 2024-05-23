import {FieldValue} from "firebase-admin/firestore";
import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

interface PurchaseRewardRequest {
  mintId: string;
  poolId: string;
  rewardId: string;
  txId: string;
  amount: number;
  quantity?: number;
}

export default async function purchaseReward(
  data: PurchaseRewardRequest,
  context: CallableContext
): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const collectionQuery = db
    .collection(`Users/${context.auth.uid}/OrderHistory`)
    .where("poolId", "==", data.poolId);
  // assume txId belongs to buyPurchaseEvent & is recent & is done by context.auth.uid

  const query = await collectionQuery.get();
  if (query.empty) {
    await db.doc(`Pool/${data.poolId}`).set(
      {
        uniqueBackers: FieldValue.increment(1),
      },
      {merge: true}
    );
  }
  const reward = await collectionQuery
    .where("rewardId", "==", data.rewardId)
    .get();

  await db.doc(`Pool/${data.poolId}/Rewards/${data.rewardId}`).set(
    {
      uniqueBackers: reward.empty ? FieldValue.increment(1) : undefined,
      quantityBought: data.quantity ?
        FieldValue.increment(data.quantity) :
        undefined,
    },
    {merge: true}
  );
  await db.doc(`Users/${context.auth.uid}/OrderHistory/${data.txId}`).set(
    {
      txId: data.txId,
      mintId: data.mintId,
      rewardId: data.rewardId,
      poolId: data.poolId,
      amount: data.amount,
      quantity: data.quantity,
    },
    {merge: true}
  );
}
