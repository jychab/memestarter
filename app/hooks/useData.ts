import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { createContext, useContext } from "react";

export interface DataContextState {
  nft: DasApiAsset | undefined;
}

export const DataContext = createContext<DataContextState>(
  {} as DataContextState
);

export function useData(): DataContextState {
  return useContext(DataContext);
}
