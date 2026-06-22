import type { Equipment } from "../types/equipment";
import { typeIcon, rarityBorder } from "../lib/equipmentVisuals";

function DropCard({ equipment }: { equipment: Equipment }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border ${rarityBorder[equipment.rarity]} bg-slate-900/60 p-2`}>
      <img
        src={typeIcon[equipment.equipmentType]}
        alt={equipment.equipmentType}
        className="h-8 w-8 object-contain [image-rendering:pixelated]"
      />
      <div className="flex flex-col text-xs">
        <span className="text-slate-200">{equipment.equipmentType}</span>
        <span className="text-amber-400">{"★".repeat(equipment.rarity)} · {equipment.rating}</span>
      </div>
    </div>
  );
}

export default DropCard;