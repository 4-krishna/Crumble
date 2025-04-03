import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../../context/AuthContext';

function CallBreakup() {
  const { currentUser, updatePoints } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTone, setSelectedTone] = useState('classic');
  const [copied, setCopied] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    fetchCallScripts();
  }, []);

  const fetchCallScripts = async () => {
    try {
      const response = await fetch('/api/breakup-messages/call');
      if (!response.ok) throw new Error('Failed to fetch scripts');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError('Failed to load call scripts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      // Award points for using a template
      await updatePoints(10);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setError('Failed to copy script');
    }
  };

  const tones = [
    { value: 'classic', label: 'Classic', premium: false },
    { value: 'gentle', label: 'Gentle', premium: true },
    { value: 'blunt', label: 'Blunt', premium: true },
    { value: 'humorous', label: 'Humorous', premium: true },
  ];

  const handleToneChange = (newValue) => {
    const selectedToneObj = tones.find(tone => tone.value === newValue);
    if (selectedToneObj?.premium && !currentUser?.isPremium) {
      setShowUpgradeDialog(true);
      return;
    }
    setSelectedTone(newValue);
    setError('');
  };

  const handleUpgrade = () => {
    window.location.href = '/subscription';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredMessages = messages.filter(msg => msg.tone === selectedTone);

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Breakup Through Call
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Choose your tone and get a pre-scripted dialogue for your phone conversation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!currentUser?.isPremium ? (
        <Card sx={{ mb: 4, backgroundColor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">
              🌟 Unlock Premium Call Scripts
            </Typography>
            <Typography variant="body1" paragraph>
              Upgrade to access our complete collection of specialized breakup call scripts:
            </Typography>
            <Grid container spacing={2}>
              {tones.filter(tone => tone.premium).map((tone) => (
                <Grid item xs={12} sm={4} key={tone.value}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: 'action.hover',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {tone.label} Style
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tone.value === 'gentle' && 'Perfect for sensitive situations'}
                      {tone.value === 'blunt' && 'Direct and straightforward approach'}
                      {tone.value === 'humorous' && 'Lighthearted way to ease tension'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleUpgrade}
                sx={{
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Upgrade to Premium
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={selectedTone}
            onChange={(e, newValue) => handleToneChange(newValue)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            {tones.map((tone) => (
              <Tab
                key={tone.value}
                value={tone.value}
                label={`${tone.label}${tone.premium ? ' 🌟' : ''}`}
              />
            ))}
          </Tabs>
        </Paper>
      )}

      <Grid container spacing={3}>
        {filteredMessages.map((script, index) => (
          <Grid item xs={12} key={index}>
            <Card
              sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {script.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-line',
                    mb: 2,
                    fontFamily: 'monospace',
                    backgroundColor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {script.content}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(script.content)}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy Script'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={showUpgradeDialog} onClose={() => setShowUpgradeDialog(false)}>
        <DialogTitle>Upgrade to Premium</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Get access to our full collection of breakup call scripts, including:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Gentle and empathetic approaches</li>
            <li>Direct and honest conversations</li>
            <li>Lighthearted and humorous scripts</li>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Upgrade now to unlock all premium features and make your breakup conversation easier.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeDialog(false)}>Not Now</Button>
          <Button variant="contained" color="primary" onClick={handleUpgrade}>
            Upgrade to Premium
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CallBreakup;