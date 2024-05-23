import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";
import {PoolType, Reward} from "./utils/types";

interface SaveRewardRequest {
  poolId: string;
  rewardId: string;
  title?: string;
  content?: string;
  price?: number;
  quantity?: number;
  delivery?: {
    countries: string[];
    estimatedDate: number;
  };
  delete?: boolean;
}

export async function saveReward(
  data: SaveRewardRequest,
  context: CallableContext
) {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const pool = (await db.doc(`Pool/${data.poolId}`).get()).data() as PoolType;
  if (!pool) {
    throw new HttpsError("invalid-argument", "Pool does not exist!");
  }
  if (pool.authority !== context.auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "Only the pool creator is allowed to call this function"
    );
  }
  const reward = (
    await db.doc(`Pool/${data.poolId}/Rewards/${data.rewardId}`).get()
  ).data() as Reward;
  if (data.delete) {
    if (!reward) {
      throw new HttpsError("aborted", "Reward does not exist!");
    }
    if (!reward.price) {
      throw new HttpsError("aborted", "Cannot delete default reward");
    }
    if (reward.quantity && reward.quantityBought > 0) {
      throw new HttpsError(
        "aborted",
        "Cannot delete reward because someone has already made a purchase"
      );
    }
    await db.doc(`Pool/${data.poolId}/Rewards/${data.rewardId}`).delete();
  } else if (data.title && data.content) {
    const payload = {
      id: data.rewardId,
      pool: data.poolId,
      title: data.title,
      content: data.content,
      delivery: data.delivery,
      price: data.price,
      quantity: data.quantity,
      uniqueBackers: reward ? undefined : 0,
      quantityBought: reward ? undefined : 0,
    };
    await db
      .doc(`Pool/${data.poolId}/Rewards/${data.rewardId}`)
      .set(payload, {merge: true});
  } else {
    throw new HttpsError("aborted", "Missing title or content field");
  }
}
