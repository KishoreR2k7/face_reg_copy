# Face Attendance System - Frontend

A modern React frontend for the Real-Time Face Attendance System with admin and user interfaces.

## 🚀 Features

### Admin Portal
- **Dashboard**: Overview with metrics, charts, and recent recognitions
- **Attendance Log**: View and manage attendance records with filters
- **Add Student**: Upload student photos and trigger face training
- **Add Camera**: Configure and test camera connections
- **Cameras List**: Monitor all cameras with real-time status updates

### User Portal
- **My Attendance**: View personal attendance records and statistics
- **Export CSV**: Download attendance data
- **Attendance Summary**: Visual statistics and trends

## 🛠️ Tech Stack

- **React 18** with Vite
- **TailwindCSS** for styling
- **React Router DOM** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // Your backend URL
```

### Authentication
The app uses mock authentication for demonstration. To integrate with real authentication:

1. Update the login logic in `src/App.jsx`
2. Modify API interceptors in `src/services/api.js`
3. Update authentication checks throughout the app

## 🎨 UI Components

### Shared Components
- `Sidebar`: Navigation sidebar with role-based menu items
- `Navbar`: Top navigation bar with user info
- `MetricCard`: Dashboard metric display cards
- `AttendanceTable`: Data table for attendance records
- `FileUploader`: Drag-and-drop file upload component
- `CameraPreview`: Camera status and preview component

### Custom Hooks
- `usePolling`: Poll data at regular intervals
- `useForm`: Form state management
- `useLoading`: Loading state management

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔄 Real-time Updates

- Camera status polling every 10 seconds
- Training progress updates
- Live dashboard metrics

## 🎯 API Integration

The frontend integrates with the following backend endpoints:

### Dashboard
- `GET /api/dashboard/summary`

### Attendance
- `GET /api/attendance`
- `POST /api/attendance/manual`

### Students
- `GET /api/students`
- `POST /api/students`
- `DELETE /api/students/:id`

### Training
- `POST /api/train`
- `GET /api/train/status/:job_id`

### Cameras
- `GET /api/cameras`
- `POST /api/cameras`
- `DELETE /api/cameras/:id`
- `GET /api/cameras/status`

### User Attendance
- `GET /api/me/attendance?student_id=`

## 🚀 Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔐 Demo Credentials

### Admin Login
- Username: `admin`
- Password: `admin123`

### Student Login
- Username: `student`
- Password: `student123`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── user/           # User pages
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # CSS and styling
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── index.html              # HTML template
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🎨 Styling

The application uses TailwindCSS with custom utility classes:
- `.btn-primary`: Primary button style
- `.btn-secondary`: Secondary button style
- `.btn-danger`: Danger button style
- `.card`: Card container style
- `.input-field`: Form input style
- `.table-header`: Table header style
- `.table-cell`: Table cell style

## 🔧 Customization

### Adding New Pages
1. Create component in appropriate directory (`pages/admin/` or `pages/user/`)
2. Add route in `App.jsx`
3. Update sidebar navigation if needed

### Adding New Components
1. Create component in `components/` directory
2. Export and import where needed
3. Follow existing component patterns

### Modifying API Calls
1. Update endpoints in `src/services/api.js`
2. Modify components to use new endpoints
3. Update error handling as needed

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check backend server is running on port 5000
   - Verify API_BASE_URL in `src/services/api.js`

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors in components

3. **Styling Issues**
   - Ensure TailwindCSS is properly configured
   - Check for conflicting CSS classes

## 📄 License

This project is part of the Face Attendance System. See the main project for license information.
