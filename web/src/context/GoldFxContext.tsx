/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useFloatingNumber } from "../hooks/useFloatingNumber";

type GoldFxContextValue = {
  goldFx: number | null;
  showGold: (delta: number) => void;
};

const GoldFxContext = createContext<GoldFxContextValue | null>(null);

export function GoldFxProvider({ children }: { children: ReactNode }) {
  const { value, trigger } = useFloatingNumber();
  return (
    <GoldFxContext.Provider value={{ goldFx: value, showGold: trigger }}>
      {children}
    </GoldFxContext.Provider>
  );
}

export function useGoldFx() {
  const ctx = useContext(GoldFxContext);
  if (!ctx) throw new Error("useGoldFx precisa estar dentro de <GoldFxProvider>");
  return ctx;
}
