import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useGoldFx } from "../context/GoldFxContext";
import { useFloatingNumber } from "../hooks/useFloatingNumber";
import type { Equipment, EquipmentType, StatType } from "../types/equipment";
import { computeCharacterStats } from "../lib/characterStats";
import { sortByTypeOrder, EQUIPMENT_TYPE_ORDER } from "../lib/inventory";
import { statIcon } from "../lib/equipmentVisuals";
import ItemCard from "../components/ItemCard";
import DropCard from "../components/DropCard";
import EmptySlot from "../components/EmptySlot";
import EquipmentManager from "../components/EquipmentManager";
import Toast from "../components/Toast";
import FloatingNumber from "../components/FloatingNumber";
import { useToast } from "../hooks/useToast";
import { Unity, useUnityContext } from "react-unity-webgl";
import { getToken } from "../data/api";

const STAT_LABELS: Record<StatType, string> = {
  Health: "Vida", Attack: "Ataque", Defense: "Defesa",
  Speed: "Velocidade", CriticalChance: "Chance Crítica", CriticalDamage: "Dano Crítico",
};

const STAT_ORDER: StatType[] = ["Health", "Attack", "Defense", "Speed", "CriticalChance", "CriticalDamage"];

const MAX_DROPS = 10;

// 16rem = o cromo vertical (topo, barra de equipados, paddings) mais uma folga,
// descontado da altura antes de aplicar o 16/9 do jogo.
const GAME_WIDTH = "w-[min(65vw,calc((100dvh_-_16rem)*16/9))]";

const BAR_MIN_WIDTH = "min-w-[min(65vw,calc((100dvh_-_16rem)*16/9))]";

function formatStatValue(stat: StatType, value: number): string {
  if (stat === "CriticalChance" || stat === "CriticalDamage") return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
}

function UnityGame() {
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "/unity/IdleMarket_1.2webgl.loader.js",
    dataUrl: "/unity/IdleMarket_1.2webgl.data",
    frameworkUrl: "/unity/IdleMarket_1.2webgl.framework.js",
    codeUrl: "/unity/IdleMarket_1.2webgl.wasm",
  })
  const tokenSentRef = useRef(false);

  useEffect(() => {
    function trySendToken() {
      if (tokenSentRef.current || !isLoaded) return;
      const token = getToken();
      if (!token) return;
      sendMessage("ReactBridge", "ReceiveToken", token);
      tokenSentRef.current = true;
    }

    trySendToken();
    window.addEventListener("unity:ready", trySendToken);
    return () => window.removeEventListener("unity:ready", trySendToken);
  }, [isLoaded, sendMessage])

  return (
    <div className="w-full h-full">
      {!isLoaded && <p>Carregando o jogo...</p>}

      <Unity unityProvider={unityProvider}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

function Game() {
  const { status, inventory, loading, refreshVictory, refreshDefeat } = usePlayer();
  const [managerType, setManagerType] = useState<EquipmentType | null>(null);
  const { toast, showToast } = useToast();
  const { showGold } = useGoldFx();
  const { value: xpFx, trigger: triggerXp } = useFloatingNumber();
  const [drops, setDrops] = useState<Equipment[]>([]);

  const handlersRef = useRef({ refreshVictory, refreshDefeat, showGold, triggerXp });
  useEffect(() => {
    handlersRef.current = { refreshVictory, refreshDefeat, showGold, triggerXp };
  });

  useEffect(() => {
    async function handleVictory() {
      const { refreshVictory, triggerXp, showGold } = handlersRef.current;
      const rewards = await refreshVictory();
      if (rewards.xpGained > 0) triggerXp(rewards.xpGained);
      if (rewards.goldDelta > 0) showGold(rewards.goldDelta);
      if (rewards.newItems.length > 0) {
        setDrops((prev) => [...rewards.newItems, ...prev].slice(0, MAX_DROPS));
      }
    }
    async function handleDefeat() {
      const { refreshDefeat, showGold } = handlersRef.current;
      const goldDelta = await refreshDefeat();
      if (goldDelta < 0) showGold(goldDelta);
    }
    window.addEventListener("unity:victory", handleVictory);
    window.addEventListener("unity:defeat", handleDefeat);
    return () => {
      window.removeEventListener("unity:victory", handleVictory);
      window.removeEventListener("unity:defeat", handleDefeat);
    };
  }, []);

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

        <div className="relative">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-fuchsia-600" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-slate-400">{status.xp}/{status.xpForNextLevel}</p>
          <FloatingNumber value={xpFx} className="right-0 top-full mt-0.5" />
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
            {drops.map((drop) => (
              <DropCard key={drop.id} equipment={drop} />
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-1 flex flex-col items-center gap-1">
        <div className={`${GAME_WIDTH} shrink-0 aspect-video flex items-center justify-center overflow-hidden rounded-lg ring-2 ring-inset ring-slate-700 bg-slate-900`}>
          <UnityGame/>
        </div>

        <div className={`${BAR_MIN_WIDTH} w-fit shrink-0 rounded-lg border border-slate-700 bg-slate-900 p-2 flex items-center justify-center gap-1`}>
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
      </div>

      {managerType && (
        <EquipmentManager initialType={managerType} onClose={() => setManagerType(null)} onError={showToast} />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default Game;