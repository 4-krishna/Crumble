import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const MagicQuiz = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Magic Quiz
        </Typography>
        <Typography variant="body1">
          Take our quiz to find the perfect breakup method
        </Typography>
      </Box>
    </Container>
  );
};

export default MagicQuiz;