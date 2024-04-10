import { getFunctions } from "firebase-admin/functions";
import { GoogleAuth } from "google-auth-library";

export async function addToQueue(poolId: string, presaleTimeLimit: number) {
  const queue = getFunctions().taskQueue("updatePoolStatus");
  const uri = await getFunctionUrl("updatePoolStatus");
  await queue.enqueue(
    {
      poolId: poolId,
    },
    {
      scheduleTime: new Date(presaleTimeLimit * 1000),
      uri: uri,
    }
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
  const res = await client.request({ url });
  const uri = (res.data as any).serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return uri;
}
