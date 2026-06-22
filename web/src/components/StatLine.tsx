import type { StatType } from "../types/equipment";
import { statIcon, formatStat } from "../lib/equipmentVisuals";

function StatLine({ statType, value }: { statType: StatType; value: number }) {
  return (
    <div className="flex items-center gap-1 bg-slate-900/50 rounded-md p-1">
      <img src={statIcon[statType]} alt={statType} className="w-4 h-4 object-contain" />
      <span>{formatStat(statType, value)}</span>
    </div>
  );
}

export default StatLine;
