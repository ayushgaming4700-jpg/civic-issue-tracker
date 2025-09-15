import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Grid,
  Avatar,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  votes: {
    upvotes: Array<{ user: string; votedAt: string }>;
    downvotes: Array<{ user: string; votedAt: string }>;
  };
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    content: string;
    isOfficial: boolean;
    createdAt: string;
  }>;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  voteCount: number;
  tags: string[];
  images: Array<{
    url: string;
    caption: string;
    uploadedAt: string;
  }>;
  resolutionNotes?: string;
  actualResolutionDate?: string;
}

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/issues/${id}`);
      setIssue(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch issue');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/issues/${id}/vote`, { voteType });
      fetchIssue(); // Refresh issue to get updated vote counts
    } catch (error: any) {
      console.error('Vote error:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await axios.post(`/api/issues/${id}/comments`, {
        content: commentText.trim()
      });
      setCommentText('');
      fetchIssue(); // Refresh issue to get updated comments
    } catch (error: any) {
      console.error('Comment error:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;

    try {
      await axios.delete(`/api/issues/${issue._id}`);
      navigate('/issues');
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const canEditIssue = () => {
    return user && issue && (
      user.id === issue.reporter._id || 
      user.role === 'admin' || 
      user.role === 'moderator'
    );
  };

  const canDeleteIssue = () => {
    return user && issue && (
      user.id === issue.reporter._id || 
      user.role === 'admin'
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Under Review': return 'info';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !issue) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Issue not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {issue.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={issue.priority}
              color={getPriorityColor(issue.priority) as any}
              size="small"
            />
            <Chip
              label={issue.status}
              color={getStatusColor(issue.status) as any}
              size="small"
            />
            <Chip label={issue.category} variant="outlined" size="small" />
          </Box>
        </Box>
        
        {canEditIssue() && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/issues/${issue._id}/edit`)}
            >
              Edit
            </Button>
            {canDeleteIssue() && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {issue.description}
            </Typography>
          </Paper>

          {/* Images */}
          {issue.images && issue.images.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Images
              </Typography>
              <Grid container spacing={2}>
                {issue.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      component="img"
                      src={image.url}
                      alt={image.caption || `Issue image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(image.url, '_blank')}
                    />
                    {image.caption && (
                      <Typography variant="caption" color="text.secondary">
                        {image.caption}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Comments */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Comments ({issue.comments.length})
            </Typography>

            {/* Add Comment */}
            {user && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                  startIcon={submittingComment ? <CircularProgress size={20} /> : null}
                >
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Comments List */}
            {issue.comments.map((comment) => (
              <Box key={comment._id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {comment.user.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <PersonIcon />
                    )}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {comment.user.name}
                      </Typography>
                      {comment.isOfficial && (
                        <Chip label="Official" color="primary" size="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}

            {issue.comments.length === 0 && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Voting */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Vote
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Upvote">
                <IconButton
                  onClick={() => handleVote('upvote')}
                  color="primary"
                >
                  <ThumbUpIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                {issue.voteCount}
              </Typography>
              <Tooltip title="Downvote">
                <IconButton
                  onClick={() => handleVote('downvote')}
                  color="error"
                >
                  <ThumbDownIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Issue Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Issue Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {issue.location.address}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VisibilityIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {issue.viewCount} views
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CommentIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {issue.comments.length} comments
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(issue.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Updated: {formatDate(issue.updatedAt)}
            </Typography>
          </Paper>

          {/* Reporter Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Reporter
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar>
                {issue.reporter.avatar ? (
                  <img
                    src={issue.reporter.avatar}
                    alt={issue.reporter.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PersonIcon />
                )}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {issue.reporter.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {issue.reporter.email}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Assigned To */}
          {issue.assignedTo && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Assigned To
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {issue.assignedTo.avatar ? (
                    <img
                      src={issue.assignedTo.avatar}
                      alt={issue.assignedTo.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <PersonIcon />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {issue.assignedTo.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {issue.assignedTo.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {issue.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Paper>
          )}

          {/* Resolution Notes */}
          {issue.resolutionNotes && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resolution Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {issue.resolutionNotes}
              </Typography>
              {issue.actualResolutionDate && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Resolved: {formatDate(issue.actualResolutionDate)}
                </Typography>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Issue</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this issue? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteIssue} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IssueDetail;














