import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";
import { Toaster } from "react-hot-toast";

const Listings = lazy(() => import("./components/views/Listings"));
const ListingDetail = lazy(() => import("./components/views/ListingDetail"));
const CreateListing = lazy(() => import("./components/views/CreateListing"));
const EditListing = lazy(() => import("./components/views/EditListing"));
const SearchResults = lazy(() => import("./components/views/SearchResults"));
const Terms = lazy(() => import("./components/extras/Terms"));
const HelpCenter = lazy(() => import("./components/extras/HelpCenter"));
const Privacy = lazy(() => import("./components/extras/Privacy"));
const Login = lazy(() => import("./components/users/Login"));
const Signup = lazy(() => import("./components/users/Signup"));
const Account = lazy(() => import("./components/users/Account"));
const ProtectedAdminRoute = lazy(() => import("./components/Admin/ProtectedAdminRoute"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout"));
const ListingsManagement = lazy(() => import("./components/Admin/ListingsManagement"));
const UserList = lazy(() => import("./components/Admin/UserList"));
const ReviewList = lazy(() => import("./components/Admin/ReviewList"));
const DeleteListingPage = lazy(() => import("./components/views/DeleteListingPage"));
const Dashboard = lazy(() => import("./components/Admin/Dashboard"));
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin"));
const BookingPage = lazy(() => import("./components/views/BookingPage"));
const BookingConfirmation = lazy(() => import("./components/views/BookingConfirmation"));
const FrontPageOfCreateListings = lazy(() => import("./components/layouts/FrontPageOfCreateListings"));
const ConversationsPage = lazy(() => import("./components/views/ConversationsPage"));
const NotFound = lazy(() => import("./components/NotFound"));

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
  const loadingFallback = (
    <div className="flex min-h-[40vh] items-center justify-center text-red-600">
      Loading...
    </div>
  );

  const PublicPage = ({ children }) => (
    <div className="wl-page-shell">
      <div className="wl-page-grain" />
      <div className="wl-page-content">{children}</div>
    </div>
  );

  return (
    <div className="wl-app-root">
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#dc2626",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
        }}
      />
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*"        element={<Navbar />} />
      </Routes>

      <Suspense fallback={loadingFallback}>
        <Routes>
          <Route path="/"                      element={<PublicPage><Listings /></PublicPage>} />
          <Route path="/listings"              element={<PublicPage><Listings /></PublicPage>} />
          <Route path="/listings/:id"          element={<PublicPage><ListingDetail /></PublicPage>} />
          <Route path="/listings/new"          element={<PublicPage><CreateListing /></PublicPage>} />
          <Route path="/listings/:id/edit"     element={<PublicPage><EditListing /></PublicPage>} />
          <Route path="/listings/:id/delete"   element={<PublicPage><DeleteListingPage /></PublicPage>} />
          <Route path="/become-host"           element={<PublicPage><FrontPageOfCreateListings /></PublicPage>} />
          <Route path="/search-results"        element={<PublicPage><SearchResults /></PublicPage>} />
          <Route path="/auth/login"            element={<PublicPage><Login /></PublicPage>} />
          <Route path="/auth/signup"           element={<PublicPage><Signup /></PublicPage>} />
          <Route path="/profile"               element={<PublicPage><Account /></PublicPage>} />
          <Route path="/book/:id"              element={<PublicPage><BookingPage /></PublicPage>} />
          <Route path="/booking-confirmation"  element={<PublicPage><BookingConfirmation /></PublicPage>} />
          <Route path="/conversations"         element={<PublicPage><ConversationsPage /></PublicPage>} />
          <Route path="/terms"                 element={<PublicPage><Terms /></PublicPage>} />
          <Route path="/privacy"               element={<PublicPage><Privacy /></PublicPage>} />
          <Route path="/help-center"           element={<PublicPage><HelpCenter /></PublicPage>} />

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

          <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
        </Routes>
      </Suspense>

      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*"        element={<Footer />} />
      </Routes>
    </div>
  );
};

export default App;
