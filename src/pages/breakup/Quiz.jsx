import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material';

function Quiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/quiz/magic');
      if (!response.ok) {
        throw new Error('Failed to load quiz questions');
      }
      const data = await response.json();
      setQuestions(data);
      setAnswers(new Array(data.length).fill(''));
    } catch (err) {
      setError('Failed to load quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (event) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = event.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate recommendation based on answers
      const recommendation = calculateRecommendation(answers);
      navigate(`/breakup/${recommendation}`);
    }
  };

  const calculateRecommendation = (userAnswers) => {
    // Count the frequency of each answer type
    const frequencies = userAnswers.reduce((acc, answer) => {
      const index = questions[userAnswers.indexOf(answer)].options.indexOf(answer);
      acc[index] = (acc[index] || 0) + 1;
      return acc;
    }, {});

    // Find the most frequent answer type
    const maxFreq = Math.max(...Object.values(frequencies));
    const mostCommonIndex = Object.keys(frequencies).find(key => frequencies[key] === maxFreq);

    // Map answer index to breakup method
    const methodMap = {
      0: 'text', // Face-to-face/Direct -> Text (closest option)
      1: 'call', // Phone calls
      2: 'text', // Writing/Texting
      3: 'emoji' // Humor & emojis
    };

    return methodMap[mostCommonIndex] || 'text';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Magic Breakup Quiz
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Answer these questions to get your personalized breakup method recommendation.
      </Typography>

      {questions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {questions[currentQuestion].question}
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion]}
                onChange={handleAnswer}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>

          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              fullWidth
            >
              {currentQuestion === questions.length - 1 ? 'Get Recommendation' : 'Next Question'}
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}

export default Quiz;