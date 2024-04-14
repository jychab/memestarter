import React, { FC, ReactNode, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import { useWallet } from "@solana/wallet-adapter-react";
import { db } from "../utils/firebase";
import useUmi from "../hooks/useUmi";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { doc, onSnapshot } from "firebase/firestore";
import { publicKey as pubKey } from "@metaplex-foundation/umi";
import { DataContext } from "../hooks/useData";

export interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const { publicKey } = useWallet();
  const [nft, setNft] = useState<DasApiAsset>();
  const umi = useUmi();

  useEffect(() => {
    if (publicKey && umi) {
      const unsubscribe = onSnapshot(
        doc(db, `Users/${publicKey.toBase58()}`),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data() as { nft: DasApiAsset };
            if (data.nft) {
              umi.rpc.getAsset(pubKey(data.nft.id)).then((data) => {
                if (data.ownership.owner.toString() === publicKey.toString()) {
                  setNft(data);
                } else {
                  setNft(undefined);
                }
              });
            } else {
              setNft(undefined);
            }
          } else {
            setNft(undefined);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [publicKey]);

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