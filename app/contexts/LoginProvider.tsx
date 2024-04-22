import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import { User, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { auth } from "../utils/firebase";
import { createLoginMessage } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import { verifyAndGetToken } from "../utils/cloudFunctions";

export interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey, disconnect, signMessage } = useWallet();

  const signOut = async () => {
    if (auth) {
      setUser(null);
      await auth.signOut();
    }
    if (publicKey) {
      await disconnect();
    }
  };

  useEffect(() => {
    if (user == null) {
      if (publicKey && signMessage) {
        handleLogin(publicKey, signMessage);
      } else {
        signInAnonymously(auth);
      }
    }
  }, [user, publicKey]);

  const handleLogin = useCallback(
    async (
      publicKey: PublicKey,
      signMessage: (message: Uint8Array) => Promise<Uint8Array>
    ) => {
      if ((user && publicKey.toBase58() !== user.uid) || !user) {
        try {
          let currentUser = user;
          if (!currentUser) {
            currentUser = (await signInAnonymously(auth)).user;
          }
          const sessionKey = await currentUser.getIdToken();
          const message = createLoginMessage(sessionKey.slice(0, 32));
          const output = await signMessage(new TextEncoder().encode(message));
          const token = await verifyAndGetToken(publicKey, output);
          // Sign in with Firebase Authentication using a custom token.
          const newUser = await signInWithCustomToken(auth, token);
          setUser(newUser.user);
        } catch (error) {
          signOut();
          console.log(error);
        }
      }
    },
    [user]
  );

  return (
    <LoginContext.Provider
      value={{
        signOut,
        handleLogin,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
