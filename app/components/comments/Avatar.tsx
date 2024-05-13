import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useFirestoreWtihSWR from "../../hooks/useFirestoreWithSWR";
import logo from "../../public/logo.png";
import { DAS } from "../../utils/types";

type AvatarProps = {
  user: string;
};

const Avatar = (props: AvatarProps) => {
  const user = props.user;
  const [nft, setNft] = useState<DAS.GetAssetResponse>();
  const { getDocument } = useFirestoreWtihSWR();
  const { data } = getDocument(`Users/${user}`);

  useEffect(() => {
    if (data && data.exists()) {
      setNft((data.data() as { nft: DAS.GetAssetResponse }).nft);
    } else {
      setNft(undefined);
    }
  }, [data]);

  const router = useRouter();

  return (
    <button
      disabled={!nft}
      onClick={() => nft && router.push(`/mint/${nft.id}`)}
      className="w-10 h-10 relative"
    >
      <Image
        className={`rounded-full object-cover border border-gray-400`}
        fill={true}
        priority={true}
        sizes="33vw"
        quality={100}
        src={(nft?.content?.links?.image as string) || logo}
        alt={"Username"}
      />
    </button>
  );
};

export default Avatar;
