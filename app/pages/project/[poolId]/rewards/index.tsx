import { useRouter } from "next/router";
import useFirestoreWtihSWR from "../../../../hooks/useFirestoreWithSWR";
import RewardsSection from "../../../../sections/RewardsSection";
import { getStatus } from "../../../../utils/helper";
import { PoolType } from "../../../../utils/types";

function Rewards() {
  const { getDocument } = useFirestoreWtihSWR();
  const router = useRouter();
  const poolId = router.query.poolId;
  const { data } = getDocument(`Pool/${poolId}`);
  if (data && data.exists()) {
    const pool = data.data() as PoolType;
    const status = getStatus(pool);
    return (
      status && (
        <div className="max-w-screen-xl w-full ">
          <RewardsSection pool={pool} status={status} />
        </div>
      )
    );
  } else {
    return null;
  }
}

export default Rewards;
