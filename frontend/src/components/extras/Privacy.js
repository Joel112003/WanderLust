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
  Link
} from "@mui/material";
import { 
  PrivacyTip as PrivacyTipIcon,
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  Email as EmailIcon,
  Cookie as CookieIcon,
  Policy as PolicyIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material/styles";

const Privacy = () => {
  const theme = useTheme();
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className="mt-20">
      <Fade in={true} timeout={800}>
        <Box>
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
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
              Privacy Policy
            </Typography>
            <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
              At WanderLust, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy outlines our practices regarding data collection, use, and disclosure when you use our services.
            </Typography>
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
                <PrivacyTipIcon sx={{ mr: 1 }} />
                1. Information We Collect
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DataUsageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Personal Information" 
                    secondary="Name, email address, phone number, date of birth, passport details (for bookings)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CookieIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Usage Data" 
                    secondary="IP address, browser type, pages visited, time spent on pages, clickstream data" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PolicyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Payment Information" 
                    secondary="Credit card details (processed securely through our payment partners), billing address" 
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
                <DataUsageIcon sx={{ mr: 1 }} />
                2. How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We use your information to:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="• Process and manage your bookings and reservations" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Provide customer support and respond to inquiries" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Improve our services and develop new features" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Send promotional offers and travel recommendations (you can opt-out anytime)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Prevent fraud and ensure platform security" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Comply with legal obligations and enforce our terms of service" />
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
                <SecurityIcon sx={{ mr: 1 }} />
                3. Data Security Measures
              </Typography>
              <Typography variant="body1" paragraph>
                We implement industry-standard security measures to protect your data:
              </Typography>
              <Typography variant="body2" component="div" paragraph>
                <Box component="ul" sx={{ pl: 3 }}>
                  <li>SSL/TLS encryption for all data transmissions</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and strict authentication protocols</li>
                  <li>Data minimization principles - we only collect what we need</li>
                  <li>Regular staff training on data protection</li>
                </Box>
              </Typography>
              <Typography variant="body1" paragraph>
                In the event of a data breach that affects your personal information, we will notify you and the appropriate authorities within 72 hours of discovery.
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
              <PolicyIcon sx={{ mr: 1 }} />
              4. Cookies and Tracking Technologies
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar tracking technologies to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Remember your preferences and login information" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Analyze website traffic and usage patterns" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Deliver personalized content and advertisements" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              You can control cookies through your browser settings. However, disabling cookies may affect certain features of our service.
            </Typography>
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
              <PrivacyTipIcon sx={{ mr: 1 }} />
              5. Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Under data protection laws, you have the right to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Access the personal data we hold about you" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Request correction of inaccurate data" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Request deletion of your data (subject to legal limitations)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Object to or restrict certain processing activities" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Withdraw consent where processing is based on consent" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Lodge a complaint with your local data protection authority" />
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
              <EmailIcon sx={{ mr: 1 }} />
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:
            </Typography>
            <Typography variant="body1" paragraph>
              Email: <Link href="mailto:privacy@wanderlust.com" color="inherit" sx={{ textDecoration: 'underline' }}>privacy@wanderlust.com</Link>
            </Typography>
            <Typography variant="body1" paragraph>
              Postal Address: Data Protection Officer, WanderLust Inc., 123 Travel Street, Suite 100, San Francisco, CA 94107, USA
            </Typography>
            <Typography variant="body1">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Privacy;