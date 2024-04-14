import React, { FC, ReactNode, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import { User, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { auth } from "../utils/firebase";
import { toast } from "react-toastify";
import { createLoginMessage } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";
import { verifyAndGetToken } from "../utils/cloudFunctions";

export interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey, disconnect } = useWallet();

  const signOut = async () => {
    if (auth) {
      setUser(null);
      await auth.signOut();
    }
    if (publicKey) {
      await disconnect();
    }
  };

  const handleLogin = async (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => {
    if ((user && publicKey.toBase58() !== user.uid) || !user) {
      try {
        const currentUser = await signInAnonymously(auth);
        const sessionKey = await currentUser.user.getIdToken();
        const message = createLoginMessage(sessionKey.slice(0, 32));
        const output = await signMessage(new TextEncoder().encode(message));
        const token = await verifyAndGetToken(publicKey, output);
        // Sign in with Firebase Authentication using a custom token.
        const user = await signInWithCustomToken(auth, token);
        setUser(user.user);
      } catch (error) {
        signOut();
        throw new Error(error as string);
      }
    }
  };

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
