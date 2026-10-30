import { Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<AdminPage />} path="/admin" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
