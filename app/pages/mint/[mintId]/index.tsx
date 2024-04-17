import React, { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MintDashboard } from "../../../sections/MintDashboard";
import useUmi from "../../../hooks/useUmi";
import { publicKey } from "@metaplex-foundation/umi";
import { getCollectionMintAddress } from "../../../utils/helper";
import { DAS } from "../../../utils/types";

export default function Mint() {
  const router = useRouter();
  const umi = useUmi();
  const [item, setItem] = useState<DAS.GetAssetResponse>();
  const [collectionItem, setCollectionItem] = useState<DAS.GetAssetResponse>();
  const { mintId } = router.query;

  const fetchAsset = useCallback(async () => {
    if (mintId) {
      const response = (await umi.rpc.getAsset(
        publicKey(mintId as string)
      )) as unknown as DAS.GetAssetResponse;
      setItem(response);
      const collectionMint = getCollectionMintAddress(response);
      if (collectionMint) {
        const res = await umi.rpc.getAsset(publicKey(collectionMint));
        setCollectionItem(res as unknown as DAS.GetAssetResponse);
      }
    }
  }, [mintId, umi]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {item && <MintDashboard item={item} collectionItem={collectionItem} />}
    </div>
  );
}
