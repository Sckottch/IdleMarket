/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMe } from "../data/playerService";
import type { PlayerData } from "../data/playerService";
import { equipItem, unequipItem, deleteEquipment } from "../data/inventoryService";
import { buy, sell, unlist } from "../data/marketService";
import type { Equipment } from "../types/equipment";
import type { PlayerStatus } from "../types/player";
import { logout as authLogout } from "../data/authService";
import { hasToken } from "../data/api";

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
    const data = await getMe();
    setStatus(data.status);
    setInventory(data.inventory);
    return data;
  }


  useEffect(() => {
    async function boot() {
      if (!hasToken()) {
        setLoading(false)
        return
      }

      try {
        await refresh()
      } catch {
        await authLogout()
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, []);

  async function equip(id: string) {
    await equipItem(id)
    await refresh()
  }

  async function unequip(id: string) {
    await unequipItem(id)
    await refresh()
  }

  async function deleteItem(id: string) {
    await deleteEquipment(id)
    await refresh()
  }

  async function buyItem(item: Equipment) {
    await buy(item.id)
    await refresh()
  }

  async function sellItem(id: string, price: number) {
    await sell(id, price)
    await refresh()
  }

  async function unlistItem(id: string) {
    await unlist(id)
    await refresh()
  }

  async function logout() {
    await authLogout()
    setStatus(null)
    setInventory([])
    setLoading(false)
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