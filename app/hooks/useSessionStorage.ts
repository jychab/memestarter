import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export function useSessionStorage<T>(
  key: string,
  defaultState: T
): [T, Dispatch<SetStateAction<T>>] {
  const state = useState<T>(() => {
    try {
      const value = sessionStorage.getItem(key);
      if (value) return JSON.parse(value) as T;
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }

    return defaultState;
  });
  const value = state[0];

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    try {
      if (value === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }
  }, [value, key]);

  return state;
}
