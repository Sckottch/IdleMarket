export type StatType =
  | "Health"
  | "Attack"
  | "Defense"
  | "Speed"
  | "CriticalChance"
  | "CriticalDamage";

export type EquipmentType = "Helmet" | "Armor" | "Boots" | "Sword";

export interface SubStat {
  id: string;
  statType: StatType;
  statValue: number;
}

export interface Equipment {
  id: string;
  equipmentType: EquipmentType;
  rarity: number;          
  mainStat: StatType;
  mainStatValue: number;
  rating: number;          
  subStats: SubStat[];
  isEquipped: boolean;
  isForSale: boolean;
  salePrice: number | null;
}