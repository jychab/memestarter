import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db, verifyPubKey} from "./utils";

interface LinkAsset {
  signature: string;
  pubKey: string;
  nft: any;
}

export default async function linkAsset(
  data: LinkAsset,
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
  let uid;
  if (context.auth.token.firebase.sign_in_provider === "anonymous") {
    if (!data.signature || !data.pubKey) {
      throw new HttpsError("aborted", "Missing pubkey or signature!");
    }
    const isValid = verifyPubKey(context, data.signature, data.pubKey);
    if (!isValid) {
      throw new HttpsError("aborted", "Pubkey signature verification failed");
    } else {
      uid = data.pubKey;
    }
  } else {
    throw new HttpsError("aborted", "Wrong Authentication Provider!");
  }
  if (!data.nft) {
    throw new HttpsError("aborted", "Missing Nft Data");
  }
  await db.doc(`Users/${uid}`).set({
    nft: data.nft,
  });
}
