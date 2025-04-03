import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'; // For Snapchat

function GhostMode() {
  const { currentUser, getGhostModeSettings, updateGhostModeSettings, getSocialPlatforms, connectSocialPlatform, disconnectSocialPlatform } = useAuth();
  const [settings, setSettings] = useState({
    blockMessages: false,
    hideStatus: false,
    muteNotifications: false,
    hideActivity: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [platformCredentials, setPlatformCredentials] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    // Load ghost mode settings and connected platforms when component mounts
    const loadData = async () => {
      setLoading(true);
      try {
        const settingsData = await getGhostModeSettings();
        setSettings(settingsData);
        
        const platformsData = await getSocialPlatforms();
        setPlatforms(platformsData.length > 0 ? platformsData : [
          { name: 'Instagram', connected: false, icon: InstagramIcon, color: '#E4405F' },
          { name: 'WhatsApp', connected: false, icon: WhatsAppIcon, color: '#25D366' },
          { name: 'Snapchat', connected: false, icon: PhotoCameraIcon, color: '#FFFC00' },
          { name: 'LinkedIn', connected: false, icon: LinkedInIcon, color: '#0A66C2' },
        ]);
      } catch (err) {
        setError(err.message || 'Failed to load ghost mode data');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleSettingChange = (setting) => async (event) => {
    const newSettings = {
      ...settings,
      [setting]: event.target.checked,
    };
    
    setSettings(newSettings);
    
    try {
      await updateGhostModeSettings(newSettings);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    }
  };

  const handleConnectPlatform = (platform) => {
    setSelectedPlatform(platform);
    setOpenDialog(true);
    setPlatformCredentials({
      username: '',
      password: ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlatform('');
    setPlatformCredentials({
      username: '',
      password: ''
    });
    setError('');
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setPlatformCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitConnection = async () => {
    try {
      // Create platform object with credentials
      const platformData = {
        name: selectedPlatform,
        username: platformCredentials.username,
        connected: true,
        connectedAt: new Date().toISOString()
      };
      
      await connectSocialPlatform(platformData);
      
      // Update local state
      setPlatforms((prev) =>
        prev.map((p) =>
          p.name === selectedPlatform ? { ...platformData } : p
        )
      );
      
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Failed to connect platform');
    }
  };
  
  const handleDisconnectPlatform = async (platformName) => {
    try {
      await disconnectSocialPlatform(platformName);
      
      // Update local state
      setPlatforms((prev) =>
        prev.map((p) =>
          p.name === platformName ? { ...p, connected: false } : p
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to disconnect platform');
    }
  };

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Ghost Mode
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Take control of your social media presence and protect your peace
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              <List>
                {Object.entries(settings).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                      secondary={`When enabled, this will ${key
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()}`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={value}
                        onChange={handleSettingChange(key)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

        {/* Connected Platforms */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connected Platforms
            </Typography>
            <List>
              {platforms.map((platform) => (
                <ListItem key={platform.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {platform.icon && (
                      <platform.icon
                        sx={{
                          mr: 2,
                          color: platform.connected ? platform.color : 'text.disabled',
                          fontSize: '28px'
                        }}
                      />
                    )}
                    <ListItemText
                      primary={platform.name}
                      secondary={
                        platform.connected
                          ? `Connected as ${platform.username || ''}`
                          : 'Not connected'
                      }
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: platform.connected ? 600 : 400
                        },
                        '& .MuiListItemText-secondary': {
                          color: platform.connected ? 'success.main' : 'text.secondary'
                        }
                      }}
                    />
                  </Box>
                  <ListItemSecondaryAction>
                    <Button
                      variant={platform.connected ? 'outlined' : 'contained'}
                      color={platform.connected ? 'error' : 'primary'}
                      size="small"
                      onClick={() =>
                        platform.connected
                          ? handleDisconnectPlatform(platform.name)
                          : handleConnectPlatform(platform.name)
                      }
                      sx={{
                        minWidth: '100px',
                        borderRadius: '20px'
                      }}
                    >
                      {platform.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Protection Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              icon={<SecurityIcon fontSize="inherit" />}
            >
              Ghost Mode is actively protecting your social media presence
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      )}  {/* Connection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Connect {selectedPlatform}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 2 }}>
            Connect your {selectedPlatform} account to enable Ghost Mode features.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={platformCredentials.username}
            onChange={handleCredentialChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={platformCredentials.password}
            onChange={handleCredentialChange}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Your credentials are securely stored and only used to manage your social media presence.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitConnection} 
            variant="contained" 
            color="primary"
            disabled={!platformCredentials.username || !platformCredentials.password}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GhostMode;