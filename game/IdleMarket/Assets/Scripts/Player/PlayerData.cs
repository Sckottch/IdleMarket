using System.Collections.Generic;

[System.Serializable]
public class PlayerData
{
    public string id;
    public string username;
    public int gold;

    public int level;
    public int xp;

    public List<Equipment> equipments;
}
