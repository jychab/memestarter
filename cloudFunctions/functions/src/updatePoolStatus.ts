import {Request} from "firebase-functions/v2/tasks";
import {db} from "./utils";
import {Status} from "./utils/types";

export async function updatePoolStatus(req: Request) {
  // decided whether to launch or not

  await db.collection("Pool").doc(req.data.poolId).update({
    status: Status.Ended,
  });
}
