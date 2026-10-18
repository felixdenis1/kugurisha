// src/layouts/MainLayout.tsx

import { Outlet } from "react-router-dom"
import Header from "../components/Header"

export default function MainLayout() {
  return (
    <div className="min-h-screen kg-bg kg-text transition-colors duration-200">
      <Header />

      <main className="min-h-[calc(100vh-76px)]">
        <Outlet />
      </main>
    </div>
  )
}