import type { EquipmentType, StatType } from "../types/equipment";
import type { Filters, SubStatFilter } from "../lib/equipmentFilters";

const ALL_TYPES: EquipmentType[] = ["Helmet", "Armor", "Boots", "Sword"];
const SUBSTAT_OPTIONS: StatType[] = ["Health", "Attack", "Defense", "CriticalChance", "CriticalDamage"];
const RARITIES = [1, 2, 3, 4, 5];

type Props = {
  value: Filters;
  onChange: (filters: Filters) => void;
  showRating?: boolean;
  showRarity?: boolean;
  showPrice?: boolean;
};

function EquipmentFilters({ value, onChange, showRating, showRarity, showPrice }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  function toggleType(type: EquipmentType) {
    set({ types: value.types.includes(type) ? value.types.filter((t) => t !== type) : [...value.types, type] });
  }
  function toggleRarity(r: number) {
    set({ rarities: value.rarities.includes(r) ? value.rarities.filter((x) => x !== r) : [...value.rarities, r] });
  }
  function addSubStat() {
    if (value.subStats.length >= 4) return;
    set({ subStats: [...value.subStats, { id: crypto.randomUUID(), statType: "Health", min: null, max: null }] });
  }
  function removeSubStat(id: string) {
    set({ subStats: value.subStats.filter((s) => s.id !== id) });
  }
  function updateSubStat(id: string, patch: Partial<SubStatFilter>) {
    set({ subStats: value.subStats.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-fuchsia-400">Filtros</h1>

      <div>
        <p className="mb-1 text-sm text-slate-400">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => (
            <button key={type} onClick={() => toggleType(type)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                value.types.includes(type) ? "bg-fuchsia-700 text-slate-100" : "bg-slate-700 text-slate-300"
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {showRarity && (
        <div>
          <p className="mb-1 text-sm text-slate-400">Raridade</p>
          <div className="flex flex-wrap gap-2">
            {RARITIES.map((r) => (
              <button key={r} onClick={() => toggleRarity(r)}
                className={`rounded-md px-2 py-1 text-xs transition-colors ${
                  value.rarities.includes(r) ? "bg-fuchsia-700 text-slate-100" : "bg-slate-700 text-slate-300"
                }`}>
                {r}★
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1 text-sm text-slate-400">Status principal</p>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="mín" value={value.mainStatMin ?? ""}
            className="w-16 rounded bg-slate-900 px-2 py-1 text-sm"
            onChange={(e) => set({ mainStatMin: e.target.value === "" ? null : Number(e.target.value) })} />
          <span className="text-slate-500">–</span>
          <input type="number" placeholder="máx" value={value.mainStatMax ?? ""}
            className="w-16 rounded bg-slate-900 px-2 py-1 text-sm"
            onChange={(e) => set({ mainStatMax: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
      </div>

      {showRating && (
        <div>
          <p className="mb-1 text-sm text-slate-400">Rating mínimo</p>
          <input type="number" placeholder="mín" value={value.ratingMin ?? ""}
            className="w-16 rounded bg-slate-900 px-2 py-1 text-sm"
            onChange={(e) => set({ ratingMin: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
      )}

      {showPrice && (
        <div>
          <p className="mb-1 text-sm text-slate-400">Preço</p>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="mín" value={value.priceMin ?? ""}
              className="w-16 rounded bg-slate-900 px-2 py-1 text-sm"
              onChange={(e) => set({ priceMin: e.target.value === "" ? null : Number(e.target.value) })} />
            <span className="text-slate-500">–</span>
            <input type="number" placeholder="máx" value={value.priceMax ?? ""}
              className="w-16 rounded bg-slate-900 px-2 py-1 text-sm"
              onChange={(e) => set({ priceMax: e.target.value === "" ? null : Number(e.target.value) })} />
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm text-slate-400">Sub-status</p>
          {value.subStats.length < 4 && (
            <button onClick={addSubStat} className="text-xs text-fuchsia-400">+ adicionar</button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {value.subStats.map((sub) => (
            <div key={sub.id} className="flex flex-col gap-1 rounded bg-slate-900/50 p-2">
              <div className="flex items-center gap-1">
                <select value={sub.statType}
                  onChange={(e) => updateSubStat(sub.id, { statType: e.target.value as StatType })}
                  className="flex-1 rounded bg-slate-900 px-1 py-1 text-xs">
                  {SUBSTAT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button onClick={() => removeSubStat(sub.id)} className="px-1 text-xs text-slate-500">✕</button>
              </div>
              <div className="flex items-center gap-1">
                <input type="number" placeholder="mín" value={sub.min ?? ""}
                  className="w-14 rounded bg-slate-900 px-1 py-1 text-xs"
                  onChange={(e) => updateSubStat(sub.id, { min: e.target.value === "" ? null : Number(e.target.value) })} />
                <span className="text-slate-500">–</span>
                <input type="number" placeholder="máx" value={sub.max ?? ""}
                  className="w-14 rounded bg-slate-900 px-1 py-1 text-xs"
                  onChange={(e) => updateSubStat(sub.id, { max: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EquipmentFilters;