import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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
import Spinner from "./components/views/Spinner";
import ProtectedAdminRoute from './components/Admin/ProtectedAdminRoute';
import AdminLayout from "./components/Admin/AdminLayout";
import ListingsManagement from "./components/Admin/ListingsManagement";
import UserList from "./components/Admin/UserList";
import ReviewList from "./components/Admin/ReviewList";
import DeleteListingPage from "./components/views/DeleteListingPage";
import Dashboard from "./components/Admin/Dashboard";
import AdminLogin from './components/Admin/AdminLogin';
import BookingConfirmation from "./components/views/BookingConfirmation ";
import "react-toastify/dist/ReactToastify.css";

const Error = () => <div>Page not found</div>;

const App = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <div>
      {loadingComplete ? (
        <>
          {/* Conditionally render Navbar for non-admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Listings />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/listings/:id/delete" element={<DeleteListingPage />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help-center" element={<HelpCenter />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="listings" element={<ListingsManagement />} />
              <Route path="users" element={<UserList />} />
              <Route path="reviews" element={<ReviewList />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<Error />} />
          </Routes>
          
          {/* Conditionally render Footer for non-admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </>
      ) : (
        <Spinner onComplete={() => setLoadingComplete(true)} />
      )}
    </div>
  );
};

export default App;