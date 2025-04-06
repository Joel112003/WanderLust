import React from "react";
import { Link } from "react-router-dom";
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  Divider
} from "@mui/material";
import { 
  Instagram, 
  Facebook, 
  LinkedIn,
  ArrowUpward
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useScrollTrigger, Zoom } from "@mui/material";

// Scroll to top component
const ScrollTop = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
      >
        {children}
      </Box>
    </Zoom>
  );
};

const Footer = () => {
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const hoverEffect = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  const tapEffect = {
    scale: 0.95
  };

  return (
    <>
      <Box id="back-to-top-anchor" />
      
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.grey[900] 
            : theme.palette.grey[100],
          padding: { xs: "24px 16px", sm: "32px 24px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          borderTop: `1px solid ${theme.palette.divider}`,
          marginTop: 'auto', // This makes the footer stick to bottom
          width: '100%',
          position: 'relative',
          zIndex: 1,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px -2px 10px rgba(0, 0, 0, 0.5)' 
            : '0px -2px 10px rgba(0, 0, 0, 0.1)',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9))' 
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1))',
          backdropFilter: theme.palette.mode === 'dark'
            ? 'blur(10px)'
            : 'blur(5px)',
          borderRadius: '8px',
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 0px 10px rgba(0, 0, 0, 0.5)'
            : '0px 0px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          style={{ width: '100%' }}
        >
          {/* Social Media Links */}
          <motion.div variants={itemVariants}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1,
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              Follow us on social media
            </Typography>
            <Box 
              display="flex" 
              gap={2}
              justifyContent="center"
            >
              <motion.div
                whileHover={hoverEffect}
                whileTap={tapEffect}
              >
                <IconButton
                  component="a"
                  href="https://www.instagram.com/airbnb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(228, 64, 95, 0.1)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(228, 64, 95, 0.2)',
                    }
                  }}
                >
                  <Instagram sx={{ color: "#E4405F" }} />
                </IconButton>
              </motion.div>

              <motion.div
                whileHover={hoverEffect}
                whileTap={tapEffect}
              >
                <IconButton
                  component="a"
                  href="https://www.facebook.com/airbnb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(66, 103, 178, 0.1)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(66, 103, 178, 0.2)',
                    }
                  }}
                >
                  <Facebook sx={{ color: "#4267B2" }} />
                </IconButton>
              </motion.div>

              <motion.div
                whileHover={hoverEffect}
                whileTap={tapEffect}
              >
                <IconButton
                  component="a"
                  href="https://www.linkedin.com/in/joelkunjumon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(10, 102, 194, 0.1)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(10, 102, 194, 0.2)',
                    }
                  }}
                >
                  <LinkedIn sx={{ color: "#0A66C2" }} />
                </IconButton>
              </motion.div>
            </Box>
          </motion.div>

          <Divider sx={{ 
            my: 2, 
            width: '80%',
            mx: 'auto',
            borderColor: theme.palette.divider
          }} />

          {/* Links to Privacy and Terms */}
          <motion.div variants={itemVariants}>
            <Box 
              display="flex" 
              gap={3}
              justifyContent="center"
              flexWrap="wrap"
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/privacy" 
                  style={{ 
                    textDecoration: "none", 
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Privacy Policy
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/terms" 
                  style={{ 
                    textDecoration: "none", 
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Terms of Service
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link 
                  to="/contact" 
                  style={{ 
                    textDecoration: "none", 
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Contact Us
                </Link>
              </motion.div>
            </Box>
          </motion.div>

          {/* Brand Info */}
          <motion.div variants={itemVariants}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ 
                mt: 2,
                fontSize: '0.75rem'
              }}
            >
              &copy; {new Date().getFullYear()} WanderLust Private Limited. All rights reserved.
            </Typography>
          </motion.div>
        </motion.div>
      </Box>

      {/* Scroll to top button */}
      <ScrollTop>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconButton
            color="primary"
            aria-label="scroll back to top"
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            <ArrowUpward />
          </IconButton>
        </motion.div>
      </ScrollTop>
    </>
  );
};

export default Footer;