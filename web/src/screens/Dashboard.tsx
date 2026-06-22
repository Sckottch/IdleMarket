import { usePlayer } from "../context/PlayerContext";
import ItemCard from "../components/ItemCard";
import ItemModal from "../components/ItemModal";
import EquipmentFilters from "../components/EquipmentFilters";
import { useState } from "react";
import UserIcon from "../assets/icons/userIcons/userIcon.png";
import { sortInventory } from "../lib/inventory";
import { emptyFilters, filterEquipment, type Filters } from "../lib/equipmentFilters";

function Dashboard() {
  const { status, inventory, loading, equip, unequip, deleteItem } = usePlayer();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = inventory.find((i) => i.id === selectedId) ?? null;

  const [filters, setFilters] = useState<Filters>(emptyFilters);

  if (loading || !status) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 p-8">Carregando...</div>;
  }

  return (
    <div className="h-full overflow-hidden bg-slate-950 text-slate-100 flex">

      <aside className="w-80 shrink-0 border-r border-slate-400 bg-slate-900 p-4 flex flex-col justify-center items-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 overflow-hidden">
          <img
            src={UserIcon}
            alt="Perfil"
            className="h-20 w-20 scale-150 object-contain [image-rendering:pixelated]"
          />
        </span>
        <h2 className="text-fuchsia-400 font-bold text-lg my-4">{status.username}</h2>
        <p>Nível {status.level}</p>
        <p> {status.xp}/{status.xpForNextLevel}</p>
        <p>Ouro: {status.gold}</p>

        <div className="mt-auto flex flex-col-reverse gap-4">
          {inventory.filter(i => i.isEquipped).map((eq) => (
            <ItemCard key={eq.id} equipment={eq} size="md" onClick={() => setSelectedId(eq.id)} />
          ))}
        </div>
        
      </aside>

      <div className="w-56 shrink-0 overflow-y-auto border-r border-slate-400 bg-slate-800 p-2">
        <EquipmentFilters value={filters} onChange={setFilters} showRating showRarity />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="flex flex-wrap gap-4">
          {sortInventory(filterEquipment(inventory.filter((i) => !i.isForSale), filters)).map((eq) => (
            <ItemCard key={eq.id} equipment={eq} size="lg" onClick={() => setSelectedId(eq.id)} />
          ))}
        </div>
      </main>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onEquip={equip}
          onUnequip={unequip}
          onDelete={(id) => { deleteItem(id); setSelectedId(null); }}
        />
      )}

    </div>
  );
}

export default Dashboard;