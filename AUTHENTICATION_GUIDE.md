# Authentication Guide - Face Recognition System

## 🔐 **How Authentication Works in Your System**

Your face recognition system uses **JWT (JSON Web Token) authentication** to secure admin operations. Here's how it works:

## **📋 Authentication Flow**

### **1. Login Process**
```
User → Frontend → Backend → Database
```

1. **User enters credentials** on the login page
2. **Frontend sends** email/password to `/auth/login`
3. **Backend validates** credentials against database
4. **Backend returns** JWT token if valid
5. **Frontend stores** token in localStorage
6. **Token is sent** with all subsequent requests

### **2. Protected Endpoints**
All admin operations require authentication:

- ✅ **Dataset Management**: Upload, delete, list persons
- ✅ **Student Management**: Add, view students  
- ✅ **Camera Management**: Add, view cameras
- ✅ **Attendance Logs**: View attendance records
- ✅ **Manual Training**: Trigger model retraining

### **3. Public Endpoints**
These don't require authentication:

- ✅ **Face Recognition**: `/attendance/mark` (for camera detection)
- ✅ **Home Page**: `/` (API status)

## **🔧 Authentication Implementation**

### **Backend (Python/Flask)**
```python
# JWT Token Protection
@token_required
def upload_dataset(current_user):
    # Only authenticated users can upload datasets
    pass

# Login endpoint
@app.route('/auth/login', methods=['POST'])
def login():
    # Validate credentials and return JWT token
    pass
```

### **Frontend (React/TypeScript)**
```typescript
// Authentication context
const { token, login, logout } = useAuth();

// API calls with authentication
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Authorization': `Bearer ${token}`
    };
};
```

## **👥 Default Users**

The system comes with pre-configured users (you can change these):

```python
# In src/api_backend.py
users = [
    (os.getenv("EMAIL1", "admin@example.com"), os.getenv("PWD1", "admin123")),
    (os.getenv("EMAIL2", "user2@example.com"), os.getenv("PWD2", "password2")),
    (os.getenv("EMAIL3", "user3@example.com"), os.getenv("PWD3", "password3")),
    (os.getenv("EMAIL4", "user4@example.com"), os.getenv("PWD4", "password4")),
    ("userna", "123")  # Added new user
]
```

## **🚀 How to Use Authentication**

### **1. Start the System**
```bash
# Backend
python src/api_backend.py

# Frontend  
cd ui && npm run dev
```

### **2. Login to Admin Interface**
1. Go to `http://localhost:3000`
2. You'll be redirected to login page
3. Use any of these credentials:
   - **Email**: `admin@example.com`, **Password**: `admin123`
   - **Email**: `userna`, **Password**: `123`

### **3. Access Protected Features**
After login, you can:
- ✅ **Upload datasets** (automatically trains model)
- ✅ **Manage students** and cameras
- ✅ **View attendance logs**
- ✅ **Delete persons** from dataset

## **🔒 Security Features**

### **Token-Based Security**
- **JWT tokens** expire after 4 hours
- **Automatic logout** when token expires
- **Secure headers** for all API calls
- **Password hashing** with bcrypt

### **Protected Routes**
```typescript
// Frontend route protection
if (!token) {
    return <Navigate to="/login" />;
}
```

### **API Protection**
```python
# Backend endpoint protection
@token_required
def protected_endpoint(current_user):
    # Only authenticated users can access
    pass
```

## **📱 User Experience**

### **Login Page**
- Clean, modern interface
- Email/password fields
- Error handling for invalid credentials
- Loading states during authentication

### **Admin Dashboard**
- **Sidebar navigation** with all features
- **Real-time feedback** for operations
- **Training progress** indicators
- **Success/error messages**

### **Automatic Logout**
- **Token expiration** handling
- **Redirect to login** when session expires
- **Clear localStorage** on logout

## **🛠️ Customization**

### **Change Default Users**
```python
# In src/api_backend.py, modify the users list:
users = [
    ("your-email@domain.com", "your-password"),
    ("admin@company.com", "secure-password"),
]
```

### **Set Environment Variables**
```bash
# Create .env file
EMAIL1=your-email@domain.com
PWD1=your-secure-password
```

### **Modify Token Expiration**
```python
# In src/api_backend.py
token = jwt.encode({
    'user_id': user[0],
    'email': user[1],
    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)  # 24 hours
}, app.config['SECRET_KEY'], algorithm='HS256')
```

## **🔍 Troubleshooting**

### **Common Issues**

1. **"Token missing" error**
   - Solution: Make sure you're logged in
   - Check if token is stored in localStorage

2. **"Token expired" error**
   - Solution: Logout and login again
   - Token expires after 4 hours

3. **"Invalid credentials" error**
   - Solution: Check email/password
   - Use credentials: admin@example.com / admin123 or userna / 123

4. **"Unauthorized" error**
   - Solution: Ensure you're accessing admin features
   - Some endpoints require authentication

### **Debug Authentication**
```javascript
// Check if user is logged in
console.log(localStorage.getItem('authToken'));

// Check token in browser dev tools
// Application → Local Storage → authToken
```

## **✅ Authentication Checklist**

- ✅ **Login system** working
- ✅ **JWT tokens** generated and validated
- ✅ **Protected endpoints** secured
- ✅ **Frontend routing** protected
- ✅ **Automatic logout** on token expiry
- ✅ **Error handling** for auth failures
- ✅ **User feedback** for all operations

**Your authentication system is fully functional and secure! 🔐**
