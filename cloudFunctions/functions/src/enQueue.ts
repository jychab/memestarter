import { log } from "firebase-functions/logger";
import { db } from "./utils";
import { addToQueue } from "./utils/helper";
import { Pool } from "./utils/types";

export async function enQueue() {
  let currentTime = Date.now() / 1000;
  // Fetch all user details.
  const candidates = await db
    .collection("Pool")
    .where("inQueue", "==", false)
    .where("presaleTimeLimit", ">", currentTime)
    .where("presaleTimeLimit", "<=", currentTime + 24 * 60 * 60)
    .get();
  let batch = db.batch();
  if (!candidates.empty) {
    await Promise.all(
      candidates.docs.map((candidate) => {
        const data = candidate.data() as Pool;
        batch.update(candidate.ref, {
          inQueue: true,
        });
        return addToQueue(data.pool, data.presaleTimeLimit);
      })
    );
    await batch.commit();
  }

  log("Job finished");
}
