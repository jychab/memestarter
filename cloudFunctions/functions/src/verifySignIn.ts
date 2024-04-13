import {bs58} from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {getAuth} from "firebase-admin/auth";
import {CallableContext, HttpsError} from "firebase-functions/v1/https";
import nacl = require("tweetnacl");

export interface verifySignIn {
  signature: string;
  publicKey: string;
}

export async function verifySignIn(
  data: verifySignIn,
  context: CallableContext
): Promise<string> {
  if (context.auth == null) {
    throw new HttpsError("permission-denied", "Not Authenticated");
  }
  if (context.auth.token.firebase.sign_in_provider !== "anonymous") {
    throw new HttpsError("permission-denied", "Wrong Authentication");
  }
  const idToken =
    context.rawRequest.headers.authorization!.split("Bearer ")[1]!;
  const message = createLoginMessage(idToken.slice(0, 8));

  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(message),
    bs58.decode(data.signature),
    bs58.decode(data.publicKey)
  );

  if (!verified) {
    throw new HttpsError("permission-denied", "Unauthorised User");
  }

  // Issue a custom token with the authenticated publicKey as the uid.
  const token = await getAuth().createCustomToken(data.publicKey);
  return token;
}

function createLoginMessage(sessionKey: string) {
  return `Sign In to https://memestarter.app\n\nNonce: ${sessionKey}}`;
}
