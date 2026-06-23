import { Outlet } from "react-router";
import TopNav from "./TopNav";
import { GoldFxProvider } from "../context/GoldFxContext";

function MainLayout() {
  return (
    <GoldFxProvider>
      <div className="flex h-screen flex-col">
        <TopNav />
        <main className="flex-1 min-h-0">
          <Outlet />
        </main>
      </div>
    </GoldFxProvider>
  );
}

export default MainLayout;
