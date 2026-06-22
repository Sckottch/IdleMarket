import { useEffect, useState } from "react";
import type { Equipment } from "../types/equipment";
import { typeIcon, rarityBorder } from "../lib/equipmentVisuals";
import StatLine from "./StatLine";

type ItemModalProps = {
  item: Equipment;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onDelete: (id: string) => void;
};

function ItemModal({ item, onClose, onEquip, onUnequip, onDelete }: ItemModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-xl border-2 ${rarityBorder[item.rarity]} bg-slate-900 text-slate-100 shadow-xl`}
      >
        <div className="flex items-start justify-between border-b border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <img
              src={typeIcon[item.equipmentType]}
              alt={item.equipmentType}
              className="w-14 h-14 object-contain [image-rendering:pixelated]"
            />
            <div>
              <p className="font-bold">{item.equipmentType}</p>
              <p className="text-amber-400 leading-none">{"★".repeat(item.rarity)}</p>
              <p className="text-xs text-slate-400">
                Rating <span className="text-amber-400 font-bold">{item.rating}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg px-2">
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Status principal</p>
            <StatLine statType={item.mainStat} value={item.mainStatValue} />
          </div>

          {item.subStats.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Sub-status</p>
              <div className="flex flex-col gap-2">
                {item.subStats.map((sub) => (
                  <StatLine key={sub.id} statType={sub.statType} value={sub.statValue} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 p-4 flex flex-col gap-2">
          {item.isEquipped ? (
            <button
              onClick={() => onUnequip(item.id)}
              className="w-full rounded-md bg-slate-700 hover:bg-slate-600 py-2 text-sm font-bold transition"
            >
              Desequipar
            </button>
          ) : (
            <button
              onClick={() => onEquip(item.id)}
              className="w-full rounded-md bg-fuchsia-700 hover:bg-fuchsia-600 py-2 text-sm font-bold transition"
            >
              Equipar
            </button>
          )}

          {confirmingDelete ? (
            <div className="flex flex-col gap-2 rounded-md border border-red-800 bg-red-950/40 p-2">
              <p className="text-xs text-red-300">Deletar este item permanentemente?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex-1 rounded-md bg-red-700 hover:bg-red-600 py-2 text-sm font-bold transition"
                >
                  Sim, deletar
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-md bg-slate-700 hover:bg-slate-600 py-2 text-sm transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="w-full rounded-md border border-red-800 py-2 text-sm text-red-400 hover:bg-red-950/40 transition"
            >
              Deletar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
