import {onCall, onRequest} from "firebase-functions/v1/https";
import programWebhook from "./programWebhook";
import cors = require("cors");
import {firestore} from "firebase-functions/v1";
import updatePool from "./updatePool";
import linkAsset from "./linkAsset";
import unlinkAsset from "./unlinkAsset";
import updateMarketDetails from "./updateMarketDetails";
import mintNft from "./mintNft";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {updatePoolStatus} from "./updatePoolStatus";
import {enQueue} from "./enQueue";
import {verifySignIn} from "./verifySignIn";
import getPrice from "./getPrice";

exports.programWebhook = onRequest(async (req, res) =>
  cors({origin: true})(req, res, async () => await programWebhook(req, res))
);
exports.updatePool = firestore
  .document("Pool/{poolId}")
  .onCreate(async (snapshot, context) => await updatePool(snapshot, context));

exports.verifySignIn = onCall(
  async (data, context) => await verifySignIn(data, context)
);

exports.getPrice = onCall(
  async (data, context) => await getPrice(data, context)
);

exports.linkAsset = onCall(
  async (data, context) => await linkAsset(data, context)
);

exports.unlinkAsset = onCall(async (_, context) => await unlinkAsset(context));

exports.updateMarketDetails = onCall(
  async (data, context) => await updateMarketDetails(data, context)
);

exports.mintNft = onCall(async (_, context) => await mintNft(context));

exports.updatePoolStatus = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 6,
    },
  },
  async (req) => updatePoolStatus(req)
);

exports.addToQueue = onSchedule("every day 00:00", async (_) => {
  enQueue();
});
