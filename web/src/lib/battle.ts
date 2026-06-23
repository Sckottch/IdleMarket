import type { Equipment } from "../types/equipment";
import type { PlayerData } from "../data/playerService";

export type Rewards = {
    newItems: Equipment[];
    goldDelta: number;      
    xpGained: number;       
    leveledUp: boolean;
    newLevel: number;
};

export function diffRewards(before: PlayerData, after: PlayerData): Rewards {
    const beforeIds = new Set(before.inventory.map(e => e.id));
    const newItems = after.inventory.filter(e => !beforeIds.has(e.id));

    const leveledUp = after.status.level > before.status.level;

    const xpGained = leveledUp
        ? (before.status.xpForNextLevel - before.status.xp) + after.status.xp
        : after.status.xp - before.status.xp;

    return {
        newItems,
        goldDelta: after.status.gold - before.status.gold,
        xpGained,
        leveledUp,
        newLevel: after.status.level,
    };
}

export function diffDefeat(before: PlayerData, after: PlayerData): number {
    const goldDelta = after.status.gold - before.status.gold;
    return goldDelta
}