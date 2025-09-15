const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile with statistics
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // Get user's issue statistics
    const issueStats = await Issue.aggregate([
      { $match: { reporter: req.user._id } },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          openIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] }
          },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          totalVotes: {
            $sum: { $add: ['$votes.upvotes', '$votes.downvotes'] }
          }
        }
      }
    ]);

    res.json({
      user,
      stats: issueStats[0] || {
        totalIssues: 0,
        openIssues: 0,
        resolvedIssues: 0,
        totalVotes: 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   GET /api/users/issues
// @desc    Get user's issues
// @access  Private
router.get('/issues', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { reporter: req.user._id };
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
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
    console.error('Get user issues error:', error);
    res.status(500).json({ message: 'Server error while fetching user issues' });
  }
});

// @route   GET /api/users/voted-issues
// @desc    Get issues user has voted on
// @access  Private
router.get('/voted-issues', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const issues = await Issue.find({
      $or: [
        { 'votes.upvotes.user': req.user._id },
        { 'votes.downvotes.user': req.user._id }
      ]
    })
      .populate('reporter', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ lastActivity: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Issue.countDocuments({
      $or: [
        { 'votes.upvotes.user': req.user._id },
        { 'votes.downvotes.user': req.user._id }
      ]
    });

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
    console.error('Get voted issues error:', error);
    res.status(500).json({ message: 'Server error while fetching voted issues' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('notifications.email').optional().isBoolean().withMessage('Email notification preference must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notification preference must be boolean'),
  body('categories').optional().isArray().withMessage('Categories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notifications, categories } = req.body;
    const updateData = {};

    if (notifications) {
      updateData['preferences.notifications'] = {
        ...req.user.preferences.notifications,
        ...notifications
      };
    }

    if (categories) {
      updateData['preferences.categories'] = categories;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete user's issues
    await Issue.deleteMany({ reporter: req.user._id });

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

module.exports = router;


