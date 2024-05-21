import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

interface SaveAsset {
  nft?: any;
  delete?: boolean;
}

export default async function saveAsset(
  data: SaveAsset,
  context: CallableContext
): Promise<any> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  if (data.delete) {
    await db.doc(`Users/${context.auth.uid}`).delete();
  } else {
    if (data.nft) {
      await db.doc(`Users/${context.auth.uid}`).set({
        nft: data.nft,
      });
    } else {
      throw new HttpsError("aborted", "Missing NFT field");
    }
  }
}
