using UnityEngine;

[CreateAssetMenu(fileName = "CharacterBase", menuName = "Characters/Character Base")]
public class CharacterBaseSO : ScriptableObject
{
    [Header("Satus que escalam por nível")]
    public float healthBase;
    public float healthPerLevel;

    public float attackBase;
    public float attackPerLevel;

    public float defenseBase;
    public float defensePerLevel;

    [Space(10)]
    [Header("Status fixos")]
    public float speed;
    public float criticalChance;
    public float criticalDamage;
}
