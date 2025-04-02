import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function BreakupQuiz() {
  const navigate = useNavigate();
  const { currentUser, updatePoints } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const questions = [
    {
      id: 1,
      question: 'How long was your relationship?',
      options: [
        { value: 'short', label: 'Less than 6 months' },
        { value: 'medium', label: '6 months to 2 years' },
        { value: 'long', label: 'More than 2 years' }
      ]
    },
    {
      id: 2,
      question: 'How would you describe your communication style?',
      options: [
        { value: 'direct', label: 'Direct and straightforward' },
        { value: 'emotional', label: 'Emotional and expressive' },
        { value: 'careful', label: 'Careful and diplomatic' }
      ]
    },
    {
      id: 3,
      question: 'What is your main reason for breaking up?',
      options: [
        { value: 'incompatible', label: 'Different life goals/values' },
        { value: 'feelings', label: 'Lost feelings/grew apart' },
        { value: 'trust', label: 'Trust issues/betrayal' }
      ]
    },
    {
      id: 4,
      question: 'How do you handle confrontation?',
      options: [
        { value: 'face', label: 'Prefer face-to-face discussions' },
        { value: 'avoid', label: 'Prefer to avoid direct confrontation' },
        { value: 'written', label: 'Prefer written communication' }
      ]
    },
    {
      id: 5,
      question: 'How do you think they will react?',
      options: [
        { value: 'understanding', label: 'Understanding and accepting' },
        { value: 'emotional', label: 'Emotional or upset' },
        { value: 'unpredictable', label: 'Unpredictable or volatile' }
      ]
    },
    {
      id: 6,
      question: 'What kind of relationship did you have?',
      options: [
        { value: 'serious', label: 'Serious and committed' },
        { value: 'casual', label: 'Casual or undefined' },
        { value: 'complicated', label: 'Complicated or on/off' }
      ]
    },
    {
      id: 7,
      question: 'How often do you see each other in person?',
      options: [
        { value: 'often', label: 'Several times a week' },
        { value: 'sometimes', label: 'Once a week or less' },
        { value: 'rarely', label: 'Mainly long-distance/online' }
      ]
    },
    {
      id: 8,
      question: 'What is your desired outcome?',
      options: [
        { value: 'friends', label: 'Remain friends if possible' },
        { value: 'clean', label: 'Clean break, no contact' },
        { value: 'open', label: 'Keep communication open' }
      ]
    },
    {
      id: 9,
      question: 'How do you express yourself best?',
      options: [
        { value: 'verbal', label: 'Through speaking' },
        { value: 'written', label: 'Through writing' },
        { value: 'creative', label: 'Through creative expression' }
      ]
    },
    {
      id: 10,
      question: 'What is your priority in this breakup?',
      options: [
        { value: 'clarity', label: 'Being clear and direct' },
        { value: 'kindness', label: 'Being kind and gentle' },
        { value: 'peace', label: 'Maintaining peace' }
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateResult = async () => {
    // Simple scoring system
    let scores = {
      call: 0,
      text: 0,
      emoji: 0
    };

    // Analyze answers to determine best method
    if (answers[1] === 'long' || answers[6] === 'serious') scores.call += 2;
    if (answers[2] === 'direct') scores.call += 2;
    if (answers[4] === 'face') scores.call += 3;
    if (answers[9] === 'verbal') scores.call += 2;

    if (answers[2] === 'careful') scores.text += 2;
    if (answers[4] === 'written') scores.text += 3;
    if (answers[7] === 'rarely') scores.text += 2;
    if (answers[9] === 'written') scores.text += 2;

    if (answers[2] === 'emotional') scores.emoji += 2;
    if (answers[6] === 'casual') scores.emoji += 2;
    if (answers[9] === 'creative') scores.emoji += 3;
    if (answers[10] === 'kindness') scores.emoji += 2;

    // Determine highest score
    const method = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Save quiz responses
    try {
      const response = await fetch('/api/quiz-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          answers
        })
      });

      if (response.ok) {
        // Award points for completing the quiz
        await updatePoints(20);
      }
    } catch (err) {
      console.error('Failed to save quiz responses:', err);
    }

    return method;
  };

  const handleNext = async () => {
    if (activeStep === questions.length - 1) {
      const recommendedMethod = await calculateResult();
      setResult(recommendedMethod);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const currentQuestion = questions[activeStep];

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Magic Recommendation Quiz
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Answer these questions to get your personalized breakup method
      </Typography>

      {!result ? (
        <>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {questions.map((_, index) => (
              <Step key={index}>
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {currentQuestion.question}
                </Typography>
              </FormLabel>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                {activeStep === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Paper>
        </>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Your Recommended Breakup Method:
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              {result === 'call' && '📞 Breakup Through Call'}
              {result === 'text' && '💬 Breakup Through Text'}
              {result === 'emoji' && '💔 Breakup Through Emoji'}
            </Typography>
            <Typography variant="body1" paragraph>
              Based on your answers, we recommend using this method for your situation.
              This approach aligns best with your communication style and relationship context.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Remember, this is a suggestion based on your responses.
              Choose the method that feels most comfortable for you.
            </Alert>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              onClick={() => navigate(`/breakup/${result}`)}
              fullWidth
            >
              View {result.charAt(0).toUpperCase() + result.slice(1)} Breakup Methods
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}

export default BreakupQuiz;