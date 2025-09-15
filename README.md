# Civic Issue Tracker

A comprehensive crowdsourced civic issue reporting and resolution system built with React, Node.js, Express, and MongoDB. This platform allows citizens to report civic issues, track their resolution progress, and engage with their local government and community.

## Features

### 🏛️ Citizen Features
- **Issue Reporting**: Report civic issues with detailed descriptions, photos, and location data
- **Issue Tracking**: Track the status and progress of reported issues
- **Voting System**: Upvote/downvote issues to prioritize community concerns
- **Comments & Discussion**: Engage in discussions about civic issues
- **User Profiles**: Manage personal information and preferences
- **Search & Filter**: Find issues by category, status, location, and keywords
- **Geolocation**: Automatic location detection and mapping

### 👨‍💼 Admin Features
- **Dashboard**: Comprehensive overview of system statistics and metrics
- **Issue Management**: Update issue status, priority, and assign to staff
- **User Management**: Manage user accounts and roles
- **Analytics**: Track resolution times, category trends, and user engagement
- **Moderation**: Moderate comments and manage content

### 🔧 Technical Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live updates for issue status changes
- **Image Upload**: Support for multiple image uploads with Cloudinary integration
- **Email Notifications**: Automated email notifications for status updates
- **Security**: JWT authentication, rate limiting, and input validation
- **API Documentation**: RESTful API with comprehensive endpoints

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Nodemailer** - Email notifications
- **Socket.io** - Real-time communication

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Leaflet** - Interactive maps

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd civic-issue-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civic-issues
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@civicissues.com
```

5. Start the server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Issues
- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/vote` - Vote on issue
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/stats/overview` - Get issue statistics

### Users
- `GET /api/users/profile` - Get user profile with stats
- `GET /api/users/issues` - Get user's issues
- `GET /api/users/voted-issues` - Get issues user voted on
- `PUT /api/users/preferences` - Update user preferences
- `DELETE /api/users/account` - Delete user account

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/issues` - Get all issues for admin
- `PUT /api/admin/issues/:id/status` - Update issue status
- `PUT /api/admin/issues/:id/priority` - Update issue priority
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## Usage

### For Citizens

1. **Register/Login**: Create an account or sign in
2. **Report Issues**: Click "Report an Issue" to create a new civic issue
3. **Browse Issues**: View all reported issues with filtering options
4. **Vote & Comment**: Engage with issues by voting and commenting
5. **Track Progress**: Monitor the status of your reported issues

### For Administrators

1. **Access Dashboard**: Login with admin credentials
2. **Manage Issues**: Update status, priority, and assign issues
3. **User Management**: Manage user accounts and roles
4. **Analytics**: View system statistics and trends
5. **Moderation**: Moderate content and comments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@civicissues.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with government systems
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API rate limiting and caching
- [ ] Automated issue categorization
- [ ] Integration with social media platforms

## Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- Cloudinary for image storage
- The open-source community for various packages and tools














