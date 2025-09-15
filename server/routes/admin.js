const express = require('express');
const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalIssues,
      recentIssues,
      categoryStats,
      statusStats,
      priorityStats,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Issue.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt')
    ]);

    res.json({
      overview: {
        totalUsers,
        totalIssues,
        recentIssues
      },
      categoryStats,
      statusStats,
      priorityStats,
      recentUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/issues
// @desc    Get all issues for admin management
// @access  Private (Admin)
router.get('/issues', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed', 'Rejected']).withMessage('Invalid status'),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  query('category').optional().isIn([
    'Roads & Transportation', 'Public Safety', 'Environment', 'Utilities',
    'Parks & Recreation', 'Housing', 'Education', 'Healthcare', 'Other'
  ]).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const issues = await Issue.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

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
    console.error('Admin get issues error:', error);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
});

// @route   PUT /api/admin/issues/:id/status
// @desc    Update issue status
// @access  Private (Admin)
router.put('/issues/:id/status', adminAuth, [
  body('status').isIn(['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed', 'Rejected']).withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
  body('resolutionNotes').optional().isString().withMessage('Resolution notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, assignedTo, resolutionNotes } = req.body;
    const updateData = { status, lastActivity: new Date() };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status === 'Resolved' || status === 'Closed') {
      updateData.actualResolutionDate = new Date();
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reporter', 'name email avatar')
     .populate('assignedTo', 'name email avatar');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({
      message: 'Issue status updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ message: 'Server error while updating issue status' });
  }
});

// @route   PUT /api/admin/issues/:id/priority
// @desc    Update issue priority
// @access  Private (Admin)
router.put('/issues/:id/priority', adminAuth, [
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { priority } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { priority, lastActivity: new Date() },
      { new: true, runValidators: true }
    ).populate('reporter', 'name email avatar')
     .populate('assignedTo', 'name email avatar');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({
      message: 'Issue priority updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue priority error:', error);
    res.status(500).json({ message: 'Server error while updating issue priority' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin)
router.get('/users', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['citizen', 'admin', 'moderator']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', adminAuth, [
  body('role').isIn(['citizen', 'admin', 'moderator']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Private (Admin)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's issues
    await Issue.deleteMany({ reporter: req.params.id });

    // Delete user account
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

module.exports = router;


