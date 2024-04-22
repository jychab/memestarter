import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import {db} from "./utils";
import {Pool} from "./utils/types";

interface SaveAdditionalInfoRequest {
  poolId: string;
  content: string;
}

export async function saveAdditionalInfo(
  data: SaveAdditionalInfoRequest,
  context: CallableContext
) {
  if (!context.auth) {
    throw new HttpsError("permission-denied", "Unauthenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "custom") {
    throw new HttpsError("permission-denied", "Wrong authentication provider!");
  }
  const pool = (await db.doc(`Pool/${data.poolId}`).get()).data() as Pool;
  if (pool.authority !== context.auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "Only the pool creator is allowed to call this function"
    );
  }
  await db.doc(`Pool/${data.poolId}`).set(
    {
      additionalInfo: data.content,
    },
    {merge: true}
  );
}
