# Campus Event Management System

A full-stack web application for managing campus events, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🌟 Features

- **User Authentication**
  - Email verification
  - Password reset functionality
  - Role-based access (Admin/Student)
  - Secure JWT authentication

- **Event Management**
  - Create and manage events (Admin)
  - Register for events (Students)
  - Event categories (workshops, seminars, clubs)
  - Real-time capacity tracking

- **User Dashboard**
  - View registered events
  - Profile management
  - Event history
  - Preference settings

- **Admin Features**
  - Event creation and management
  - User management
  - Event statistics
  - Email notifications

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer
- Bcrypt

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Live Server

### Deployment
- Vercel (Frontend & Backend)
- MongoDB Atlas

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-event-management.git
cd campus-event-management
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Backend (.env):
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_specific_password
FRONTEND_URL=http://localhost:8080
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## 🌐 Deployment

The application is deployed on Vercel:

- Frontend: [https://campus-event-frontend.vercel.app](https://campus-event-frontend.vercel.app)
- Backend: [https://campus-event-backend.vercel.app](https://campus-event-backend.vercel.app)

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/:id/register` - Register for event

### User
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Vercel](https://vercel.com/)

