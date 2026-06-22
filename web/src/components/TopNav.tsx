import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router";
import { usePlayer } from "../context/PlayerContext";
import UserIcon from "../assets/icons/userIcons/userIcon.png";
import LogoutIcon from "../assets/icons/ui/logout.svg";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
    isActive ? "bg-fuchsia-700 text-slate-100" : "text-slate-300 hover:text-slate-100"
  }`;

function TopNav() {
  const { status, logout } = usePlayer();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  async function handleLogout() {
    await logout();
    setConfirming(false);
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-3 text-slate-100">
      <span className="text-lg font-bold text-fuchsia-400">IdleMarket</span>

      <nav className="flex items-center gap-2">
        <NavLink to="/game" className={navLinkClass}>Jogo</NavLink>
        <NavLink to="/marketplace" className={navLinkClass}>Mercado</NavLink>
      </nav>

      <div className="flex items-center gap-4">
        <span className="rounded-md bg-slate-100/50 px-3 py-1 text-amber-400">{status?.gold ?? 0} ouro</span>
        <Link to="/dashboard" className="flex items-center gap-2 transition-colors hover:text-fuchsia-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 overflow-hidden">
            <img
              src={UserIcon}
              alt="Perfil"
              className="h-6 w-6 object-contain scale-150 [image-rendering:pixelated]"
            />
          </span>
          <span className="text-sm">{status?.username ?? "—"}</span>
        </Link>

        <button
          onClick={() => setConfirming(true)}
          title="Sair"
          aria-label="Sair"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-red-400"
        >
          <img src={LogoutIcon} alt="" className="h-5 w-5" />
        </button>
      </div>

      {confirming && (
        <div
          onClick={() => setConfirming(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border-2 border-slate-700 bg-slate-900 p-5 text-slate-100 flex flex-col gap-4"
          >
            <p className="text-sm">Deseja sair da sua conta?</p>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 rounded-md bg-red-700 py-2 text-sm font-bold transition hover:bg-red-600"
              >
                Sair
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-md bg-slate-700 py-2 text-sm transition hover:bg-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopNav;
