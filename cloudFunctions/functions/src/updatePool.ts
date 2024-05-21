import axios from "axios";
import {log} from "firebase-functions/logger";
import {EventContext} from "firebase-functions/v1";
import {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import {addToQueue} from "./utils/helper";
import {db, helius} from "./utils/index";
import {PoolType} from "./utils/types";

export default async function updatePool(
  snapshot: QueryDocumentSnapshot,
  context: EventContext<{
    poolId: string;
  }>
): Promise<void> {
  const data = snapshot.data() as PoolType;

  // update metadata
  const metadata = await helius.rpc.getAsset({id: data.mint});
  let valid = true;
  let name;
  let description;
  let symbol;
  let image;
  log(metadata);
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

  let collectionsRequired = data.collectionsRequired;
  // Update Collection Details
  if (collectionsRequired) {
    collectionsRequired = await Promise.all(
      collectionsRequired.map(async (item) => {
        const ref = await db.collection("CollectionDetails").doc(item).get();
        return ref.data();
      })
    );
  }

  let inQueue = false;
  const presaleDuration = data.presaleTimeLimit - Date.now() / 1000;
  // add to queue if presale is within a day
  if (presaleDuration <= 24 * 60 * 60 && presaleDuration > 0 && valid) {
    await addToQueue(context.params.poolId, data.presaleTimeLimit);
    inQueue = true;
  }
  await db
    .collection("Pool")
    .doc(context.params.poolId)
    .set(
      {
        name: name,
        symbol: symbol,
        image: image,
        description: description,
        thumbnail: {
          imageUrl: image,
          title: name,
          description: description,
        },
        rewards: [
          {
            id: context.params.poolId,
            title: "Pledge without a reward",
            content: "",
          },
        ],
        valid: valid,
        mintMetadata: metadata,
        inQueue: inQueue,
        collectionsRequired: collectionsRequired ? collectionsRequired : null,
      },
      {merge: true}
    );
}
