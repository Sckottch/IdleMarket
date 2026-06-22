import type { EquipmentType, StatType } from "../types/equipment";

import HelmetIcon from "../assets/icons/equipmet/helmet.png";
import ArmorIcon from "../assets/icons/equipmet/armor.png";
import BootsIcon from "../assets/icons/equipmet/boots.png";
import SwordIcon from "../assets/icons/equipmet/sword.png";
import AttackIcon from "../assets/icons/stats/attack.svg";
import HealthIcon from "../assets/icons/stats/health.svg";
import DefenseIcon from "../assets/icons/stats/defense.svg";
import SpeedIcon from "../assets/icons/stats/speed.svg";
import CriticalChanceIcon from "../assets/icons/stats/critical-chance.svg";
import CriticalDamageIcon from "../assets/icons/stats/critical-damage.svg";

export const typeIcon: Record<EquipmentType, string> = {
  Helmet: HelmetIcon,
  Armor: ArmorIcon,
  Boots: BootsIcon,
  Sword: SwordIcon,
};

export const statIcon: Record<StatType, string> = {
  Attack: AttackIcon,
  Health: HealthIcon,
  Defense: DefenseIcon,
  Speed: SpeedIcon,
  CriticalChance: CriticalChanceIcon,
  CriticalDamage: CriticalDamageIcon,
};

export const rarityBorder: Record<number, string> = {
  1: "border-slate-400",
  2: "border-green-400",
  3: "border-blue-400",
  4: "border-violet-400",
  5: "border-amber-400",
};

export const rarityBackground: Record<number, string> = {
  1: "bg-[var(--rarity-1-bg)]",
  2: "bg-[var(--rarity-2-bg)]",
  3: "bg-[var(--rarity-3-bg)]",
  4: "bg-[var(--rarity-4-bg)]",
  5: "bg-[var(--rarity-5-bg)]",
};

export function formatStat(statType: StatType, value: number): string {
  return statType === "Speed" ? `${value}` : `${value}%`;
}
