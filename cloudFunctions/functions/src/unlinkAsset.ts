import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";

export default async function unlinkAsset(
  context: CallableContext
): Promise<void> {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }

  await db.doc(`Users/${context.auth.uid}`).delete();
}
