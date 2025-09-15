const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Roads & Transportation',
      'Public Safety',
      'Environment',
      'Utilities',
      'Parks & Recreation',
      'Housing',
      'Education',
      'Healthcare',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Under Review', 'Resolved', 'Closed', 'Rejected'],
    default: 'Open'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180
      }
    },
    city: String,
    state: String,
    zipCode: String
  },
  images: [{
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isOfficial: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  estimatedResolutionDate: Date,
  actualResolutionDate: Date,
  resolutionNotes: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  relatedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Note: Geospatial index is disabled to avoid GeoJSON format requirements
// issueSchema.index({ 'location.coordinates': '2dsphere' }); // Temporarily disabled
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ 'votes.upvotes': 1 });
issueSchema.index({ tags: 1 });

// Virtual for vote count
issueSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to check if user has voted
issueSchema.methods.hasUserVoted = function(userId) {
  const upvoted = this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  const downvoted = this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  return { upvoted, downvoted };
};

// Method to add vote
issueSchema.methods.addVote = function(userId, voteType) {
  const { upvoted, downvoted } = this.hasUserVoted(userId);
  
  if (voteType === 'upvote') {
    if (upvoted) {
      this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    } else {
      if (downvoted) {
        this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
      }
      this.votes.upvotes.push({ user: userId });
    }
  } else if (voteType === 'downvote') {
    if (downvoted) {
      this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    } else {
      if (upvoted) {
        this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
      }
      this.votes.downvotes.push({ user: userId });
    }
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Method to add comment
issueSchema.methods.addComment = function(userId, content, isOfficial = false) {
  this.comments.push({
    user: userId,
    content,
    isOfficial
  });
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema);


