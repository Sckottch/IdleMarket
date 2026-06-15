import { EquipmentType, StatType } from "../../generated/prisma/enums.js"
import { rangeFloat } from "./randomHelper.js"

export class StatRange {
    constructor(public min: number, public max: number) {}

    roll(): number {
        const value = rangeFloat(this.min, this.max)
        return Math.round(value * 10) / 10
    }

    normalize(value: number): number {
        const t = (value - this.min) / (this.max - this.min)
        return Math.min(1, Math.max(0, t))
    }
}

export function getMainStat(type: EquipmentType): StatType {
    switch (type){
        case EquipmentType.Sword: return StatType.Attack;
        case EquipmentType.Armor: return StatType.Defense;
        case EquipmentType.Helmet: return StatType.Health;
        case EquipmentType.Boots: return StatType.Speed;
        default: throw new Error(`tipo de equipamento inválida: ${type}`)
    }
}

export function getMainStatRange(rarity: number): StatRange {
    switch (rarity) {
        case 1: return new StatRange(5, 10);
        case 2: return new StatRange(10, 20);
        case 3: return new StatRange(20, 30);
        case 4: return new StatRange(30, 40);
        case 5: return new StatRange(40, 50);
        default: throw new Error(`Raridade inválida: ${rarity}`);
    }
}

export function getSubStatRange(statType: StatType): StatRange {
  switch (statType) {
    case StatType.Health:
    case StatType.Attack:
    case StatType.Defense:
      return new StatRange(10, 20);
    case StatType.CriticalChance:
      return new StatRange(5, 15);
    case StatType.CriticalDamage:
      return new StatRange(10, 30);
    default:
      throw new Error(`Tipo de status inválido: ${statType}`);
  }
}