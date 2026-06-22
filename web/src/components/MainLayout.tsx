import { Outlet } from "react-router";
import TopNav from "./TopNav";

function MainLayout() {
  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
