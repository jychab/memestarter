import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { PublicKey } from "@solana/web3.js";
import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export interface LoginContextState {
  user: User | null;
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
