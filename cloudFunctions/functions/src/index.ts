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
import {db} from "./utils";
import {Status} from "./utils/types";

exports.programWebhook = onRequest(async (req, res) =>
  cors({origin: true})(req, res, async () => await programWebhook(req, res))
);
exports.updatePool = firestore
  .document("Pool/{poolId}")
  .onCreate(async (snapshot, context) => await updatePool(snapshot, context));

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
  async (req) => {
    await db.collection("Pool").doc(req.data.poolId).update({
      status: Status.Ended,
    });
  }
);

exports.linkAsset = onCall(
  async (data, context) => await linkAsset(data, context)
);

exports.unlinkAsset = onCall(
  async (data, context) => await unlinkAsset(data, context)
);

exports.updateMarketDetails = onCall(
  async (data, context) => await updateMarketDetails(data, context)
);

exports.mintNft = onCall(async (data, context) => await mintNft(data, context));
