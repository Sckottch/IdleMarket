import { useState } from "react";
import { Link } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import type { Equipment, EquipmentType, StatType } from "../types/equipment";
import { computeCharacterStats } from "../lib/characterStats";
import { sortByTypeOrder, EQUIPMENT_TYPE_ORDER } from "../lib/inventory";
import { statIcon } from "../lib/equipmentVisuals";
import ItemCard from "../components/ItemCard";
import DropCard from "../components/DropCard";
import EmptySlot from "../components/EmptySlot";
import EquipmentManager from "../components/EquipmentManager";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const STAT_LABELS: Record<StatType, string> = {
  Health: "Vida", Attack: "Ataque", Defense: "Defesa",
  Speed: "Velocidade", CriticalChance: "Chance Crítica", CriticalDamage: "Dano Crítico",
};

const STAT_ORDER: StatType[] = ["Health", "Attack", "Defense", "Speed", "CriticalChance", "CriticalDamage"];

const MAX_DROPS = 10;

function formatStatValue(stat: StatType, value: number): string {
  if (stat === "CriticalChance" || stat === "CriticalDamage") return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
}

// Fase 4: sem combate, o feed de drops é mockado só pro layout.
// Fase 5: substituir pelos drops reais vindos do resultado de /victory.
const FIXTURE_DROPS: Equipment[] = [
  { id: "drop-1", equipmentType: "Sword", rarity: 4, mainStat: "Attack", mainStatValue: 32, rating: 78,
    subStats: [], isEquipped: false, isForSale: false, salePrice: null },
  { id: "drop-2", equipmentType: "Helmet", rarity: 2, mainStat: "Health", mainStatValue: 14, rating: 41,
    subStats: [], isEquipped: false, isForSale: false, salePrice: null },
];

function Game() {
  const { status, inventory, loading } = usePlayer();
  const [managerType, setManagerType] = useState<EquipmentType | null>(null);
  const { toast, showToast } = useToast();

  if (loading || !status) {
    return <div className="h-full bg-slate-950 p-8 text-slate-100">Carregando...</div>;
  }

  const equipped = sortByTypeOrder(inventory.filter((i) => i.isEquipped));
  const stats = computeCharacterStats(status.level, equipped);
  const xpPercent = Math.min(100, (status.xp / status.xpForNextLevel) * 100);

  return (
    <div className="h-full flex overflow-hidden bg-slate-950 text-slate-100">

      <aside className="w-80 shrink-0 overflow-hidden border-r border-slate-700 bg-slate-900 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Nível</span>
          <span className="text-lg font-bold text-fuchsia-400">{status.level}</span>
        </div>

        <div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-fuchsia-600" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-slate-400">{status.xp}/{status.xpForNextLevel}</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-300">Atributos</h3>
          <div className="flex flex-col gap-1">
            {STAT_ORDER.map((stat) => (
              <div key={stat} className="flex items-center justify-between rounded-md bg-slate-800/60 px-2 py-1 text-sm">
                <span className="flex items-center gap-2">
                  <img src={statIcon[stat]} alt={stat} className="h-4 w-4 object-contain" />
                  {STAT_LABELS[stat]}
                </span>
                <span className="font-semibold">{formatStatValue(stat, stats[stat])}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-300">Drops</h3>
          <div className="flex flex-col gap-2">
            {FIXTURE_DROPS.slice(-MAX_DROPS).map((drop) => (
              <DropCard key={drop.id} equipment={drop} />
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-4">
        {/* Fase 5: aqui entra o canvas Unity (WebGL) real, escalando por múltiplo
            inteiro de 640×360 para ficar pixel-perfect. */}
        <div className="w-[65vw] aspect-video flex items-center justify-center rounded-lg border-2 border-slate-700 bg-slate-900">
          <span className="text-slate-500">Jogo (WebGL)</span>
        </div>

        <div className="w-[65vw] rounded-lg border border-slate-700 bg-slate-900 p-4 flex items-center gap-4">
          <div className="flex flex-wrap gap-3">
            {EQUIPMENT_TYPE_ORDER.map((type) => {
              const item = equipped.find((eq) => eq.equipmentType === type);
              return item ? (
                <ItemCard key={type} equipment={item} size="md" onClick={() => setManagerType(type)} />
              ) : (
                <div key={type} onClick={() => setManagerType(type)} className="cursor-pointer">
                  <EmptySlot type={type} />
                </div>
              );
            })}
          </div>
          <Link
            to="/dashboard"
            className="ml-auto shrink-0 rounded-md bg-fuchsia-700 px-4 py-2 text-sm font-bold hover:bg-fuchsia-600 transition"
          >
            Gerenciar
          </Link>
        </div>
      </div>

      {managerType && (
        <EquipmentManager initialType={managerType} onClose={() => setManagerType(null)} onError={showToast} />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Game;