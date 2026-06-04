using UnityEngine;

public class MockInventoryService
{
    private readonly PlayerData playerData;

    public MockInventoryService(PlayerData playerData)
    {
        this.playerData = playerData;
    }

    public void Unequip(string itemId)
    {
        Equipment item = playerData.equipments.Find(e => e.id == itemId);

        if (item == null)
        {
            Debug.LogWarning($"Unequip: item {itemId} não encontrado.");
            return;
        }

        item.isEquipped = false;
    }

    public void Equip(string itemId)
    {
        Equipment item = playerData.equipments.Find(e => e.id == itemId);

        if (item == null)
        {
            Debug.LogWarning($"Equip: item {itemId} não encontrado.");
            return;
        }

        Equipment currentlyEquipped = playerData.equipments.Find(e => e.equipmentType == item.equipmentType && e.isEquipped);

        if (currentlyEquipped != null)
        {
            currentlyEquipped.isEquipped = false;
        }

        item.isEquipped = true;
    }
}
