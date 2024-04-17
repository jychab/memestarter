import { createContext, useContext } from "react";
import { DAS } from "../utils/types";

export interface DataContextState {
  nft: DAS.GetAssetResponse | undefined;
}

export const DataContext = createContext<DataContextState>(
  {} as DataContextState
);

export function useData(): DataContextState {
  return useContext(DataContext);
}
