import { AddCircle } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import { RewardCardItem } from "../components/RewardCardItem";
import { useData } from "../hooks/useData";
import { db } from "../utils/firebase";
import { MintType, PoolType, Reward } from "../utils/types";

interface RewardsSectionProps {
  pool: PoolType;
  editingMode?: boolean;
}

export const RewardsSection: FC<RewardsSectionProps> = ({
  pool,
  editingMode = false,
}) => {
  const [selected, setSelected] = useState<string>();
  const [current, setCurrent] = useState<number>(0);
  const [showNew, setShowNew] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const { nft } = useData();
  const { publicKey } = useWallet();
  useEffect(() => {
    if (nft && pool) {
      const unsubscribe = onSnapshot(
        doc(db, `Mint/${nft.id}/Pool/${pool.pool}`),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as MintType;
            setCurrent(data.amount);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [nft, pool]);

  useEffect(() => {
    if (pool) {
      const unsubscribe = onSnapshot(
        collection(db, `Pool/${pool.pool}/Rewards`),
        (snapshot) => {
          setRewards(snapshot.docs.map((item) => item.data() as Reward));
        }
      );
      return () => unsubscribe();
    }
  }, [pool]);

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="flex gap-2 items-center">
        <span className="text-base md:text-lg text-gray-400">Rewards</span>
        {editingMode && publicKey && publicKey.toBase58() == pool.authority && (
          <IconButton
            color="inherit"
            size="medium"
            onClick={() => setShowNew(true)}
          >
            <AddCircle color="inherit" fontSize="inherit" />
          </IconButton>
        )}
      </div>
      {!editingMode && <span className="text-sm">Select an option below</span>}
      {rewards
        .sort((a, b) => (a.price || 0) - (b.price || 0))
        .map((reward) => (
          <RewardCardItem
            key={reward.id}
            reward={reward}
            setSelected={setSelected}
            selected={selected}
            maxAllowed={pool.maxAmountPerPurchase}
            current={current}
            pool={pool}
            editingMode={editingMode}
          />
        ))}
      {showNew && (
        <RewardCardItem
          setSelected={setSelected}
          selected={selected}
          pool={pool}
          editingMode={editingMode}
          editableOnInit={true}
          onCancelCallback={() => setShowNew(false)}
        />
      )}
    </div>
  );
};

export default RewardsSection;
