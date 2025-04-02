import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CallIcon from '@mui/icons-material/Call';
import MessageIcon from '@mui/icons-material/Message';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function BreakupMethods() {
  const navigate = useNavigate();
  
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
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Choose Your Breakup Method
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Select the approach that feels right for you
      </Typography>

      <Grid container spacing={3}>
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
                  color="primary"
                  onClick={() => navigate(method.path)}
                >
                  Choose Method
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BreakupMethods;