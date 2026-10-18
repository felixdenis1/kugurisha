import { BrowserRouter, Routes, Route } from "react-router-dom"

import { ThemeProvider } from "./components/ThemeProvider"
import MainLayout from "./layouts/MainLayout"

import Home from "./pages/Home"
import Categories from "./pages/Categories"
import About from "./pages/About"
import HowItWorks from "./pages/HowItWorks"

import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Profile from "./pages/Profile"
import CreateListing from "./pages/CreateListing"
import AdminCategories from "./pages/AdminCategories"
import SellerDashboard from "./pages/SellerDashboard"
import EditListing from "./pages/EditListing"
import ListingDetails from "./pages/ListingDetails"
import Favorites from "./pages/Favorites"
import Notifications from "./pages/Notifications"
import Messages from "./pages/Messages"
import MessagesInbox from "./pages/MessagesInbox"
import AISearch from "./pages/AISearch"
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminListings from "./pages/AdminListings"
import AdminReports from "./pages/AdminReports"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Home retains its existing full-featured header and behavior. */}
          <Route path="/" element={<Home />} />

          {/* Shared layout for the new standalone information pages. */}
          <Route element={<MainLayout />}>
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Listings */}
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/listing/:id" element={<ListingDetails />} />

          {/* Messages */}
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/messages" element={<MessagesInbox />} />

          {/* AI search */}
          <Route path="/ai-search" element={<AISearch />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
