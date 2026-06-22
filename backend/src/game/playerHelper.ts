export function canLevelUp(currentXp: number, currentLevel: number): boolean {
    return currentXp >= getXpForLevelUp(currentLevel)
}

export function getXpForLevelUp (level: number): number {
    return 10 * (level * level) + 100 * level
}