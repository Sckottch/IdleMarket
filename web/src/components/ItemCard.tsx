import type { Equipment } from "../types/equipment";
import { typeIcon, rarityBorder, rarityBackground } from "../lib/equipmentVisuals";
import StatLine from "./StatLine";

const sizeClasses: Record<string, string> = {
  md: "w-64 h-36 text-xs",
  lg: "w-80 h-45 text-sm",
}

const iconSize: Record<string, string> = {
  md: "w-16 h-16",
  lg: "w-24 h-24",
}

type ItemCardProps = {
  equipment: Equipment;
  size?: "md" | "lg";
  onClick?: () => void;
}

function ItemCard({ equipment, size = "md", onClick }: ItemCardProps) {
  return (
    <div
        onClick={onClick}
        className={`${sizeClasses[size]} ${rarityBorder[equipment.rarity]} ${rarityBackground[equipment.rarity]} border-2 rounded-lg text-slate-100 flex overflow-hidden ${onClick ? "cursor-pointer hover:brightness-110 transition" : ""}`}
    >
        <div className="w-3/5 flex flex-col items-center justify-between p-1 border-r border-slate-600">

            <div className="relative flex-1 w-2/3 flex items-center justify-center bg-slate-900/50 rounded-2xl">
                <span className="absolute top-2 right-2 font-bold text-amber-400">
                    {equipment.rating}
                </span>

                <img
                  src={typeIcon[equipment.equipmentType]}
                  alt={equipment.equipmentType}
                  className={`${iconSize[size]} object-contain [image-rendering:pixelated]`}
                />
            </div>

            <div className="text-amber-400 leading-none p-1">
            {"★".repeat(equipment.rarity)}
            </div>

            <StatLine statType={equipment.mainStat} value={equipment.mainStatValue} />
        </div>

        <div className="w-2/5 flex flex-col justify-center gap-2 p-4">
            {equipment.subStats.map((sub) => (
            <StatLine key={sub.id} statType={sub.statType} value={sub.statValue} />
            ))}
        </div>
    </div>
  );
}

export default ItemCard;
