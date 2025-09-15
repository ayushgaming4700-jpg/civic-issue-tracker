import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import apiConfig from '../config/api';

interface CreateIssueForm {
  title: string;
  description: string;
  category: string;
  priority: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  isAnonymous: boolean;
}

const schema = yup.object({
  title: yup.string().required('Title is required').min(5, 'Title must be at least 5 characters').max(100, 'Title must not exceed 100 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters').max(1000, 'Description must not exceed 1000 characters'),
  category: yup.string().required('Category is required'),
  priority: yup.string().required('Priority is required'),
  address: yup.string().required('Address is required'),
  latitude: yup.number().required('Latitude is required').min(-90).max(90),
  longitude: yup.number().required('Longitude is required').min(-180).max(180),
  tags: yup.array().of(yup.string()).default([]),
  isAnonymous: yup.boolean().default(false)
});

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateIssueForm>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
      address: '',
      latitude: 0,
      longitude: 0,
      tags: [],
      isAnonymous: false
    }
  });

  const watchedTags = watch('tags');

  const categories = [
    'Roads & Transportation',
    'Public Safety',
    'Environment',
    'Utilities',
    'Parks & Recreation',
    'Housing',
    'Education',
    'Healthcare',
    'Other'
  ];

  const priorities = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          
          // Reverse geocoding to get address
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              if (data.localityInfo && data.localityInfo.administrative) {
                const address = data.localityInfo.administrative
                  .map((admin: any) => admin.name)
                  .join(', ');
                setValue('address', address);
              }
            })
            .catch(error => console.error('Error getting address:', error));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreateIssueForm) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const issueData = {
        ...data,
        location: {
          address: data.address,
          coordinates: {
            lat: data.latitude,
            lng: data.longitude
          }
        }
      };

      const response = await axios.post(`${apiConfig.baseURL}/api/issues`, issueData);
      
      navigate(`/issues/${response.data.issue._id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          You need to be logged in to create an issue. Please log in or register.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Report a Civic Issue
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Help improve your community by reporting issues that need attention.
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Issue Title"
                    placeholder="Brief description of the issue"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="Provide detailed information about the issue"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.priority}>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      {priorities.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address"
                      placeholder="Enter the address where the issue is located"
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  onClick={handleGetCurrentLocation}
                  sx={{ minWidth: 150 }}
                >
                  Use Current Location
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Latitude"
                        type="number"
                        error={!!errors.latitude}
                        helperText={errors.latitude?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Longitude"
                        type="number"
                        error={!!errors.longitude}
                        helperText={errors.longitude?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tags (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  Add Tag
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isAnonymous"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Report anonymously"
                  />
                )}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/issues')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Issue'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateIssue;

