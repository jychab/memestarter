import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db, verifyPubKey} from "./utils";

interface UpdateMarket {
  signature: string;
  pubKey: string;
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
  // Checking that the user is authenticated.
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new HttpsError(
      "failed-precondition",
      "The function must be called " + "while authenticated."
    );
  }
  if (context.auth.token.firebase.sign_in_provider === "anonymous") {
    if (!data.signature || !data.pubKey) {
      throw new HttpsError("aborted", "Missing pubkey or signature!");
    }
    const isValid = verifyPubKey(context, data.signature, data.pubKey);
    if (!isValid) {
      throw new HttpsError("aborted", "Pubkey signature verification failed");
    }
  } else {
    throw new HttpsError("aborted", "Wrong Authentication Provider!");
  }

  await db
    .doc(`Pool/${data.poolId}/Market/${data.marketDetails.baseMint}`)
    .set(data.marketDetails);
}
