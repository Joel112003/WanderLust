import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

const AnimatedButton = styled(Button)({
  transition: "0.3s",
  borderRadius: "20px",
  '&:hover': {
    transform: "scale(1.05)",
    backgroundColor: "#ff385c",
  },
});

const AnimatedTab = styled(Tab)({
  transition: "0.3s",
  '&:hover': {
    color: "#ff385c",
  },
});

const HelpCenter = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: "auto",
        mt:20,
        p: 3,
        textAlign: "center",
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "white",
        mb:5,
      }}
      
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        Hi, how can we help?
      </Typography>
      <Box display="flex" justifyContent="center" mb={4}>
        <TextField
          variant="outlined"
          placeholder="Search how-tos and more"
          sx={{ width: "70%", mr: 2, borderRadius: "50px" }}
        />
        <AnimatedButton
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{ bgcolor: "#ff385c", color: "white", textTransform: "none" }}
        >
          Search
        </AnimatedButton>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ mb: 4 }}
      >
        <AnimatedTab label="Guest" />
        <AnimatedTab label="Host" />
        <AnimatedTab label="Experience Host" />
        <AnimatedTab label="Travel Admin" />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {tabValue === 0 && (
        <Card sx={{ boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Guides for Guests</Typography>
            <Typography variant="body2" color="text.secondary">
              Learn how to make the most of your stay.
            </Typography>
          </CardContent>
        </Card>
      )}
      {tabValue === 1 && (
        <Card sx={{ boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Host Resources</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your listings and engage with guests.
            </Typography>
          </CardContent>
        </Card>
      )}
      {tabValue === 2 && (
        <Card sx={{ boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Experience Host Guides</Typography>
            <Typography variant="body2" color="text.secondary">
              Create unique experiences for your guests.
            </Typography>
          </CardContent>
        </Card>
      )}
      {tabValue === 3 && (
        <Card sx={{ boxShadow: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Travel Admin Tools</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage bookings and support your team.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ mt: 3, mb: 2 }} />
      <Typography variant="body1" color="gray">
        We're here for you
      </Typography>
      <AnimatedButton
        variant="contained"
        sx={{ mt: 2, bgcolor: "#ff385c", color: "white", textTransform: "none" }}
      >
        Log in or sign up
      </AnimatedButton>
    </Box>
  );
};

export default HelpCenter;
