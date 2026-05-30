using System.Collections.Generic;

[System.Serializable]
public class Equipment
{
    public string id;
    public string userId;

    public EquipmentType equipmentType;
    public int rarity;
    public StatType mainStat;
    public float mainStatValue;
    public int rating;

    public List<SubStat> subStats = new();

    public bool isEquipped;
    public bool isForSale;
    public int? salePrice;

    public Equipment(EquipmentType equipmentType, int rarity, StatType mainStat, float mainStatValue, int rating, List<SubStat> subStats)
    {
        this.equipmentType = equipmentType;
        this.rarity = rarity;
        this.mainStat = mainStat;
        this.mainStatValue = mainStatValue;
        this.rating = rating;
        this.subStats = subStats;
    }
}

public class SubStat
{
    public StatType statType;
    public float statValue;

    public SubStat(StatType statType, float statValue)
    {
        this.statType = statType;
        this.statValue = statValue;
    }
}