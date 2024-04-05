import {db, helius} from "./utils/index";
import {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import {Pool} from "./utils/types";
import {EventContext} from "firebase-functions/v1";

export default async function getCoinData(
  snapshot: QueryDocumentSnapshot,
  context: EventContext<{
    poolId: string;
  }>
): Promise<void> {
  const data = snapshot.data() as Pool;
  const metadata = await helius.rpc.getAsset({id: data.mint});
  await db.collection("Pool").doc(context.params.poolId).set(
    {
      mintMetadata: metadata,
    },
    {merge: true}
  );
}
