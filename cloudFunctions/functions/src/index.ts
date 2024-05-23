import {firestore} from "firebase-functions/v1";
import {onCall, onRequest} from "firebase-functions/v1/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onTaskDispatched} from "firebase-functions/v2/tasks";
import {handleCommentsAndReplies} from "./commentsAndReplies";
import {enQueue} from "./enQueue";
import getPrice from "./getPrice";
import programWebhook from "./programWebhook";
import purchaseReward from "./purchaseReward";
import saveAsset from "./saveAsset";
import {saveInfo} from "./saveInfo";
import {saveReward} from "./saveReward";
import {saveThumbnail} from "./saveThumbnail";
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

exports.saveInfo = onCall(
  async (data, context) => await saveInfo(data, context)
);

exports.saveThumbnail = onCall(
  async (data, context) => await saveThumbnail(data, context)
);

exports.saveReward = onCall(
  async (data, context) => await saveReward(data, context)
);

exports.purchaseReward = onCall(
  async (data, context) => await purchaseReward(data, context)
);

exports.saveAsset = onCall(
  async (data, context) => await saveAsset(data, context)
);
