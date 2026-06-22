import { Route, Routes, Navigate } from "react-router";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Sandbox from "./screens/Sandbox";
import Dashboard from "./screens/Dashboard";
import Game from "./screens/Game";
import Marketplace from "./screens/Marketplace";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sandbox" element={<Sandbox />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game" element={<Game />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;