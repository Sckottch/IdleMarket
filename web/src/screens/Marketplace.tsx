import { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import type { Equipment } from "../types/equipment";
import { getListings } from "../data/marketService";
import { sortInventory } from "../lib/inventory";
import { emptyFilters, filterEquipment, type Filters } from "../lib/equipmentFilters";
import EquipmentFilters from "../components/EquipmentFilters";
import ItemCard from "../components/ItemCard";

type Tab = "buy" | "sell";

function Marketplace() {
  const { status } = usePlayer();
  const [tab, setTab] = useState<Tab>("buy");

  if (!status) return <div className="h-full bg-slate-950 p-8 text-slate-100">Carregando...</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex gap-2 border-b border-slate-700 p-4">
        {(["buy", "sell"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-bold transition ${
              tab === t ? "bg-fuchsia-700 text-slate-100" : "bg-slate-800 text-slate-300 hover:text-slate-100"
            }`}>
            {t === "buy" ? "Comprar" : "Vender"}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "buy" ? <BuyTab /> : <SellTab />}
      </div>
    </div>
  );
}

function BuyTab() {
  const { status, buyItem, refresh } = usePlayer();
  const gold = status?.gold ?? 0;

  const [listings, setListings] = useState<Equipment[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [pending, setPending] = useState<Equipment | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);

  useEffect(() => { getListings().then(setListings); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast({ id: Date.now(), msg });

  const filtered = sortInventory(filterEquipment(listings, filters));

  async function handleBuyClick(item: Equipment) {
    const price = item.salePrice ?? 0;
    if (gold < price) {
      const data = await refresh();
      if (data.status.gold < price) { showToast("Ouro insuficiente."); return; }
    }
    setPending(item);
  }

  async function confirmBuy() {
    if (!pending) return;
    const item = pending;
    if (!listings.some((l) => l.id === item.id)) {
      showToast("Item não está mais disponível.");
      setPending(null);
      return;
    }
    await buyItem(item);
    setListings((prev) => prev.filter((l) => l.id !== item.id));
    setPending(null);
  }

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-slate-700 bg-slate-800 p-2">
        <EquipmentFilters value={filters} onChange={setFilters} showRating showRarity showPrice />
      </aside>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="grid grid-cols-[repeat(auto-fit,20rem)] justify-center gap-4">
          {filtered.map((item) => {
            const price = item.salePrice ?? 0;
            const canAfford = gold >= price;
            return (
              <div key={item.id} className="flex flex-col gap-2">
                <ItemCard equipment={item} size="lg" />
                <div className="flex items-center justify-between">
                  <span className={canAfford ? "text-slate-100" : "text-red-400"}>{price} ouro</span>
                  <button onClick={() => handleBuyClick(item)}
                    className="rounded-md bg-fuchsia-700 px-3 py-1 text-sm hover:bg-fuchsia-600 transition">
                    Comprar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="toast-pop fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-md border border-red-500/60 bg-slate-900 px-4 py-2 text-sm text-red-300 shadow-lg">
          {toast.msg}
        </div>
      )}

      {pending && (
        <ConfirmDialog
          message={`Comprar ${pending.equipmentType} por ${pending.salePrice} de ouro?`}
          onConfirm={confirmBuy}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

function SellTab() {
  const { inventory, sellItem, unlistItem } = usePlayer();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sellTarget, setSellTarget] = useState<Equipment | null>(null);

  const active = sortInventory(filterEquipment(inventory.filter((i) => i.isForSale), filters));
  const sellable = sortInventory(filterEquipment(inventory.filter((i) => !i.isEquipped && !i.isForSale), filters));

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-slate-700 bg-slate-800 p-2">
        <EquipmentFilters value={filters} onChange={setFilters} showRating showRarity />
      </aside>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-lg font-bold text-fuchsia-400">Anúncios ativos</h2>
          {active.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum anúncio ativo.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,20rem)] justify-center gap-4">
              {active.map((item) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <ItemCard equipment={item} size="lg" />
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400">{item.salePrice} ouro</span>
                    <button onClick={() => unlistItem(item.id)}
                      className="rounded-md bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-fuchsia-400">Itens disponíveis pra anunciar</h2>
          {sellable.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum item disponível pra anunciar.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,20rem)] justify-center gap-4">
              {sellable.map((item) => (
                <ItemCard key={item.id} equipment={item} size="lg" onClick={() => setSellTarget(item)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {sellTarget && (
        <SellForm
          item={sellTarget}
          onConfirm={(price) => { sellItem(sellTarget.id, price); setSellTarget(null); }}
          onCancel={() => setSellTarget(null)}
        />
      )}
    </div>
  );
}

function SellForm({ item, onConfirm, onCancel }: {
  item: Equipment; onConfirm: (price: number) => void; onCancel: () => void;
}) {
  const [price, setPrice] = useState("");
  const value = Number(price);
  const valid = price !== "" && value > 0;
  return (
    <div onClick={onCancel} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border-2 border-slate-700 bg-slate-900 p-5 text-slate-100 flex flex-col gap-4">
        <h3 className="font-bold text-fuchsia-400">Anunciar {item.equipmentType}</h3>
        <input type="number" autoFocus placeholder="Preço em ouro" value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-400" />
        <div className="flex gap-2">
          <button disabled={!valid} onClick={() => onConfirm(value)}
            className="flex-1 rounded-md bg-fuchsia-700 py-2 text-sm font-bold hover:bg-fuchsia-600 disabled:opacity-40 transition">
            Confirmar Venda
          </button>
          <button onClick={onCancel} className="flex-1 rounded-md bg-slate-700 py-2 text-sm hover:bg-slate-600 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div onClick={onCancel} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border-2 border-slate-700 bg-slate-900 p-5 text-slate-100 flex flex-col gap-4">
        <p className="text-sm">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 rounded-md bg-fuchsia-700 py-2 text-sm font-bold hover:bg-fuchsia-600 transition">Confirmar</button>
          <button onClick={onCancel} className="flex-1 rounded-md bg-slate-700 py-2 text-sm hover:bg-slate-600 transition">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;