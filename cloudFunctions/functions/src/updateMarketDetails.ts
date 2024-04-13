import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

interface UpdateMarket {
  poolId: string;
  marketDetails: {
    marketId: string;
    requestQueue: string;
    eventQueue: string;
    bids: string;
    asks: string;
    baseVault: string;
    quoteVault: string;
    baseMint: string;
    quoteMint: string;
  };
}

export default async function updateMarketDetails(
  data: UpdateMarket,
  context: CallableContext
): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }

  await db
    .doc(`Pool/${data.poolId}/Market/${data.marketDetails.baseMint}`)
    .set(data.marketDetails);
}
