import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { User, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { FC, ReactNode, useEffect, useState } from "react";
import { LoginContext } from "../hooks/useLogin";
import { verifyAndGetToken } from "../utils/cloudFunctions";
import { auth } from "../utils/firebase";
import { createLoginMessage } from "../utils/helper";

export interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { publicKey, disconnect, signMessage } = useWallet();

  const signOut = async () => {
    if (auth) {
      await auth.signOut();
      setUser(null);
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
        signInAnonymously(auth).then((res) => setUser(res.user));
      }
    }
  }, [user, publicKey]);

  const handleLogin = async (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => {
    if (
      (user && publicKey.toBase58() !== user.uid) ||
      !user ||
      user.isAnonymous
    ) {
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
