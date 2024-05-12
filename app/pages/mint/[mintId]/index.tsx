import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useUmi from "../../../hooks/useUmi";
import { MintDashboard } from "../../../sections/MintDashboard";
import { getCollectionMintAddress } from "../../../utils/helper";
import { DAS } from "../../../utils/types";

export default function Mint() {
  const router = useRouter();
  const { getAsset } = useUmi();
  const [item, setItem] = useState<DAS.GetAssetResponse>();
  const [collectionItem, setCollectionItem] = useState<DAS.GetAssetResponse>();
  const { mintId } = router.query;

  const { data: mintData } = useSWR(mintId ? mintId : null, getAsset);

  useEffect(() => {
    if (mintData) {
      setItem(mintData as unknown as DAS.GetAssetResponse);
    }
  }, [mintData]);

  const { data: collectionMintData } = useSWR(
    item ? getCollectionMintAddress(item) : null,
    getAsset
  );

  useEffect(() => {
    if (collectionMintData) {
      setCollectionItem(collectionMintData as unknown as DAS.GetAssetResponse);
    }
  }, [collectionMintData]);

  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {item && <MintDashboard item={item} collectionItem={collectionItem} />}
    </div>
  );
}
