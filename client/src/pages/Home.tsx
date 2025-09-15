import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface IssueStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
}

interface CategoryStat {
  _id: string;
  count: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/issues/stats/overview');
      setStats(response.data.overview);
      setCategoryStats(response.data.categoryStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          padding: 6,
          borderRadius: 2,
          textAlign: 'center',
          mb: 4
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Report Civic Issues
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Help make your community better by reporting and tracking civic issues
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create-issue')}
          sx={{
            backgroundColor: 'white',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Report an Issue
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats?.totalIssues || 0}
              </Typography>
              <Typography color="text.secondary">
                Total Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats?.openIssues || 0}
              </Typography>
              <Typography color="text.secondary">
                Open Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats?.resolvedIssues || 0}
              </Typography>
              <Typography color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <LocationIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats?.avgResolutionTime ? Math.round(stats.avgResolutionTime) : 0}
              </Typography>
              <Typography color="text.secondary">
                Avg. Resolution (days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Stats */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Issues by Category
        </Typography>
        <Grid container spacing={2}>
          {categoryStats.map((category) => (
            <Grid item key={category._id}>
              <Chip
                label={`${category._id} (${category.count})`}
                variant="outlined"
                color="primary"
                size="medium"
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Ready to make a difference?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Join thousands of citizens who are actively improving their communities
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create-issue')}
            sx={{ minWidth: 200 }}
          >
            Report an Issue
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/issues')}
            sx={{ minWidth: 200 }}
          >
            Browse Issues
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;

