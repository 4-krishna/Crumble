import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const tiers = [
  {
    title: 'Free',
    price: '0',
    description: ['Basic features', '3 Breakup Methods', 'Community Support'],
    buttonText: 'Current Plan',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    subheader: 'Most Popular',
    price: '9.99',
    description: [
      'All Free features',
      'Unlimited Breakup Methods',
      'Priority Support',
      'Ghost Mode Pro',
      'Advanced Analytics',
    ],
    buttonText: 'Upgrade Now',
    buttonVariant: 'contained',
  },
  {
    title: 'Premium',
    price: '19.99',
    description: [
      'All Pro features',
      'Personalized Coaching',
      'Exclusive Content',
      'VIP Support',
      'Early Access to Features',
    ],
    buttonText: 'Get Premium',
    buttonVariant: 'contained',
  },
];

function Subscription() {
  const theme = useTheme();
  const [selectedTier, setSelectedTier] = useState(null);

  const handleSubscribe = (tier) => {
    setSelectedTier(tier);
    // TODO: Implement payment integration
    console.log(`Selected ${tier.title} plan`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography
          component="h1"
          variant="h2"
          color="text.primary"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Choose Your Plan
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Unlock premium features to enhance your healing journey
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="flex-end">
        {tiers.map((tier) => (
          <Grid
            item
            key={tier.title}
            xs={12}
            sm={tier.title === 'Pro' ? 12 : 6}
            md={4}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
                },
                ...(tier.title === 'Pro' && {
                  border: `2px solid ${theme.palette.primary.main}`,
                  position: 'relative',
                }),
              }}
            >
              <CardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypographyProps={{ align: 'center', fontWeight: 700 }}
                subheaderTypographyProps={{ align: 'center' }}
                action={tier.title === 'Pro' ? <StarIcon color="primary" /> : null}
                sx={{
                  backgroundColor: tier.title === 'Pro' ? 'rgba(255,83,177,0.05)' : 'transparent',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                  <Typography component="h2" variant="h3" color="text.primary">
                    ${tier.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    /month
                  </Typography>
                </Box>
                {tier.description.map((line) => (
                  <Typography
                    component="li"
                    variant="subtitle1"
                    align="center"
                    key={line}
                    sx={{ mt: 1 }}
                  >
                    {line}
                  </Typography>
                ))}
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant}
                  onClick={() => handleSubscribe(tier)}
                  sx={{
                    mx: 2,
                    py: 1,
                    fontSize: '1.1rem',
                    ...(tier.title === 'Pro' && {
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: 'white',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      },
                    }),
                  }}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Subscription;