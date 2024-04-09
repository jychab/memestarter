import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export interface LoginContextState {
  setSignedMessage: React.Dispatch<React.SetStateAction<string | null>>;
  signedMessage: string | null;
  setSessionKey: React.Dispatch<React.SetStateAction<string | null>>;
  sessionKey: string | null;
  nft: DasApiAsset | undefined;
  user: User | null;
}

export const LoginContext = createContext<LoginContextState>(
  {} as LoginContextState
);

export function useLogin(): LoginContextState {
  return useContext(LoginContext);
}
