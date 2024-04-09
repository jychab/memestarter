import {db, helius} from "./utils/index";
import {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import {Pool} from "./utils/types";
import {EventContext} from "firebase-functions/v1";
import axios from "axios";
import {getFunctions} from "firebase-admin/functions";
import {GoogleAuth} from "google-auth-library";

export default async function updatePool(
  snapshot: QueryDocumentSnapshot,
  context: EventContext<{
    poolId: string;
  }>
): Promise<void> {
  const data = snapshot.data() as Pool;
  const queue = getFunctions().taskQueue("updatePoolStatus");
  const uri = await getFunctionUrl("updatePoolStatus");
  await queue.enqueue(
    {
      poolId: context.params.poolId,
    },
    {
      scheduleTime: new Date(data.presaleTimeLimit * 1000),
      uri: uri,
    }
  );
  const metadata = await helius.rpc.getAsset({id: data.mint});
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
    },
    {merge: true}
  );
}

/**
 * Get the URL of a given v2 cloud function.
 *
 * @param {string} name the function's name
 * @param {string} location the function's location
 * @return {Promise<string>} The URL of the function
 */
async function getFunctionUrl(name: string, location = "us-central1") {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  const projectId = await auth.getProjectId();
  const url =
    "https://cloudfunctions.googleapis.com/v2beta/" +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request({url});
  const uri = (res.data as any).serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return uri;
}
