import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Rewards() {
  const { currentUser, getRewards, getAchievements, claimReward } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingReward, setClaimingReward] = useState(false);
  
  // Calculate level based on points
  const calculateLevel = (points) => {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    return 5;
  };
  
  const points = currentUser?.points || 0;
  const level = calculateLevel(points);
  
  // Calculate next level points
  const getNextLevelPoints = (currentLevel) => {
    switch(currentLevel) {
      case 1: return 100;
      case 2: return 300;
      case 3: return 600;
      case 4: return 1000;
      default: return points + 500; // If already at max level, just add 500
    }
  };
  
  const nextLevelPoints = getNextLevelPoints(level);
  const progress = Math.min(100, (points / nextLevelPoints) * 100);
  
  useEffect(() => {
    // Load rewards and achievements when component mounts
    const loadData = async () => {
      setLoading(true);
      try {
        const rewardsData = await getRewards();
        setRewards(rewardsData);
        
        const achievementsData = await getAchievements();
        setAchievements(achievementsData);
      } catch (err) {
        setError(err.message || 'Failed to load rewards data');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);
  
  const handleClaimReward = async (rewardId) => {
    setClaimingReward(true);
    setError('');
    
    try {
      await claimReward(rewardId);
      
      // Update local state to mark reward as claimed
      setRewards(prev => 
        prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, claimed: true } 
            : reward
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to claim reward');
    } finally {
      setClaimingReward(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Rewards & Achievements
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
        {/* Progress Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Level {level}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon color="primary" />
              <Typography variant="h6" sx={{ mx: 1 }}>
                {points} Points
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {nextLevelPoints - points} points until next level
            </Typography>
          </Paper>
        </Grid>

        {/* Available Rewards */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Rewards
            </Typography>
            <Grid container spacing={2}>
              {rewards.map((reward) => (
                <Grid item xs={12} key={reward.id || reward.title}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {reward.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reward.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <StarIcon
                          fontSize="small"
                          sx={{ color: 'primary.main', mr: 0.5 }}
                        />
                        <Typography variant="body2">{reward.points}</Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant={reward.claimed ? 'outlined' : 'contained'}
                        startIcon={
                          reward.claimed ? <CheckCircleIcon /> : <LockIcon />
                        }
                        disabled={!reward.unlocked || reward.claimed || claimingReward}
                        onClick={() => reward.unlocked && !reward.claimed && handleClaimReward(reward.id)}
                        fullWidth
                      >
                        {reward.claimed ? 'Claimed' : reward.unlocked ? (claimingReward ? 'Claiming...' : 'Claim') : 'Unlock'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Achievements
            </Typography>
            <List>
              {achievements.map((achievement, index) => (
                <React.Fragment key={achievement.id || achievement.title}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {achievement.completed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <LockIcon color="disabled" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.title}
                      secondary={
                        <>
                          {achievement.description}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 0.5,
                            }}
                          >
                            <StarIcon
                              fontSize="small"
                              sx={{ color: 'primary.main', mr: 0.5 }}
                            />
                            <Typography variant="body2">
                              {achievement.points} points
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                    {achievement.completed && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 2 }}>
                        +{achievement.points} points
                      </Typography>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      )}
    </Box>
  );
}

export default Rewards;