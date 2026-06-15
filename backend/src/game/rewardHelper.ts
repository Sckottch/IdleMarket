import { weightedRandomIndex } from "./randomHelper.js";

export function getBossRarity(enemyLevel: number): number {
    switch (true) {
        case enemyLevel <= 4: return 2;
        case enemyLevel <= 14: return 3;
        case enemyLevel <= 24: return 4;
        default: return 5;
    }
}

export function getCommonRarity(enemyLevel: number): number {
    const weights = getRarityWeights(enemyLevel)
    return weightedRandomIndex(weights) + 1;
}

function getRarityWeights(enemyLevel: number): number[] {
    switch (true) {
        case enemyLevel <= 4: return [75, 25, 0, 0, 0];
        case enemyLevel <= 14: return [10, 60, 30, 0, 0];
        case enemyLevel <= 24: return [0, 10, 60, 30, 0];
        case enemyLevel <= 34: return [0, 0, 10, 60, 30];
        case enemyLevel <= 44: return [0, 0, 0, 25, 75];
        default: return [0, 0, 0, 0, 100];
    }
}