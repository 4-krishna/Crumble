import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';

const pages = [
  { title: 'Ghost Mode', path: '/ghost-mode' },
  { title: 'Crumble Coins', path: '/crumble-coins' },
  { title: 'Healing', path: '/rewards' },
  { title: 'Subscription', path: '/subscription' },
];

const authPages = [
  { title: 'Login', path: '/login' },
  { title: 'Register', path: '/register' },
];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const { currentUser, logout } = useAuth();
  const isAuthenticated = !!currentUser;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <FavoriteIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Crumble
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <FavoriteIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Crumble
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: '#2B6CB0',
                  display: 'block',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(43, 108, 176, 0.1)',
                    textShadow: '0 0 8px rgba(43, 108, 176, 0.3)'
                  }
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/subscription"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    mr: 2,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  Upgrade to Pro
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  sx={{
                    color: '#2B6CB0',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(43, 108, 176, 0.1)',
                      textShadow: '0 0 8px rgba(43, 108, 176, 0.3)'
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={logout}
                  sx={{
                    color: '#2B6CB0',
                    ml: 1,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(43, 108, 176, 0.1)',
                      textShadow: '0 0 8px rgba(43, 108, 176, 0.3)'
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                {authPages.map((page) => (
                  <Button
                    key={page.title}
                    component={RouterLink}
                    to={page.path}
                    sx={{ color: 'white', ml: 1 }}
                  >
                    {page.title}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;