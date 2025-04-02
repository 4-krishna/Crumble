import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const affirmations = [
  "Every day I'm growing stronger, and my heart is healing beautifully.",
  "I am worthy of love and respect, starting with self-love.",
  "My past experiences make me wiser, not weaker.",
  "I choose peace and healing over pain and dwelling.",
  "Today is a new opportunity to focus on my own happiness.",
  "I trust in my journey and embrace the healing process.",
  "My strength grows with each passing day.",
  "I am creating a beautiful new chapter in my life.",
  "I release what no longer serves my highest good.",
  "My heart is healing, and I am becoming stronger."
];
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CallIcon from '@mui/icons-material/Call';
import MessageIcon from '@mui/icons-material/Message';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [currentAffirmation, setCurrentAffirmation] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(affirmations[randomIndex]);
  }, []);
  
  // Calculate Crumble Coins (1 coin per 150 points)
  const crumbleCoins = Math.floor((currentUser?.points || 0) / 150);
  
  // Calculate progress based on days_strong
  const calculateProgress = () => {
    const daysStrong = currentUser?.days_strong || 0;
    // Set milestone at 30 days
    return Math.min(100, (daysStrong / 30) * 100);
  };
  
  const progress = calculateProgress().toFixed(2);

  const breakupMethods = [
    {
      id: 'emoji',
      title: 'Breakup Through Emoji',
      description: 'Express your feelings with carefully chosen emojis',
      icon: <EmojiEmotionsIcon sx={{ fontSize: 40 }} />,
      emoji: '💔',
      path: '/breakup/emoji'
    },
    {
      id: 'call',
      title: 'Breakup Through Call',
      description: 'Get a script for a phone conversation',
      icon: <CallIcon sx={{ fontSize: 40 }} />,
      emoji: '📞',
      path: '/breakup/call'
    },
    {
      id: 'text',
      title: 'Breakup Through Text',
      description: 'Send a well-crafted message',
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      emoji: '💬',
      path: '/breakup/text'
    },
    {
      id: 'magic',
      title: 'Magic Recommendation',
      description: 'Get a personalized breakup guide',
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      emoji: '✨',
      path: '/breakup/quiz'
    }
  ];

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Healing Journey
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Crumble Coins Card */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOnIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {crumbleCoins}
              </Typography>
              <Typography variant="h6">
                Crumble Coins™
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {currentUser?.points || 0} points total
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/rewards')}
              >
                View Rewards
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Progress Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Healing Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {currentUser?.days_strong || 0} days strong • {progress}% towards your healing goals
            </Typography>

            {/* Daily Affirmation */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom fontFamily="Oxanium, sans-serif">
                  Daily Affirmation
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                  {currentAffirmation}
                </Typography>
              </Paper>
            </Grid>
          </Paper>
        </Grid>

        {/* Breakup Methods */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Breakup Methods
          </Typography>
        </Grid>

        {breakupMethods.map((method) => (
          <Grid item xs={12} sm={6} md={3} key={method.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  component="div"
                  sx={{ mb: 2 }}
                >
                  {method.emoji}
                </Typography>
                <Typography variant="h6" component="div" gutterBottom>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {method.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(method.path)}
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Recent Achievements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {currentUser?.days_strong >= 7 && (
                <Chip
                  label="First Week Complete"
                  color="primary"
                  variant="outlined"
                />
              )}
              {currentUser?.points >= 100 && (
                <Chip
                  label="Point Collector"
                  color="primary"
                  variant="outlined"
                />
              )}
              {crumbleCoins >= 1 && (
                <Chip
                  label="First Crumble Coin"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;