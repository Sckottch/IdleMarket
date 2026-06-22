import type { EquipmentType } from "../types/equipment";
import { typeIcon } from "../lib/equipmentVisuals";

function EmptySlot({ type }: { type: EquipmentType }) {
  return (
    <div className="w-64 h-36 rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/40 flex flex-col items-center justify-center gap-2 text-slate-500">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
        <img
          src={typeIcon[type]}
          alt={type}
          className="h-10 w-10 object-contain opacity-30 [image-rendering:pixelated]"
        />
      </span>
      <span className="text-xs">{type}</span>
    </div>
  );
}

export default EmptySlot;