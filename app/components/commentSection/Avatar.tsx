import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import logo from "../../public/logo.png";
import { useRouter } from "next/router";
import { DAS } from "../../utils/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

type AvatarProps = {
  user: string;
};

const Avatar = (props: AvatarProps) => {
  const user = props.user;
  const [nft, setNft] = useState<DAS.GetAssetResponse>();
  useEffect(() => {
    if (user && !nft) {
      getDoc(doc(db, `Users/${user}`)).then((res) => {
        if (res.exists()) {
          setNft((res.data() as { nft: DAS.GetAssetResponse }).nft);
        } else {
          setNft(undefined);
        }
      });
    }
  }, [user, nft]);

  const router = useRouter();

  return (
    <button
      disabled={!nft}
      onClick={() => nft && router.push(`/mint/${nft.id}`)}
    >
      <Image
        className={`rounded-full border border-gray-400`}
        width={50}
        height={50}
        src={(nft?.content?.links?.image as string) || logo}
        alt={"Username"}
      />
    </button>
  );
};

export default Avatar;
