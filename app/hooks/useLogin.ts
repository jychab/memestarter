import { PublicKey } from "@solana/web3.js";
import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export interface LoginContextState {
  signOut: () => Promise<void>;
  handleLogin: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
  ) => Promise<void>;
}

export const LoginContext = createContext<LoginContextState>(
  {} as LoginContextState
);

export function useLogin(): LoginContextState {
  return useContext(LoginContext);
}
