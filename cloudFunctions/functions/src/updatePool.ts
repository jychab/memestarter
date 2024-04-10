import { db, helius } from "./utils/index";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
import { Pool } from "./utils/types";
import { EventContext } from "firebase-functions/v1";
import axios from "axios";
import { addToQueue } from "./utils/helper";

export default async function updatePool(
  snapshot: QueryDocumentSnapshot,
  context: EventContext<{
    poolId: string;
  }>
): Promise<void> {
  const data = snapshot.data() as Pool;

  let inQueue = false;
  let presaleDuration = data.presaleTimeLimit - Date.now() / 1000;
  //add to queue if presale is within a day
  if (presaleDuration <= 24 * 60 * 60 && presaleDuration > 0) {
    await addToQueue(context.params.poolId, data.presaleTimeLimit);
    inQueue = true;
  }

  //update metadata
  const metadata = await helius.rpc.getAsset({ id: data.mint });
  let valid = true;
  let name;
  let description;
  let symbol;
  let image;
  if (metadata.content) {
    const jsonMetadata = await axios.get(metadata.content.json_uri);
    const data = jsonMetadata.data as {
      name: string;
      symbol: string;
      image: string;
      description: string;
    };
    name = data.name;
    symbol = data.symbol;
    image = data.image;
    description = data.description;
    if (!name || !symbol || !image) {
      valid = false;
    }
  } else {
    valid = false;
  }
  await db.collection("Pool").doc(context.params.poolId).set(
    {
      name: name,
      symbol: symbol,
      image: image,
      description: description,
      valid: valid,
      mintMetadata: metadata,
      inQueue: inQueue,
    },
    { merge: true }
  );
}
