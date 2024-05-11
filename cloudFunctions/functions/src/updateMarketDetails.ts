import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

interface UpdateMarket {
  poolId: string;
  marketDetails: {
    created: boolean;
    vaultSignerNonce?: number;
    marketId?: string;
    marketSeed?: string;
    requestQueue?: string;
    eventQueue?: string;
    bids?: string;
    asks?: string;
    baseVault?: string;
    quoteVault?: string;
    baseMint?: string;
    quoteMint?: string;
  };
}

export default async function updateMarketDetails(
  data: UpdateMarket,
  context: CallableContext
): Promise<void> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const pool = (await db.doc(`Pool/${data.poolId}`).get()).data();
  if (!pool) {
    throw new HttpsError("invalid-argument", "Pool does not exist!");
  }
  if (
    context.auth.uid !== pool.authority ||
    (pool.delegate && context.auth.uid !== pool.delegate)
  ) {
    throw new HttpsError(
      "permission-denied",
      "Not the pool creator or delegate"
    );
  }
  await db
    .doc(`Pool/${data.poolId}/Market/${data.marketDetails.marketId}`)
    .set(data.marketDetails, {merge: true});
}
