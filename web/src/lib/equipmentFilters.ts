import type { Equipment, EquipmentType, StatType } from "../types/equipment";

export type SubStatFilter = {
  id: string;
  statType: StatType;
  min: number | null;
  max: number | null;
};

export type Filters = {
  types: EquipmentType[];
  mainStatMin: number | null;
  mainStatMax: number | null;
  subStats: SubStatFilter[];
  ratingMin: number | null;
  rarities: number[];
  priceMin: number | null;
  priceMax: number | null;
};

export const emptyFilters: Filters = {
  types: [],
  mainStatMin: null,
  mainStatMax: null,
  subStats: [],
  ratingMin: null,
  rarities: [],
  priceMin: null,
  priceMax: null,
};

export function filterEquipment(items: Equipment[], filters: Filters): Equipment[] {
  return items.filter((item) => {
    if (filters.types.length > 0 && !filters.types.includes(item.equipmentType)) return false;
    if (filters.mainStatMin !== null && item.mainStatValue < filters.mainStatMin) return false;
    if (filters.mainStatMax !== null && item.mainStatValue > filters.mainStatMax) return false;

    for (const sub of filters.subStats) {
      const match = item.subStats.find((s) => s.statType === sub.statType);
      if (!match) return false;
      if (sub.min !== null && match.statValue < sub.min) return false;
      if (sub.max !== null && match.statValue > sub.max) return false;
    }

    if (filters.ratingMin !== null && item.rating < filters.ratingMin) return false;
    if (filters.rarities.length > 0 && !filters.rarities.includes(item.rarity)) return false;

    const price = item.salePrice ?? 0;
    if (filters.priceMin !== null && price < filters.priceMin) return false;
    if (filters.priceMax !== null && price > filters.priceMax) return false;

    return true;
  });
}