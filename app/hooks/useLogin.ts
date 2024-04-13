import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export interface LoginContextState {
  user: User | null;
  signOut: () => Promise<void>;
}

export const LoginContext = createContext<LoginContextState>(
  {} as LoginContextState
);

export function useLogin(): LoginContextState {
  return useContext(LoginContext);
}
