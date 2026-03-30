import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";
import Listings from "./components/views/Listings";
import ListingDetail from "./components/views/ListingDetail";
import CreateListing from "./components/views/CreateListing";
import EditListing from "./components/views/EditListing";
import SearchResults from "./components/views/SearchResults";
import Terms from "./components/extras/Terms";
import HelpCenter from "./components/extras/HelpCenter";
import Privacy from "./components/extras/Privacy";
import Login from "./components/users/Login";
import Signup from "./components/users/Signup";
import Account from "./components/users/Account";
import ProtectedAdminRoute from "./components/Admin/ProtectedAdminRoute";
import AdminLayout from "./components/Admin/AdminLayout";
import ListingsManagement from "./components/Admin/ListingsManagement";
import UserList from "./components/Admin/UserList";
import ReviewList from "./components/Admin/ReviewList";
import DeleteListingPage from "./components/views/DeleteListingPage";
import Dashboard from "./components/Admin/Dashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import BookingPage from "./components/views/BookingPage";
import BookingConfirmation from "./components/views/BookingConfirmation";
import FrontPageOfCreateListings from "./components/layouts/FrontPageOfCreateListings";
import ConversationsPage from "./components/views/ConversationsPage";
import { Toaster } from "react-hot-toast";
import NotFound from "./components/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <div>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#111827",
            color: "#f9fafb",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#f9fafb" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#f9fafb" } },
        }}
      />
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*"        element={<Navbar />} />
      </Routes>

      <Routes>
        <Route path="/"                      element={<Listings />} />
        <Route path="/listings"              element={<Listings />} />
        <Route path="/listings/:id"          element={<ListingDetail />} />
        <Route path="/listings/new"          element={<CreateListing />} />
        <Route path="/listings/:id/edit"     element={<EditListing />} />
        <Route path="/listings/:id/delete"   element={<DeleteListingPage />} />
        <Route path="/become-host"           element={<FrontPageOfCreateListings />} />
        <Route path="/search-results"        element={<SearchResults />} />
        <Route path="/auth/login"            element={<Login />} />
        <Route path="/auth/signup"           element={<Signup />} />
        <Route path="/profile"               element={<Account />} />
        <Route path="/book/:id"              element={<BookingPage />} />
        <Route path="/booking-confirmation"  element={<BookingConfirmation />} />
        <Route path="/conversations"         element={<ConversationsPage />} />
        <Route path="/terms"                 element={<Terms />} />
        <Route path="/privacy"               element={<Privacy />} />
        <Route path="/help-center"           element={<HelpCenter />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index                element={<Dashboard />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="listings"      element={<ListingsManagement />} />
          <Route path="users"         element={<UserList />} />
          <Route path="reviews"       element={<ReviewList />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*"        element={<Footer />} />
      </Routes>
    </div>
  );
};

export default App;
