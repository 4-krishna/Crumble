import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../../context/AuthContext';

function TextBreakup() {
  const { currentUser, updatePoints } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState({
    open: false,
    message: null,
    editedContent: ''
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTextMessages();
  }, []);

  const fetchTextMessages = async () => {
    try {
      const response = await fetch('/api/breakup-messages/text');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError('Failed to load text messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (message) => {
    setEditDialog({
      open: true,
      message,
      editedContent: message.content
    });
  };

  const handleCloseEdit = () => {
    setEditDialog({
      open: false,
      message: null,
      editedContent: ''
    });
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      // Award points for using a template
      await updatePoints(10);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      setError('Failed to copy message');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Breakup Through Text
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Choose and customize your breakup message
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {messages.map((message, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {message.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-line',
                    mb: 2,
                    backgroundColor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  {message.content}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tone: {message.tone}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEdit(message)}
                >
                  Customize
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(message.content)}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy Text'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={editDialog.open}
        onClose={handleCloseEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Customize Your Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={editDialog.editedContent}
            onChange={(e) => setEditDialog(prev => ({
              ...prev,
              editedContent: e.target.value
            }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCopy(editDialog.editedContent);
              handleCloseEdit();
            }}
            variant="contained"
          >
            Copy Customized Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TextBreakup;