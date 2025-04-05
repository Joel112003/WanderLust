import React, { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  Home,
  Payment,
  Receipt,
  Person,
  Email,
  Phone,
  LocationOn,
  Notifications,
  CheckCircle,
  Cancel,
  Star,
  Download,
} from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileResponse.data?.user) {
          const userData = profileResponse.data.user;
          setUser({
            email: userData.email,
            username: userData.username,
            avatar: userData.avatar || "/default-avatar.png",
            phone: userData.phone || "",
            address: userData.address || "",
            language: userData.language || "English",
            notification_preferences:
              userData.notification_preferences !== false,
            verified: userData.verified || false,
            joined_date: userData.created_at
              ? new Date(userData.created_at).toLocaleDateString()
              : "Unknown",
            role: userData.role || "User",
          });
        }

        const listingsResponse = await axios.get(`${API_URL}/listings/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(listingsResponse.data.data || []);

        try {
          const bookingsResponse = await axios.get(
            `${API_URL}/bookings/my-bookings`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setBookings(
            Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []
          );
        } catch (bookingError) {
          console.error("Error fetching bookings:", bookingError);
        }

        try {
          const notificationsResponse = await axios.get(
            `${API_URL}/notifications`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setNotifications(
            notificationsResponse.data.data ||
              (Array.isArray(notificationsResponse.data)
                ? notificationsResponse.data
                : [])
          );
        } catch (notificationError) {
          console.error("Error fetching notifications:", notificationError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>{" "}
        </motion.div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Bookings
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <Typography variant="h6" className="font-bold mb-4 text-gray-900">
              Your Bookings
            </Typography>
            {bookings.length === 0 ? (
              <Typography className="text-gray-600">
                You haven't made any bookings yet.
              </Typography>
            ) : (
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {bookings.map((booking) => (
                  <Grid item xs={12} sm={6} md={6} key={booking._id}>
                    <motion.div variants={itemVariants}>
                      <Card
                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                        sx={{
                          position: "relative",
                          border:
                            booking.status === "confirmed"
                              ? "1px solid rgba(46, 125, 50, 0.3)"
                              : booking.status === "pending"
                              ? "1px solid rgba(237, 108, 2, 0.3)"
                              : "1px solid rgba(211, 47, 47, 0.3)",
                          overflow: "visible",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {booking.status === "confirmed" && (
                          <Chip
                            label="Confirmed"
                            color="success"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              zIndex: 1,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        {booking.status === "pending" && (
                          <Chip
                            label="Pending"
                            color="warning"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              zIndex: 1,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        {booking.status === "cancelled" && (
                          <Chip
                            label="Cancelled"
                            color="error"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              zIndex: 1,
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            height: 160,
                            backgroundImage: `url(${
                              booking.listing?.image?.url ||
                              booking.listing?.images?.[0]?.url ||
                              "/placeholder.jpg"
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderBottom: "1px solid rgba(0,0,0,0.1)",
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography
                            variant="h6"
                            className="font-semibold mb-1 line-clamp-1"
                          >
                            {booking.listing?.title || "Unnamed Listing"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="mb-2"
                          >
                            <LocationOn
                              fontSize="small"
                              sx={{ verticalAlign: "middle", mr: 0.5 }}
                            />
                            {booking.listing?.location ||
                              "Location not available"}
                          </Typography>

                          <Box
                            sx={{
                              backgroundColor:
                                booking.status === "confirmed"
                                  ? "rgba(46, 125, 50, 0.08)"
                                  : booking.status === "pending"
                                  ? "rgba(237, 108, 2, 0.08)"
                                  : "rgba(211, 47, 47, 0.08)",
                              padding: "12px",
                              borderRadius: "4px",
                              marginTop: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              Booking Confirmation #
                              {booking._id.substring(0, 8)}
                            </Typography>
                            <Divider className="my-2" />
                            <Grid container spacing={1} className="mt-1">
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  className="font-medium"
                                >
                                  Check-in:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    booking.checkIn
                                  ).toLocaleDateString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="body2"
                                  className="font-medium"
                                >
                                  Check-out:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    booking.checkOut
                                  ).toLocaleDateString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>

                          <Typography
                            variant="body2"
                            className="font-medium mt-2"
                            sx={{
                              color:
                                booking.status === "confirmed"
                                  ? "success.main"
                                  : booking.status === "pending"
                                  ? "warning.main"
                                  : "error.main",
                              fontWeight: "bold",
                            }}
                          >
                            Total: ₹{booking.total.toLocaleString()}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate(`/listings/${booking.listing}`)
                            }
                            variant="outlined"
                            startIcon={<Visibility />}
                          >
                            View Listing
                          </Button>
                          {booking.status === "confirmed" && (
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              startIcon={<Download />}
                            >
                              Download
                            </Button>
                          )}
                        </CardActions>{" "}
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        );

      case 1: // Listings
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <Typography variant="h6" className="font-bold mb-4 text-gray-900">
              Your Listings
            </Typography>
            {listings.length === 0 ? (
              <Typography className="text-gray-600">
                You have no listings yet.
              </Typography>
            ) : (
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {listings.map((listing) => (
                  <Grid item xs={12} md={6} key={listing.id}>
                    <motion.div variants={itemVariants}>
                      <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                        {listing?.image && (
                          <img
                            src={
                              typeof listing.image === "string"
                                ? listing.image
                                : listing.image.url
                            }
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" className="font-semibold">
                            {listing.title}
                          </Typography>
                          <Box className="flex items-center mt-2 text-gray-600">
                            <Visibility
                              sx={{ fontSize: "1rem", marginRight: "4px" }}
                            />
                            <Typography variant="body2">
                              {listing.views || 0} views
                            </Typography>
                          </Box>
                          <Chip
                            label={listing.status || "Active"}
                            color={
                              listing.status === "Active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                            className="mt-2"
                          />
                        </CardContent>
                        <CardActions className="justify-between">
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() =>
                              navigate(`/listings/${listing.id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() =>
                              navigate(`/listings/${listing.id}/delete`)
                            }
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        );

      case 2: // Notifications
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <Box
              className="flex justify-between items-center mb-4"
              style={{ marginBottom: "20px" }}
            >
              <Typography variant="h6" className="font-bold text-gray-900">
                Notifications
              </Typography>
              {notifications.length > 0 && (
                <Button
                  size="small"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      await axios.put(
                        `${API_URL}/notifications/mark-all-read`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      setNotifications((prevNotifications) =>
                        prevNotifications.map((notification) => ({
                          ...notification,
                          isRead: true,
                        }))
                      );

                      toast.success("All notifications marked as read");
                    } catch (error) {
                      console.error("Error marking all as read:", error);
                      toast.error("Could not mark notifications as read");
                    }
                  }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
            {notifications.length === 0 ? (
              <Typography className="text-gray-600">
                You don't have any notifications.
              </Typography>
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={notification._id || index}
                    className="bg-white rounded-lg shadow-sm p-4 mb-3 border-l-4 border-blue-500"
                  >
                    <div className="flex items-start">
                      <div className="mr-3">
                        {notification.type === "booking_confirmed" ? (
                          <CheckCircle className="text-green-500 h-6 w-6" />
                        ) : notification.type === "booking_cancelled" ? (
                          <Cancel className="text-red-500 h-6 w-6" />
                        ) : notification.type === "review" ? (
                          <Star className="text-yellow-500 h-6 w-6" />
                        ) : (
                          <Notifications className="text-blue-500 h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.type === "booking_confirmed" && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>
                              Booking details will appear in your bookings tab.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          className="mt-1"
                          onClick={() =>
                            markNotificationAsRead(notification._id)
                          }
                        >
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </List>
            )}{" "}
          </motion.div>
        );

      case 3: // Transactions
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <Typography variant="h6" className="font-bold mb-4 text-gray-900">
              Transaction History
            </Typography>
            {transactions.length === 0 ? (
              <Typography className="text-gray-600">
                No transactions found.
              </Typography>
            ) : (
              <List className="p-0">
                {transactions.map((transaction) => (
                  <motion.div variants={itemVariants} key={transaction.id}>
                    <ListItem className="mb-2 border rounded-lg p-3">
                      <ListItemAvatar>
                        <Avatar
                          className={
                            transaction.type === "Payment"
                              ? "bg-green-100"
                              : "bg-orange-100"
                          }
                        >
                          {transaction.type === "Payment" ? (
                            <Payment className="text-green-500" />
                          ) : (
                            <Receipt className="text-orange-500" />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${
                          transaction.type
                        }: $${transaction.amount.toFixed(2)}`}
                        secondary={`Date: ${transaction.date} • Status: ${transaction.status}`}
                      />
                      <Button size="small" color="primary">
                        Details
                      </Button>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            )}
          </motion.div>
        );

      case 4: // Profile
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            {user && (
              <>
                <Box className="bg-blue-50 p-4 rounded-lg mb-6 ">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4} className="flex justify-center">
                      <Avatar
                        src={user.avatar}
                        alt={user.username}
                        className="w-24 h-24 border-4 border-white shadow-lg"
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <motion.div
                        variants={containerVariants}
                        className="space-y-1"
                      >
                        <motion.div variants={itemVariants}>
                          <Typography
                            variant="h5"
                            className="font-bold text-gray-900"
                          >
                            {user.username}
                          </Typography>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Typography variant="body1" className="text-gray-500">
                            {user.email}
                          </Typography>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Typography
                            variant="body1"
                            className="text-gray-500 text-sm"
                          >
                            Member Since:{" "}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : user.joined_date || "N/A"}
                          </Typography>
                        </motion.div>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Box>

                <Divider className="my-6" />

                <Typography
                  variant="h6"
                  className="font-bold mb-4 text-gray-900"
                >
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                      <Paper className="p-4 h-full flex items-center space-x-3 bg-gray-50 rounded-lg">
                        <Person className="text-gray-500" />
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            Username
                          </Typography>
                          <Typography>{user.username}</Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                      <Paper className="p-4 h-full flex items-center space-x-3 bg-gray-50 rounded-lg">
                        <Email className="text-gray-500" />
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            Email
                          </Typography>
                          <Typography>{user.email}</Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                      <Paper className="p-4 h-full flex items-center space-x-3 bg-gray-50 rounded-lg">
                        <Phone className="text-gray-500" />
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            Phone
                          </Typography>
                          <Typography>
                            {user.phone || "Not provided"}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                      <Paper className="p-4 h-full flex items-center space-x-3 bg-gray-50 rounded-lg">
                        <LocationOn className="text-gray-500" />
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            Address
                          </Typography>
                          <Typography>
                            {user.address || "Not provided"}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                </Grid>

                <Box className="mt-6">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Log Out
                  </Button>
                </Box>
              </>
            )}{" "}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-5xl mt-20 shadow-lg"
      style={{ marginBottom: "100px", minHeight: "calc(100vh - 200px)" }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <Paper className="p-6 shadow-md rounded-lg">
        <Box className="flex justify-between items-center mb-8">
          <Box className="flex items-center">
            <Home className="text-blue-500 mr-2" />
            <Typography variant="h5" className="font-bold text-gray-900">
              My Account
            </Typography>
          </Box>
          <Button
            component="a"
            href="/"
            color="inherit"
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
          >
            Back to Home
          </Button>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b border-gray-200"
        >
          <Tab
            icon={<Home />}
            label="Bookings"
            component={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          />
          <Tab
            icon={<Visibility />}
            label="Listings"
            component={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          />
          <Tab
            icon={
              <Badge
                badgeContent={notifications.filter((n) => !n.isRead).length}
                color="error"
              >
                <Notifications />
              </Badge>
            }
            label="Notifications"
            component={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          />
          <Tab
            icon={<Payment />}
            label="Transactions"
            component={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          />
          <Tab
            icon={<Person />}
            label="Profile"
            component={motion.div}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          />
        </Tabs>

        {renderTabContent()}
      </Paper>
    </div>
  );
};

export default Account;
