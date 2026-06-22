import type { EquipmentType, StatType } from "../../generated/prisma/enums.js";

export interface SubStatDTO {
  id: string;
  statType: StatType;
  statValue: number;
}

export interface EquipmentDTO {
  id: string;
  equipmentType: EquipmentType;
  rarity: number;          
  mainStat: StatType;
  mainStatValue: number;
  rating: number;          
  subStats: SubStatDTO[];
  isEquipped: boolean;
  isForSale: boolean;
  salePrice: number | null;
}

export interface PlayerDataDTO {
  status: {
    username: string;
    gold: number;
    level: number;
    xp: number;
    xpForNextLevel: number;
  };
  inventory: EquipmentDTO[];
}