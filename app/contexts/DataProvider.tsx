import { useWallet } from "@solana/wallet-adapter-react";
import { doc, onSnapshot } from "firebase/firestore";
import { FC, ReactNode, useEffect, useState } from "react";
import useSWR from "swr";
import { DataContext } from "../hooks/useData";
import useUmi from "../hooks/useUmi";
import { db } from "../utils/firebase";
import { DAS } from "../utils/types";

export interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const [nft, setNft] = useState<DAS.GetAssetResponse>();
  const [nftData, setNftData] = useState<{
    nft: DAS.GetAssetResponse | undefined;
  }>();
  const { getAsset } = useUmi();

  useEffect(() => {
    if (publicKey) {
      const unsubscribe = onSnapshot(
        doc(db, `Users/${publicKey.toBase58()}`),
        (doc) => {
          if (doc.exists()) {
            const nftData = doc.data() as {
              nft: DAS.GetAssetResponse | undefined;
            };
            setNftData(nftData);
          } else {
            setNftData(undefined);
            setNft(undefined);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [publicKey]);

  const { data } = useSWR(
    nftData && nftData.nft ? nftData.nft.id : null,
    getAsset
  );

  useEffect(() => {
    if (
      data &&
      publicKey &&
      data.ownership.owner.toString() === publicKey.toString()
    ) {
      setNft(data as unknown as DAS.GetAssetResponse);
    } else {
      setNft(undefined);
    }
  }, [data, publicKey]);

  return (
    <DataContext.Provider
      value={{
        nft,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
