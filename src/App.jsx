import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, ThemeProvider, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import theme from './theme';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GhostMode from './pages/GhostMode';
import Rewards from './pages/Rewards';
import Subscription from './pages/Subscription';
import ProtectedRoute from './components/ProtectedRoute';
import { EmojiBreakup, CallBreakup, TextBreakup, MagicQuiz } from './pages/breakup';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: theme.palette.background.default
      }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/ghost-mode" element={
            <ProtectedRoute>
              <GhostMode />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          <Route path="/breakup/emoji" element={
            <ProtectedRoute>
              <EmojiBreakup />
            </ProtectedRoute>
          } />
          <Route path="/breakup/call" element={
            <ProtectedRoute>
              <CallBreakup />
            </ProtectedRoute>
          } />
          <Route path="/breakup/text" element={
            <ProtectedRoute>
              <TextBreakup />
            </ProtectedRoute>
          } />
          <Route path="/breakup/quiz" element={
            <ProtectedRoute>
              <MagicQuiz />
            </ProtectedRoute>
          } />
        </Routes>
      </Container>
    </Box>
    </ThemeProvider>
  );
}

export default App;