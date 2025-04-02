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
    { value: 'classic', label: 'Classic' },
    { value: 'gentle', label: 'Gentle' },
    { value: 'blunt', label: 'Blunt' },
    { value: 'humorous', label: 'Humorous' },
  ];

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

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTone}
          onChange={(e, newValue) => setSelectedTone(newValue)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tones.map((tone) => (
            <Tab
              key={tone.value}
              value={tone.value}
              label={tone.label}
            />
          ))}
        </Tabs>
      </Paper>

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
    </Box>
  );
}

export default CallBreakup;