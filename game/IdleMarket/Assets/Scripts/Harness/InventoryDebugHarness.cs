using UnityEngine;

public class InventoryDebugHarness : MonoBehaviour
{
    [SerializeField] private string targetItemId;

    private MockInventoryService Inventory => GameManager.Instance.InventoryService;

    [ContextMenu("Desequipar item alvo")]
    private void UnequipTarget() => Inventory.Unequip(targetItemId);

    [ContextMenu("Equipar item alvo")]
    private void EquipTarget() => Inventory.Equip(targetItemId);

    [ContextMenu("Logar inventário")]
    private void LogInventory()
    {
        foreach (Equipment e in GameManager.Instance.PlayerData.equipments)
            Debug.Log($"Harness Debug:{e.id} | {e.equipmentType} {e.rarity}★ | equipado: {e.isEquipped}");
    }
}
