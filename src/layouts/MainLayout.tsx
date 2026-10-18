
import { Outlet } from "react-router-dom"
import Header from "../components/Header"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="min-h-[calc(100vh-76px)]">
        <Outlet />
      </main>
    </div>
  )
}
