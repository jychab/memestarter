import {db, helius} from "./utils/index";
import {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import {Mint} from "./utils/types";
import {EventContext} from "firebase-functions/v1";

export default async function getMintData(
  snapshot: QueryDocumentSnapshot,
  context: EventContext<{
    poolId: string;
    mintId: string;
  }>
): Promise<void> {
  const data = snapshot.data() as Mint;
  const metadata = await helius.rpc.getAsset({id: data.originalMint});
  await db.collection("Mint").doc(context.params.mintId).set(
    {
      mintMetadata: metadata,
    },
    {merge: true}
  );
}
