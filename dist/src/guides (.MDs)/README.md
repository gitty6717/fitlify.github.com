# Fitlify - AI Fitness Planner

A modern, fully-functional multi-page fitness application with authentication, Google login, and AI-powered workout planning.

## 🚀 Features

### Authentication System
- **User Registration & Login** - Complete signup and login functionality
- **Google OAuth Integration** - One-click Google authentication
- **Session Management** - Secure user sessions with logout
- **Data Persistence** - All user data stored and managed securely

### Fitness Planning
- **AI Workout Generation** - Personalized workout plans based on user goals
- **Comprehensive Fitness Form** - Detailed user fitness assessment
- **Dynamic Plan Creation** - Plans adapt to fitness level, goals, and equipment
- **Progress Tracking** - Monitor workout history and achievements

### User Dashboard
- **Welcome Interface** - Personalized dashboard with user stats
- **Quick Actions** - Easy access to create plans, view profile
- **Recent Activity** - Display of latest workout plans
- **Fitness Tips** - Educational content for users

### Profile Management
- **Complete User Profile** - View and manage all fitness data
- **Data Editing** - Update fitness information anytime
- **Workout History** - Track all generated plans
- **Account Settings** - Export data, change password, delete account

### Modern UI/UX
- **Responsive Design** - Works perfectly on all devices
- **Modern Styling** - Clean, professional fitness-themed interface
- **Smooth Animations** - Engaging micro-interactions
- **Accessibility** - WCAG compliant design

## 🏗️ Architecture

### Frontend Structure
```
fitlify/
├── home/           # Landing page with Google login
├── login/          # User authentication
├── signup/         # User registration
├── dashboard/      # Main user dashboard
├── form/           # Fitness data collection
├── plan/           # Workout plan display
├── profile/        # User profile management
├── backend/        # Python backend API
├── database/       # JSON data storage
└── assets/         # Static assets
```

### Backend Architecture
- **Python Backend** - RESTful API using Python
- **JSON Database** - Simple file-based data storage
- **User Management** - Complete CRUD operations
- **Data Validation** - Input sanitization and validation

### Data Flow
1. User authentication → Session creation
2. Fitness form → Data validation → Storage
3. AI generation → Workout plan creation
4. Profile management → Data updates
5. Dashboard → Real-time stats display

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript ES6+** - Modern JavaScript features
- **Google Identity Services** - OAuth integration
- **Responsive Design** - Mobile-first approach

### Backend
- **Python 3** - Backend API server
- **JSON** - Data storage format
- **REST API** - Stateless API design
- **File System** - Simple database implementation

### Design
- **Inter Font** - Modern typography
- **CSS Grid & Flexbox** - Layout systems
- **CSS Variables** - Consistent theming
- **Animations** - Smooth transitions

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for backend functionality)
- Local web server (optional but recommended)

### Installation

1. **Clone/Download the project**
   ```bash
   # Extract the fitlify folder to your desired location
   ```

2. **Set up the backend** (optional for demo)
   ```bash
   cd backend
   python pydb.py
   ```

3. **Run the application**
   - Option 1: Open `home/home.html` directly in browser
   - Option 2: Use a local web server:
     ```bash
     # Using Python
     python -m http.server 8000
     # Then visit http://localhost:8000/home/home.html
     ```

### Google OAuth Setup (Optional)
1. Get Google Client ID from Google Cloud Console
2. Replace `your-google-client-id.apps.googleusercontent.com` in:
   - `home/home.js`
   - `login/login.js`
   - `signup/signup.js`

## 📱 Usage Guide

### 1. Create Account
- Visit the home page
- Click "Sign Up" or "Continue with Google"
- Fill in registration details
- Verify and complete signup

### 2. Complete Fitness Form
- Navigate to "Create Workout Plan"
- Fill in personal information (age, height, weight)
- Select fitness level and goals
- Specify workout frequency and equipment
- Add any injuries or limitations

### 3. Get Your Plan
- Submit the fitness form
- AI generates personalized workout plan
- View detailed exercises, sets, and reps
- Download or save the plan

### 4. Track Progress
- Visit dashboard for overview
- Check profile for detailed stats
- Generate new plans as needed
- Monitor workout history

## 🔧 Configuration

### Backend Settings
Edit `backend/pydb.py` to modify:
- Database file location
- User validation rules
- Workout plan algorithms

### Frontend Customization
Modify CSS files to change:
- Color scheme (CSS variables)
- Typography and spacing
- Animation speeds
- Responsive breakpoints

## 📊 Data Structure

### User Data
```json
{
  "id": "unique-user-id",
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed-password",
  "google_account": false,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T00:00:00Z"
}
```

### Fitness Data
```json
{
  "age": 25,
  "height": 175,
  "weight": 70,
  "fitness_level": "intermediate",
  "goal": "gain_muscle",
  "workout_days": 4,
  "equipment": ["dumbbells", "bench"],
  "injuries": "",
  "notes": "Want to focus on upper body"
}
```

### Workout Plan
```json
{
  "name": "Muscle Building Plan",
  "weekly_split": "Upper/Lower Split",
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 4,
      "reps": 12,
      "rest": 90
    }
  ],
  "fitness_level": "intermediate",
  "workout_days": 4,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🎯 Features Demonstration

### Authentication Flow
1. User lands on home page
2. Clicks "Sign Up" or "Continue with Google"
3. Completes registration or OAuth flow
4. Redirected to dashboard

### Workout Plan Generation
1. User fills comprehensive fitness form
2. Data validated and sent to backend
3. AI algorithm generates personalized plan
4. Plan displayed with exercises and details

### Profile Management
1. User accesses profile page
2. Views all fitness data and plans
3. Can edit data or regenerate plans
4. Export or delete account options

## 🔒 Security Features

### Frontend Security
- Input validation and sanitization
- XSS prevention
- Secure session management
- HTTPS ready (for production)

### Backend Security
- Data validation
- Error handling
- Secure data storage
- Password hashing (production)

### Privacy Protection
- Local data storage option
- Data export functionality
- Account deletion
- No third-party tracking

## 🚀 Deployment

### Local Development
```bash
# Run with Python server
python -m http.server 8000

# Or use Node.js
npx serve .

# Or any other local server
```

### Production Deployment
1. Upload to web server
2. Configure Python backend
3. Set up Google OAuth
4. Enable HTTPS
5. Configure domain and SSL

## 🐛 Troubleshooting

### Common Issues
1. **Backend not working** - Check Python installation
2. **Google OAuth failing** - Verify client ID configuration
3. **Data not saving** - Check file permissions
4. **Mobile issues** - Test responsive design

### Debug Mode
Open browser developer tools to:
- Check console errors
- Monitor network requests
- Inspect local storage
- Debug JavaScript issues

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- Use semantic HTML
- Follow CSS conventions
- Write clean JavaScript
- Document functions
- Test all features

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check troubleshooting section
2. Review code comments
3. Test in different browsers
4. Verify backend setup

---

**Fitlify** - Your AI-powered fitness companion for achieving your health goals! 💪
#   f i t l i f y . g i t h u b . c o m  
 #   f i t l i f y . g i t h u b . c o m  
 