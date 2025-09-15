const express = require('express');
const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/issues
// @desc    Get all issues with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn([
    'Roads & Transportation', 'Public Safety', 'Environment', 'Utilities',
    'Parks & Recreation', 'Housing', 'Education', 'Healthcare', 'Other'
  ]).withMessage('Invalid category'),
  query('status').optional().isIn(['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed', 'Rejected']).withMessage('Invalid status'),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  query('sortBy').optional().isIn(['createdAt', 'voteCount', 'priority', 'lastActivity']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10
    } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = Issue.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort(sort);

    // Add geolocation filter if coordinates provided
    if (lat && lng) {
      // Simple distance-based filtering (not using MongoDB geospatial queries)
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = radius; // in kilometers
      
      // This is a simplified approach - for production, consider using proper geospatial queries
      query = query.where({
        'location.coordinates.lat': {
          $gte: userLat - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111 km
          $lte: userLat + (maxDistance / 111)
        },
        'location.coordinates.lng': {
          $gte: userLng - (maxDistance / (111 * Math.cos(userLat * Math.PI / 180))),
          $lte: userLng + (maxDistance / (111 * Math.cos(userLat * Math.PI / 180)))
        }
      });
    }

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    const issues = await query.exec();
    const total = await Issue.countDocuments(filter);

    res.json({
      issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Increment view count
    issue.viewCount += 1;
    await issue.save();

    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: 'Server error while fetching issue' });
  }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn([
    'Roads & Transportation', 'Public Safety', 'Environment', 'Utilities',
    'Parks & Recreation', 'Housing', 'Education', 'Healthcare', 'Other'
  ]).withMessage('Invalid category'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      priority = 'Medium',
      location,
      images = [],
      tags = [],
      isAnonymous = false
    } = req.body;

    const issue = new Issue({
      title,
      description,
      category,
      priority,
      location,
      images,
      tags,
      isAnonymous,
      reporter: req.user._id
    });

    await issue.save();
    await issue.populate('reporter', 'name email avatar');

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error while creating issue' });
  }
});

// @route   PUT /api/issues/:id
// @desc    Update an issue
// @access  Private (Owner or Admin)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user can update (owner or admin)
    if (issue.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Not authorized to update this issue' });
    }

    const { title, description, priority, tags } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;

    updateData.lastActivity = new Date();

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reporter', 'name email avatar')
     .populate('assignedTo', 'name email avatar');

    res.json({
      message: 'Issue updated successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error while updating issue' });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete an issue
// @access  Private (Owner or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user can delete (owner or admin)
    if (issue.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error while deleting issue' });
  }
});

// @route   POST /api/issues/:id/vote
// @desc    Vote on an issue
// @access  Private
router.post('/:id/vote', auth, [
  body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { voteType } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await issue.addVote(req.user._id, voteType);

    res.json({
      message: 'Vote recorded successfully',
      voteCount: issue.voteCount,
      userVote: issue.hasUserVoted(req.user._id)
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error while voting' });
  }
});

// @route   POST /api/issues/:id/comments
// @desc    Add comment to an issue
// @access  Private
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, isOfficial = false } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user can add official comments
    if (isOfficial && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Only admins and moderators can add official comments' });
    }

    await issue.addComment(req.user._id, content, isOfficial);

    const updatedIssue = await Issue.findById(req.params.id)
      .populate('comments.user', 'name email avatar');

    res.json({
      message: 'Comment added successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

// @route   GET /api/issues/stats/overview
// @desc    Get issue statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        overview: {
          totalIssues: 0,
          openIssues: 0,
          inProgressIssues: 0,
          resolvedIssues: 0,
          avgResolutionTime: 0
        },
        categoryStats: []
      });
    }

    const stats = await Issue.aggregate([
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          openIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] }
          },
          inProgressIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $ne: ['$actualResolutionDate', null] },
                {
                  $divide: [
                    { $subtract: ['$actualResolutionDate', '$createdAt'] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalIssues: 0,
        openIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        avgResolutionTime: 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.json({
      overview: {
        totalIssues: 0,
        openIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        avgResolutionTime: 0
      },
      categoryStats: []
    });
  }
});

module.exports = router;

