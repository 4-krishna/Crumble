import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';

function Dashboard() {
  const { currentUser, generateMessage, updatePoints } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate progress based on days_strong
  const calculateProgress = () => {
    const daysStrong = currentUser?.days_strong || 0;
    // Set milestone at 30 days
    return Math.min(100, (daysStrong / 30) * 100);
  };
  
  const progress = calculateProgress();

  useEffect(() => {
    // Try to generate a message when the dashboard loads
    if (!message && currentUser) {
      handleGenerateMessage();
    }
  }, [currentUser]);

  const handleGenerateMessage = async () => {
    setIsLoading(true);
    setError('');
    try {
      const newMessage = await generateMessage();
      setMessage(newMessage);
      // Award points for getting a new message
      await updatePoints(5);
    } catch (err) {
      setError(err.message || 'Failed to generate message');
      console.error('Failed to generate message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Days Strong', value: currentUser?.days_strong || '0', icon: <TimerIcon color="primary" /> },
    { label: 'Points Earned', value: currentUser?.points || '0', icon: <StarIcon color="primary" /> },
    { label: 'Streak', value: currentUser?.streak || '0', icon: <FavoriteIcon color="primary" /> },
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
        {/* Progress Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress}% towards your healing goals
            </Typography>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                {stat.icon}
                <Typography variant="h4" sx={{ my: 1 }}>
                  {stat.value}
                </Typography>
                <Typography color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Message Generator */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Affirmation
            </Typography>
            <Box sx={{ my: 2 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : message ? (
                <Typography
                  variant="h5"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: 'primary.main',
                  }}
                >
                  {message}
                </Typography>
              ) : (
                <Typography color="text.secondary" textAlign="center">
                  Click the button below to receive your daily affirmation
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateMessage}
                disabled={isLoading}
                size="large"
              >
                {isLoading ? 'Generating...' : 'Generate Message'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="First Week Complete"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Shared Your Story"
                color="primary"
                variant="outlined"
              />
              <Chip
                label="Self-Care Champion"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;