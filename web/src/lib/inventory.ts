import type { Equipment, EquipmentType } from "../types/equipment";

export const EQUIPMENT_TYPE_ORDER: EquipmentType[] = ["Sword", "Helmet", "Armor", "Boots"];

export function sortByTypeOrder(items: Equipment[]): Equipment[] {
  return [...items].sort(
    (a, b) => EQUIPMENT_TYPE_ORDER.indexOf(a.equipmentType) - EQUIPMENT_TYPE_ORDER.indexOf(b.equipmentType),
  );
}

// Espelho local (Fase 4) das regras do backend. Na Fase 5 o servidor passa a ser
// a fonte de verdade — estas funções deixam de decidir e o estado vem da resposta da API.

export function applyEquip(items: Equipment[], id: string): Equipment[] {
  const target = items.find((i) => i.id === id);
  if (!target) return items;
  return items.map((i) => {
    if (i.id === id) return { ...i, isEquipped: true };
    if (i.equipmentType === target.equipmentType && i.isEquipped)
      return { ...i, isEquipped: false };
    return i;
  });
}

export function applyUnequip(items: Equipment[], id: string): Equipment[] {
  return items.map((i) => (i.id === id ? { ...i, isEquipped: false } : i));
}

export function applyDelete(items: Equipment[], id: string): Equipment[] {
  return items.filter((i) => i.id !== id);
}

export function sortInventory(items: Equipment[]): Equipment[] {
  return [...items].sort((a, b) => b.rarity - a.rarity || b.rating - a.rating);
}

export function applyList(items: Equipment[], id: string, price: number): Equipment[] {
  return items.map((i) => (i.id === id ? { ...i, isForSale: true, salePrice: price } : i));
}

export function applyUnlist(items: Equipment[], id: string): Equipment[] {
  return items.map((i) => (i.id === id ? { ...i, isForSale: false, salePrice: null } : i));
}
