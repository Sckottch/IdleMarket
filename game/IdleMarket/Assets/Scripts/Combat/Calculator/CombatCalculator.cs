using UnityEngine;

public static class CombatCalculator
{
    public static DamageResult CalculateDamage(CharacterStats attacker, CharacterStats defender)
    {
        float normalDamage = CalculateNormalDamage(attacker, defender);

        bool isCritical = Random.value < attacker.criticalChance / 100f;
        float finalDamage = isCritical 
            ? ApplyCriticalDamage(normalDamage, attacker.criticalDamage) 
            : normalDamage;

        return new DamageResult(finalDamage, isCritical);
    }

    public static float CalculateNormalDamage(CharacterStats attacker, CharacterStats defender)
    {
        float damage = attacker.attack * (100f / (100f + defender.defense));
        return Mathf.Max(damage, 1f);
    }

    public static float ApplyCriticalDamage(float normalDamage, float criticalDamagePercent)
    {
        return normalDamage * (1f + criticalDamagePercent / 100f);
    }
}

public readonly struct DamageResult
{
    public float Damage { get; }
    public bool IsCritical { get; }
    public DamageResult(float damage, bool isCritical)
    {
        Damage = damage;
        IsCritical = isCritical;
    }
}