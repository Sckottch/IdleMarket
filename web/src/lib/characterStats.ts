import type { Equipment, StatType } from "../types/equipment";

// Stats-base do player — espelham PlayerStats.asset (CharacterBaseSO) do jogo Unity.
// O backend não guarda os stats-base; este cálculo é display, não regra cheatável.
const PLAYER_BASE = {
  healthBase: 200, healthPerLevel: 50,
  attackBase: 20, attackPerLevel: 5,
  defenseBase: 10, defensePerLevel: 3,
  speed: 10,
  criticalChance: 15,
  criticalDamage: 50,
};

export function computeCharacterStats(
  level: number,
  equipment: Equipment[],
): Record<StatType, number> {
  const levelIndex = level - 1;

  const base: Record<StatType, number> = {
    Health: PLAYER_BASE.healthBase + PLAYER_BASE.healthPerLevel * levelIndex,
    Attack: PLAYER_BASE.attackBase + PLAYER_BASE.attackPerLevel * levelIndex,
    Defense: PLAYER_BASE.defenseBase + PLAYER_BASE.defensePerLevel * levelIndex,
    Speed: PLAYER_BASE.speed,
    CriticalChance: PLAYER_BASE.criticalChance,
    CriticalDamage: PLAYER_BASE.criticalDamage,
  };

  const bonus: Record<StatType, number> = {
    Health: 0, Attack: 0, Defense: 0, Speed: 0, CriticalChance: 0, CriticalDamage: 0,
  };

  for (const equip of equipment) {
    bonus[equip.mainStat] += equip.mainStatValue;
    for (const sub of equip.subStats) bonus[sub.statType] += sub.statValue;
  }

  return {
    Health: base.Health * (1 + bonus.Health / 100),
    Attack: base.Attack * (1 + bonus.Attack / 100),
    Defense: base.Defense * (1 + bonus.Defense / 100),
    Speed: base.Speed + bonus.Speed,
    CriticalChance: base.CriticalChance + bonus.CriticalChance,
    CriticalDamage: base.CriticalDamage + bonus.CriticalDamage,
  };
}