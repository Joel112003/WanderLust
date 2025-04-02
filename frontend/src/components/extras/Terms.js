import React from "react";
import { 
  Box, 
  Typography, 
  Divider, 
  Container,
  Fade,
  Slide,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Chip
} from "@mui/material";
import { 
  Gavel as GavelIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  ContactSupport as ContactSupportIcon,
  Warning as WarningIcon,
  ThumbUp as ThumbUpIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

const Terms = () => {
  const theme = useTheme();
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const bounce = {
    initial: { y: -20 },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="mt-20">
      <Fade in={true} timeout={800}>
        <Box>
          <motion.div
            initial="initial"
            animate="animate"
            variants={bounce}
          >
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                textAlign: 'center',
                mb: 2
              }}
            >
              Terms and Conditions
            </Typography>
            <Divider sx={{ 
              mb: 4, 
              borderColor: theme.palette.divider,
              borderBottomWidth: 2
            }} />
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
              Welcome to WanderLust! These Terms and Conditions govern your use of our platform and services.
              By accessing or using WanderLust, you agree to be bound by these terms. If you disagree with any part,
              you may not access the service.
            </Typography>
            <Chip 
              label="Last Updated: June 2023" 
              color="secondary" 
              sx={{ mb: 3 }} 
            />
          </motion.div>

          <Slide direction="up" in={true} timeout={500}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.secondary.main
                }}
              >
                <GavelIcon sx={{ mr: 1 }} />
                1. Use of the Platform
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Eligibility" 
                    secondary="You must be at least 18 years old to use our services. By using WanderLust, you represent that you meet this requirement." 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Prohibited Activities" 
                    secondary={
                      <>
                        You agree not to:
                        <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                          <li>Violate any laws or regulations</li>
                          <li>Post false or misleading information</li>
                          <li>Use the service for any fraudulent purpose</li>
                          <li>Attempt to gain unauthorized access to our systems</li>
                          <li>Interfere with other users' enjoyment of the platform</li>
                        </Box>
                      </>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Account Security" 
                    secondary="You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." 
                  />
                </ListItem>
              </List>
            </Box>
          </Slide>

          <Fade in={true} timeout={1000}>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.secondary.main
                }}
              >
                <PaymentIcon sx={{ mr: 1 }} />
                2. Booking Policies
              </Typography>
              <Typography variant="body1" paragraph>
                All reservations made through WanderLust are subject to:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Payment Terms" 
                    secondary="Full payment may be required at time of booking or according to the property's specific payment policy. We accept major credit cards and other payment methods as indicated." 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Cancellation Policy" 
                    secondary={
                      <>
                        Cancellation terms vary by property:
                        <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                          <li>Standard: Free cancellation up to 48 hours before check-in</li>
                          <li>Moderate: Free cancellation up to 5 days before check-in</li>
                          <li>Strict: 50% refund up to 1 week before check-in</li>
                        </Box>
                        Always check the specific cancellation policy before booking.
                      </>
                    } 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Changes to Bookings" 
                    secondary="Modifications to existing reservations are subject to availability and may incur additional charges." 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Taxes and Fees" 
                    secondary="All prices are exclusive of applicable taxes and fees which will be displayed before confirmation." 
                  />
                </ListItem>
              </List>
            </Box>
          </Fade>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 
                theme.palette.grey[900] : 
                theme.palette.grey[100]
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.secondary.main
                }}
              >
                <CancelIcon sx={{ mr: 1 }} />
                3. Cancellations and Refunds
              </Typography>
              <Typography variant="body1" paragraph>
                Our cancellation policy is designed to be fair to both guests and hosts:
              </Typography>
              <Typography variant="body2" component="div" paragraph>
                <Box component="ul" sx={{ pl: 3 }}>
                  <li>Refunds will be processed within 7-10 business days to the original payment method</li>
                  <li>No-shows will be charged the full reservation amount</li>
                  <li>Early departures do not qualify for refunds</li>
                  <li>Extenuating circumstances may be considered on a case-by-case basis</li>
                </Box>
              </Typography>
              <Typography variant="body1" paragraph>
                For COVID-19 related cancellations, please refer to our special policy published in the Help Center.
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.secondary.main
              }}
            >
              <HelpIcon sx={{ mr: 1 }} />
              4. Liability and Disputes
            </Typography>
            <Typography variant="body1" paragraph>
              WanderLust acts solely as an intermediary between guests and hosts:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Property Conditions" 
                  secondary="We are not responsible for the condition of listed properties but will assist in resolving legitimate complaints." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Dispute Resolution" 
                  secondary="Any disputes must be reported within 24 hours of check-in. We will mediate in good faith but cannot guarantee resolutions." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Limitation of Liability" 
                  secondary="Our maximum liability for any claim related to our services is limited to the amount you paid for the booking in question." 
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.secondary.main
              }}
            >
              <SecurityIcon sx={{ mr: 1 }} />
              5. Intellectual Property
            </Typography>
            <Typography variant="body1" paragraph>
              All content on WanderLust, including text, graphics, logos, and software, is our property or licensed to us:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Copyright" 
                  secondary="You may not reproduce, distribute, or create derivative works without our express permission." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="User Content" 
                  secondary="By posting content, you grant us a worldwide license to use it for platform operations and marketing." 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Trademarks" 
                  secondary="WanderLust's name and logo are registered trademarks and may not be used without permission." 
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText
          }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ContactSupportIcon sx={{ mr: 1 }} />
              Contact Information
            </Typography>
            <Typography variant="body1" paragraph>
              For questions about these Terms and Conditions, please contact:
            </Typography>
            <Typography variant="body1" paragraph>
              Email: <Link href="mailto:support@wanderlust.com" color="inherit" sx={{ textDecoration: 'underline' }}>support@wanderlust.com</Link>
            </Typography>
            <Typography variant="body1" paragraph>
              Legal Department, WanderLust Inc.<br />
              123 Travel Street, Suite 100<br />
              San Francisco, CA 94107<br />
              United States
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              These terms may be updated periodically. Continued use after changes constitutes acceptance.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Terms;