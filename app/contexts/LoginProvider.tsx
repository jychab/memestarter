import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import {
  GoogleAuthProvider,
  User,
  linkWithCredential,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import { useLocalStorage, useWallet } from "@solana/wallet-adapter-react";
import { auth } from "../utils/firebase";
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import { httpsCallable, getFunctions } from "firebase/functions";
import { toast } from "react-toastify";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createLoginMessage } from "../utils/helper";
import { PublicKey } from "@solana/web3.js";

export interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey, signMessage, disconnect } = useWallet();

  useEffect(() => {
    if (publicKey && signMessage) {
      handleLogin(publicKey, signMessage);
    }
  }, [publicKey, signMessage]);

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
    try {
      const currentUser = await signInAnonymously(auth);
      const sessionKey = await currentUser.user.getIdToken();
      const message = createLoginMessage(sessionKey.slice(0, 8));
      const output = await signMessage(new TextEncoder().encode(message));
      const verifyResponse = httpsCallable(getFunctions(), "verifySignIn");
      const token = (
        await verifyResponse({
          signature: bs58.encode(output),
          publicKey: publicKey.toBase58(),
        })
      ).data as string;
      // Sign in with Firebase Authentication using a custom token.
      const user = await signInWithCustomToken(auth, token);
      setUser(user.user);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        user,
        signOut,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
