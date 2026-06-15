export function weightedRandomIndex(weights: number[]): number {
    let total = 0
    for (const w of weights) { total += w }

    const roll = rangeFloat(0, total)

    let cumulative = 0
    let lastPositive = 0

    for (let i = 0; i < weights.length; i++) {
        if (weights[i]! <= 0) continue

        lastPositive = i
        cumulative += weights[i]!

        if (roll < cumulative) return i
    }

    return lastPositive
}

export function rangeInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min)) + min
}

export function rangeFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min
}