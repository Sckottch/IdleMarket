import ItemCard from "../components/ItemCard";
import type { Equipment, EquipmentType } from "../types/equipment";

const type: Record<number, EquipmentType> = {
    1: "Sword",
    2: "Armor",
    3: "Boots",
    4: "Helmet",
    5: "Sword",
}

const samples: Equipment[] = [1, 2, 3, 4, 5].map((r) => ({
    id: `sample-${r}`,
    equipmentType: type[r],
    rarity: r,
    mainStat: "Attack",
    mainStatValue: 10 * r,
    rating: 20 * r,
    subStats: [
        { id: `${r}-a`, statType: "Health", statValue: 20.1 },
        { id: `${r}-b`, statType: "Defense", statValue: 15.3 },
        { id: `${r}-c`, statType: "Speed", statValue: 8 },          // sem %
        { id: `${r}-d`, statType: "CriticalDamage", statValue: 7.7 },
    ],
    isEquipped: false,
    isForSale: false,
    salePrice: null,
}));

function Sandbox() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 space-y-8">
        <div className="flex gap-4 items-end">
            {samples.map((eq) => (
            <ItemCard key={eq.id} equipment={eq} size="lg" />
            ))}
        </div>

        <div className="flex gap-4 items-end">
            {samples.map((eq) => (
            <ItemCard key={eq.id} equipment={eq} size="md" />
            ))}
        </div>
    </div>
  );
}

export default Sandbox;