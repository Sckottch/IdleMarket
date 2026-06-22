// Seam das ações de equipamento. Fase 4: sem backend, resolvem na hora e o
// PlayerContext muta o cache. Fase 5: viram chamadas REST reais — a assinatura
// (async, recebe id) não muda.

export async function equipItem(id: string): Promise<void> {
  // TODO Fase 5: await api.post("/inventory/equip", { id })  (rota já existe)
  void id;
}

export async function unequipItem(id: string): Promise<void> {
  // TODO Fase 5: await api.post("/inventory/unequip", { id })  (rota já existe)
  void id;
}

export async function deleteEquipment(id: string): Promise<void> {
  // TODO Fase 5: precisa de uma ROTA NOVA no backend (ex.: DELETE /inventory/:id).
  // Hoje o backend só tem POST /equip e /unequip — deletar ainda não existe lá.
  void id;
}
