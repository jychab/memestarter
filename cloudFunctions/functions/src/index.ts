import {onCall, onRequest} from "firebase-functions/v1/https";
import programWebhook from "./programWebhook";
import cors = require("cors");
import {firestore} from "firebase-functions/v1";
import getCoinData from "./getCoinData";
import linkAsset from "./linkAsset";
import unlinkAsset from "./unlinkAsset";
import updateMarketDetails from "./updateMarketDetails";
import mintNft from "./mintNft";

exports.programWebhook = onRequest(async (req, res) =>
  cors({origin: true})(req, res, async () => await programWebhook(req, res))
);
exports.getCoinData = firestore
  .document("Pool/{poolId}")
  .onCreate(async (snapshot, context) => await getCoinData(snapshot, context));

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
