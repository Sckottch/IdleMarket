import { del, post } from "./api";

export async function equipItem(id: string): Promise<void> {
  await post<void>("/inventory/equip", { equipmentId: id })
}

export async function unequipItem(id: string): Promise<void> {
  await post<void>("/inventory/unequip", { equipmentId: id })
}

export async function deleteEquipment(id: string): Promise<void> {
  await del<void>(`/inventory/${id}`)
}
