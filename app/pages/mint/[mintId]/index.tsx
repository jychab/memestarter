import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MintDashboard } from "../../../sections/MintDashboard";
import useUmi from "../../../hooks/useUmi";
import { publicKey } from "@metaplex-foundation/umi";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";

export default function Mint() {
  const router = useRouter();
  const umi = useUmi();
  const [item, setItem] = useState<DasApiAsset>();
  const { mintId } = router.query;

  useEffect(() => {
    if (mintId) {
      umi.rpc
        .getAsset(publicKey(mintId as string))
        .then((response) => setItem(response));
    }
  }, [mintId]);

  return (
    <div className="flex flex-col h-full w-full max-w-screen-lg gap-4 lg:items-center justify-between">
      {item && <MintDashboard item={item} />}
    </div>
  );
}
