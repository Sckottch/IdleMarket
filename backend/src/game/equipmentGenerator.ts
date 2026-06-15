import { getMainStat, getMainStatRange, getSubStatRange } from "./equipmentHelper.js"
import { StatType, EquipmentType } from "../../generated/prisma/enums.js"
import { rangeInt } from "./randomHelper.js"

type Equipment = {
    type: EquipmentType, 
    rarity: number, 
    mainStat: StatType, 
    mainStatValue: number, 
    rating: number, 
    subStats: SubStat[]
}

type SubStat = { statType: StatType, statValue: number}

export function generateEquipment(rarity: number): Equipment {
    const type = getRandomEquipmentType()
    
    const mainStat = getMainStat(type)
    const mainStatValue = getMainStatRange(rarity).roll()

    const subStats = getSubStats(rarity)
    const rating = generateRating(mainStatValue, subStats, rarity)

    return {
        type: type,
        rarity: rarity,
        mainStat: mainStat,
        mainStatValue: mainStatValue,
        rating: rating,
        subStats: subStats
    }
}

function getSubStats(rarity: number): SubStat[] {
    const subStats: SubStat[] = []

    const pool = [
        StatType.Health, StatType.Attack, StatType.Defense,
        StatType.CriticalChance, StatType.CriticalDamage
    ]

    const count = rarity - 1

    for (let i = 0; i < count; i++) {
        const index = rangeInt(0, pool.length)

        const type: StatType = pool[index]!
        pool.splice(index, 1)

        const value = getSubStatRange(type).roll()

        subStats.push({ statType: type, statValue: value })
    }

    return subStats
}

function getRandomEquipmentType(): EquipmentType {
    const values = Object.values(EquipmentType)
    const index = rangeInt(0, values.length)

    const type = values[index] as EquipmentType

    return type
}

function generateRating(mainStatValue: number, subStats: SubStat[], rarity: number): number {
  const scores: number[] = [];

  const mainStatRange = getMainStatRange(rarity);
  scores.push(mainStatRange.normalize(mainStatValue) * 100);

  for (const sub of subStats) {
    const subStatRange = getSubStatRange(sub.statType);
    scores.push(subStatRange.normalize(sub.statValue) * 100);
  }

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(average);
}