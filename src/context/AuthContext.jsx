import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      navigate('/dashboard');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }
      
      navigate('/login');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const generateMessage = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/generate', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate message');
      }
      
      return data.message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePoints = async (points) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/update-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          user_id: currentUser.id, 
          points 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update points');
      }
      
      // Update local user data with points, streak, and days_strong
      const updatedUser = { 
        ...currentUser, 
        points: data.points,
        streak: data.streak,
        days_strong: data.days_strong
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getGhostModeSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/ghost-mode/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get ghost mode settings');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateGhostModeSettings = async (settings) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/ghost-mode/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          user_id: currentUser.id,
          settings
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update ghost mode settings');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getSocialPlatforms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/social-platforms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get connected platforms');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const connectSocialPlatform = async (platform) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/social-platforms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          user_id: currentUser.id,
          platform
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect platform');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const disconnectSocialPlatform = async (platformName) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/social-platforms', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          user_id: currentUser.id,
          platform_name: platformName
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to disconnect platform');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getRewards = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/rewards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get rewards');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const claimReward = async (rewardId) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          user_id: currentUser.id,
          reward_id: rewardId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim reward');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAchievements = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/achievements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get achievements');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    generateMessage,
    updatePoints,
    getGhostModeSettings,
    updateGhostModeSettings,
    getSocialPlatforms,
    connectSocialPlatform,
    disconnectSocialPlatform,
    getRewards,
    claimReward,
    getAchievements
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};