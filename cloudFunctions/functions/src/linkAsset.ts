import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

interface LinkAsset {
  nft: any;
}

export default async function linkAsset(
  data: LinkAsset,
  context: CallableContext
): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  await db.doc(`Users/${context.auth.uid}`).set({
    nft: data.nft,
  });
}
