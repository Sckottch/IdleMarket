import { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import type { EquipmentType } from "../types/equipment";
import { sortInventory, EQUIPMENT_TYPE_ORDER } from "../lib/inventory";
import ItemCard from "./ItemCard";
import EmptySlot from "./EmptySlot";

const TYPES: EquipmentType[] = EQUIPMENT_TYPE_ORDER;

function EquipmentManager({ initialType, onClose }: { initialType: EquipmentType; onClose: () => void }) {
  const { inventory, equip, unequip } = usePlayer();
  const [selectedType, setSelectedType] = useState<EquipmentType>(initialType);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const equippedOf = (type: EquipmentType) =>
    inventory.find((i) => i.isEquipped && i.equipmentType === type) ?? null;

  const available = sortInventory(
    inventory.filter((i) => !i.isEquipped && i.equipmentType === selectedType),
  );

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-280 h-160 max-w-[95vw] max-h-[90vh] rounded-xl border-2 border-slate-700 bg-slate-900 text-slate-100 shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700 p-4">
          <h2 className="text-lg font-bold text-fuchsia-400">Gerenciar equipamentos</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg px-2">✕</button>
        </div>

        <div className="flex shrink-0 justify-center gap-3 border-b border-slate-700 p-4">
          {TYPES.map((type) => {
            const item = equippedOf(type);
            const selected = selectedType === type;
            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className={`relative cursor-pointer rounded-lg ${selected ? "ring-2 ring-fuchsia-500" : ""}`}
              >
                {item ? (
                  <>
                    <ItemCard equipment={item} size="md" />
                    <button
                      onClick={(e) => { e.stopPropagation(); unequip(item.id); }}
                      className="absolute top-1 right-1 rounded-md bg-slate-900/80 px-2 text-slate-300 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <EmptySlot type={type} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {available.length === 0 ? (
            <p className="text-center text-sm text-slate-500">Nenhum item de {selectedType} disponível no inventário.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {available.map((item) => (
                <ItemCard key={item.id} equipment={item} size="md" onClick={() => equip(item.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EquipmentManager;