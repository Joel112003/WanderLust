import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
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
import Signup from "./components/users/Signup";
import Login from "./components/users/Login";
import Account from "./components/users/Account";
import Spinner from "./components/views/Spinner";
import DeleteListingPage from "./components/views/DeleteListingPage";
import BookingConfirmation  from "./components/views/BookingConfirmation ";
import "react-toastify/dist/ReactToastify.css";


const Error = () => <div>Page not found</div>;

const App = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <div>
      {loadingComplete ? (
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Listings />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/listings/:id/delete" element={<DeleteListingPage />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation  />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="*" element={<Error />} />
          </Routes>
          <Footer />
          
        </>
      ) : (
        <Spinner onComplete={() => setLoadingComplete(true)} />
      )}
    </div>
  );
};

export default App;
