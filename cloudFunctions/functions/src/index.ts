import {firestore} from "firebase-functions/v1";
import {onCall, onRequest} from "firebase-functions/v1/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import {handleCommentsAndReplies} from "./commentsAndReplies";
import {enQueue} from "./enQueue";
import getPrice from "./getPrice";
import linkAsset from "./linkAsset";
import programWebhook from "./programWebhook";
import {saveAdditionalInfo} from "./saveInfo";
import {saveThumbnail} from "./saveThumbnail";
import unlinkAsset from "./unlinkAsset";
import updateMarketDetails from "./updateMarketDetails";
import updatePool from "./updatePool";
import {updatePoolStatus} from "./updatePoolStatus";
import {verifySignIn} from "./verifySignIn";
import cors = require("cors");

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

exports.handleCommentsAndReplies = onCall(
  async (data, context) => await handleCommentsAndReplies(data, context)
);

exports.saveAdditionalInfo = onCall(
  async (data, context) => await saveAdditionalInfo(data, context)
);

exports.saveThumbnail = onCall(
  async (data, context) => await saveThumbnail(data, context)
);
