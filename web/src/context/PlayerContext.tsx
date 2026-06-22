/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMe } from "../data/playerService";
import type { PlayerData } from "../data/playerService";
import { equipItem, unequipItem, deleteEquipment } from "../data/equipmentService";
import { buy, sell, unlist } from "../data/marketService";
import { applyEquip, applyUnequip, applyDelete, applyList, applyUnlist } from "../lib/inventory";
import type { Equipment } from "../types/equipment";
import type { PlayerStatus } from "../types/player";
import { logout as clearSession } from "../data/authService";

type PlayerContextValue = {
  status: PlayerStatus | null;
  inventory: Equipment[];
  loading: boolean;
  refresh: () => Promise<PlayerData>;
  equip: (id: string) => Promise<void>;
  unequip: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  buyItem: (item: Equipment) => Promise<void>;
  sellItem: (id: string, price: number) => Promise<void>;
  unlistItem: (id: string) => Promise<void>;
  logout: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PlayerStatus | null>(null);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh(): Promise<PlayerData> {
    setLoading(true);
    const data = await getMe();
    setStatus(data.status);
    setInventory(data.inventory);
    setLoading(false);
    return data;
  }


  useEffect(() => {
    refresh();
  }, []);

  // Fase 4: chama o seam e espelha a mudança no cache. Fase 5: o servidor responde
  // o estado autoritativo (trocar o apply local por refresh() / resposta da API).
  async function equip(id: string) {
    await equipItem(id);
    setInventory((prev) => applyEquip(prev, id));
  }

  async function unequip(id: string) {
    await unequipItem(id);
    setInventory((prev) => applyUnequip(prev, id));
  }

  async function deleteItem(id: string) {
    await deleteEquipment(id);
    setInventory((prev) => applyDelete(prev, id));
  }

  async function buyItem(item: Equipment) {
    await buy(item.id);
    const price = item.salePrice ?? 0;
    setStatus((prev) => (prev ? { ...prev, gold: prev.gold - price } : prev));
    setInventory((prev) => [...prev, { ...item, isEquipped: false, isForSale: false, salePrice: null }]);
  }

  async function sellItem(id: string, price: number) {
    await sell(id, price);
    setInventory((prev) => applyList(prev, id, price));
  }

  async function unlistItem(id: string) {
    await unlist(id);
    setInventory((prev) => applyUnlist(prev, id));
  }

  async function logout() {
    await clearSession();
    setStatus(null);
    setInventory([]);
    setLoading(false);
  }

  return (
    <PlayerContext.Provider value={{ status, inventory, loading, refresh, equip, unequip, deleteItem, buyItem, sellItem, unlistItem, logout }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer precisa estar dentro de <PlayerProvider>");
  return ctx;
}