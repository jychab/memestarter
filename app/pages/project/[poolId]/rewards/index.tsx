import { useRouter } from "next/router";
import useFirestoreWtihSWR from "../../../../hooks/useFirestoreWithSWR";
import RewardsSection from "../../../../sections/RewardsSection";
import { PoolType } from "../../../../utils/types";

function Rewards() {
  const { getDocument } = useFirestoreWtihSWR();
  const router = useRouter();
  const poolId = router.query.poolId;
  const { data } = getDocument(`Pool/${poolId}`);
  return (
    data && (
      <div className="max-w-screen-lg w-full ">
        <RewardsSection pool={data.data() as PoolType} />
      </div>
    )
  );
}

export default Rewards;
