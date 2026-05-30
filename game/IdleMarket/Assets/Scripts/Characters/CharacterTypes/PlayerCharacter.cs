using System.Collections.Generic;
using UnityEngine;

public class PlayerCharacter : Character
{
    public PlayerData Data {  get; private set; }

    public void Initialize(PlayerData data)
    {
        Data = data;
        List<Equipment> equippedEquipments = new();

        equippedEquipments = data.equipments.FindAll(e => e.isEquipped);

        InitializeStats(data.level, equippedEquipments);
    }
}
