import type { Equipment } from "../types/equipment";
import type { PlayerStatus } from "../types/player";

export const fixturePlayer: PlayerStatus = {
  username: "Sckottch",
  gold: 1280,
  level: 7,
  xp: 340,
  xpForNextLevel: 1190,
};

export const fixtureInventory: Equipment[] = [
  { id: "1", equipmentType: "Sword", rarity: 5, mainStat: "Attack", mainStatValue: 18.5, rating: 92,
    subStats: [{ id: "1a", statType: "CriticalChance", statValue: 7.7 }, { id: "1b", statType: "Health", statValue: 9 }],
    isEquipped: true,  isForSale: false, salePrice: null },
  { id: "2", equipmentType: "Helmet", rarity: 3, mainStat: "Health", mainStatValue: 20, rating: 54,
    subStats: [{ id: "2a", statType: "Defense", statValue: 12 }],
    isEquipped: true,  isForSale: false, salePrice: null },
  { id: "3", equipmentType: "Armor", rarity: 4, mainStat: "Defense", mainStatValue: 15, rating: 71,
    subStats: [{ id: "3a", statType: "Health", statValue: 25 }],
    isEquipped: true, isForSale: false, salePrice: null },
  { id: "4", equipmentType: "Boots", rarity: 2, mainStat: "Speed", mainStatValue: 11, rating: 33,
    subStats: [], isEquipped: true, isForSale: false, salePrice: null },
  { id: "5", equipmentType: "Sword", rarity: 1, mainStat: "Attack", mainStatValue: 6, rating: 12,
    subStats: [], isEquipped: false, isForSale: false, salePrice: null },
  { id: "6", equipmentType: "Helmet", rarity: 4, mainStat: "Health", mainStatValue: 22, rating: 68,
    subStats: [{ id: "6a", statType: "CriticalDamage", statValue: 14 }], isEquipped: false, isForSale: false, salePrice: null },
];

// Anúncios de outros jogadores (separado do inventário do player).
// Fase 5: virão de GET /api/market/list.
export const fixtureListings: Equipment[] = [
  { id: "m1", equipmentType: "Sword", rarity: 5, mainStat: "Attack", mainStatValue: 46, rating: 95,
    subStats: [{ id: "m1a", statType: "CriticalDamage", statValue: 22 }], isEquipped: false, isForSale: true, salePrice: 1500 },
  { id: "m2", equipmentType: "Armor", rarity: 3, mainStat: "Defense", mainStatValue: 24, rating: 60,
    subStats: [], isEquipped: false, isForSale: true, salePrice: 400 },
  { id: "m3", equipmentType: "Boots", rarity: 4, mainStat: "Speed", mainStatValue: 12, rating: 70,
    subStats: [{ id: "m3a", statType: "CriticalChance", statValue: 9 }], isEquipped: false, isForSale: true, salePrice: 800 },
  { id: "m4", equipmentType: "Helmet", rarity: 2, mainStat: "Health", mainStatValue: 16, rating: 38,
    subStats: [], isEquipped: false, isForSale: true, salePrice: 150 },
  { id: "m5", equipmentType: "Sword", rarity: 3, mainStat: "Attack", mainStatValue: 22, rating: 55,
    subStats: [{ id: "m5a", statType: "Health", statValue: 11 }], isEquipped: false, isForSale: true, salePrice: 350 },
  { id: "m6", equipmentType: "Armor", rarity: 5, mainStat: "Defense", mainStatValue: 44, rating: 88,
    subStats: [{ id: "m6a", statType: "Health", statValue: 18 }, { id: "m6b", statType: "Defense", statValue: 13 }],
    isEquipped: false, isForSale: true, salePrice: 2200 },
  { id: "m7", equipmentType: "Boots", rarity: 1, mainStat: "Speed", mainStatValue: 7, rating: 20,
    subStats: [], isEquipped: false, isForSale: true, salePrice: 60 },
];