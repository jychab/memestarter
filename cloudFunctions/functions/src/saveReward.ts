import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";
import {PoolType} from "./utils/types";

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
  let currentRewards = pool.rewards;
  const index = currentRewards.findIndex(
    (reward) => reward.id === data.rewardId
  );
  if (data.delete) {
    if (index == -1) {
      throw new HttpsError("aborted", "Reward does not exist!");
    }
    currentRewards = currentRewards.filter((_, i) => i != index);
  } else if (data.title && data.content) {
    const payload = {
      id: data.rewardId,
      title: data.title,
      content: data.content,
      delivery: data.delivery,
      price: data.price,
      quantity: data.quantity,
    };
    if (index != -1) {
      currentRewards[index] = {
        ...payload,
        quantityLeft: currentRewards[index].quantityLeft,
      };
    } else {
      currentRewards.push(payload);
    }
  } else {
    throw new HttpsError("aborted", "Missing title or content field");
  }
  await db
    .doc(`Pool/${data.poolId}`)
    .set({rewards: currentRewards}, {merge: true});
}
