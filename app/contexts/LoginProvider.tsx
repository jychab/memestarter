import React, { FC, ReactNode, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import { User, signInAnonymously } from "firebase/auth";
import {
  useConnection,
  useLocalStorage,
  useWallet,
} from "@solana/wallet-adapter-react";
import { auth, db } from "../utils/firebase";
import { DAS } from "../utils/types";
import useUmi from "../hooks/useUmi";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { publicKey as pubKey } from "@metaplex-foundation/umi";
import { getSignature } from "../utils/helper";
import { toast } from "react-toastify";

export interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey, signMessage, disconnect } = useWallet();
  const [nft, setNft] = useState<DasApiAsset>();
  const [signedMessage, setSignedMessage] = useLocalStorage<string | null>(
    "signedMessage",
    null
  );
  const [sessionKey, setSessionKey] = useLocalStorage<string | null>(
    "sessionKey",
    null
  );
  const umi = useUmi();

  useEffect(() => {
    if (publicKey && user === null) {
      signInAnonymously(auth);
    }
    if (publicKey && user && signMessage) {
      setSessionKey(null);
      getSignature(
        user,
        signedMessage,
        sessionKey,
        signMessage,
        setSignedMessage,
        setSessionKey
      )
        .then(() => toast.success("Signed In"))
        .catch(() => {
          if (publicKey) {
            disconnect();
          }
          if (user !== null) {
            auth.signOut();
          }
          setNft(undefined);
          toast.error("Unable to Sign In");
        });
    }
    if (publicKey && user && umi) {
      const unsubscribe = onSnapshot(
        doc(db, `Users/${publicKey.toBase58()}`),
        (doc) => {
          setNft(undefined);
          if (doc.exists()) {
            const data = doc.data() as { nft: DasApiAsset };
            if (data.nft) {
              umi.rpc.getAsset(pubKey(data.nft.id)).then((data) => {
                if (data.ownership.owner.toString() === publicKey.toString()) {
                  setNft(data);
                }
              });
            }
          }
        }
      );
      return () => unsubscribe();
    }
  }, [publicKey, user]);

  useEffect(() => {
    const authenticationListener = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => authenticationListener();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        setSignedMessage,
        signedMessage,
        setSessionKey,
        sessionKey,
        nft,
        user,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
