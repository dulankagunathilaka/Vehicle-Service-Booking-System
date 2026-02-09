# AutoServe - Vehicle Service Booking System

A modern MERN Stack web application that streamlines vehicle service appointment booking with complete user workflows and comprehensive management systems.

## Complete Booking Process

### User Journey

**1. User Registration (/signup)**
- Create account with email, name, phone, password
- Password hashed with bcryptjs
- JWT token generated automatically
- User data stored in MongoDB
- Automatic login after registration

**2. User Authentication (/signin)**
- Login with email and password
- JWT token issued and stored in localStorage
- Session maintained for authenticated requests
- Option to remember login details

**3. Browse Services (Homepage /)**
- View all available vehicle services
- Service categories: Maintenance, Repair, Inspection, Customization
- Display pricing, duration, and descriptions
- Responsive card layout

**4. Book Appointment (/booking) - 4-Step Wizard**

Step 1: Select Service
- Choose from available services
- View service details, price, and duration
- Form validation

Step 2: Vehicle Information
- Enter vehicle make and model
- Year of manufacture
- License plate number
- Vehicle color (optional)
- Real-time form validation

Step 3: Date & Time Selection
- Pick future booking date only
- Choose from 8 predefined time slots (9 AM - 5 PM)
- Availability verification

Step 4: Review & Confirm
- Review all booking details
- Add special notes or requests
- Final confirmation
- Submit booking to backend

**5. Customer Dashboard (/dashboard)**
- View all personal bookings
- Track real-time booking status
- Cancel pending/confirmed bookings
- View appointment details and pricing
- Vehicle information display
- Special notes visibility

**Booking Status Lifecycle:**
- **Pending**: Awaiting confirmation (user can cancel)
- **Confirmed**: Approved by service center
- **In Progress**: Service is being performed
- **Completed**: Service finished successfully
- **Cancelled**: User or admin cancelled booking

**6. Admin Dashboard (/admin)**
- View all system bookings
- Filter bookings by status
- Update booking status in real-time
- View customer contact information
- Vehicle details inspection
- System analytics:
  - Total bookings count
  - Pending bookings count
  - Confirmed bookings count
  - In progress count
  - Completed count

## Pages & Routes

| Route | Component | Access Level | Purpose |
|-------|-----------|--------------|---------|
| / | HomePage | Public | Homepage with services and features |
| /signup | SignUp | Public | User registration |
| /signin | SignIn | Public | User login |
| /booking | BookingPage | Authenticated | 4-step booking wizard |
| /dashboard | CustomerDashboard | Customer | View personal bookings |
| /admin | AdminDashboard | Admin | Manage all bookings |

## Key Features

- Professional responsive UI design
- 4-step guided booking process with validation
- Real-time status tracking
- Customer booking dashboard
- Admin management dashboard
- Secure JWT authentication
- Role-based access control (Customer/Admin)
- Complete service management
- Status-based filtering
- Mobile-friendly interface
- Gradient modern styling
- Form validation and error handling
- Loading states and confirmations

## Technology Stack

**Frontend:**
- React 18 with Vite for fast development
- React Router DOM for navigation
- Tailwind CSS for responsive styling
- Axios for HTTP requests
- JavaScript ES6+

**Backend:**
- Node.js runtime
- Express.js server framework
- MongoDB Atlas database
- JWT (jsonwebtoken) for authentication
- bcryptjs for password security
- CORS for cross-origin requests
- Express validator for input validation

## Quick Start

### Backend Setup
```bash
cd backend
npm install

# Create .env file with:
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5174

npm run dev  # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file with:
VITE_API_URL=http://localhost:5000/api

npm run dev  # Runs on http://localhost:5174
```

## API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get authenticated user (protected)
```

### Services
```
GET    /api/services           # Get all services
GET    /api/services/:id       # Get single service
POST   /api/services           # Create service (admin)
PUT    /api/services/:id       # Update service (admin)
DELETE /api/services/:id       # Delete service (admin)
```

### Bookings
```
POST   /api/bookings           # Create booking (authenticated)
GET    /api/bookings           # Get all bookings (admin)
GET    /api/bookings/my-bookings  # Get user bookings (authenticated)
GET    /api/bookings/:id       # Get booking details (authorized)
PUT    /api/bookings/:id       # Update booking status (admin)
DELETE /api/bookings/:id       # Cancel booking (authorized)
```

## User Roles & Permissions

### Customer Role
- Register and login
- Browse all services
- Create new bookings
- View personal bookings
- Cancel pending/confirmed bookings
- Track booking status
- Add notes to bookings
- Access customer dashboard

### Admin Role
- Login to admin panel
- View all system bookings
- Update booking status
- Create new services
- Edit existing services
- Delete services
- Access admin dashboard
- View analytics

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String ('customer' or 'admin'),
  isActive: Boolean,
  timestamps: true
}
```

### Service Model
```javascript
{
  name: String,
  description: String,
  category: String ('maintenance', 'repair', 'inspection', 'customization'),
  price: Number,
  duration: Number (minutes),
  isAvailable: Boolean,
  timestamps: true
}
```

### Booking Model
```javascript
{
  customerId: ObjectId (references User),
  serviceId: ObjectId (references Service),
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    color: String
  },
  bookingDate: Date,
  timeSlot: String,
  status: String ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
  notes: String (optional),
  totalPrice: Number,
  timestamps: true
}
```

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT-based token authentication
- Protected API endpoints with middleware
- Role-based authorization checks
- Secure token storage in localStorage
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Error handling and logging

## Project Structure

```
frontend/
├── public/images/           # Static images
├── src/
│   ├── pages/
│   │   ├── SignUp.jsx      # Registration form
│   │   ├── SignIn.jsx      # Login form
│   │   ├── Booking.jsx     # 4-step booking wizard
│   │   ├── CustomerDashboard.jsx  # User bookings
│   │   └── AdminDashboard.jsx     # Admin management
│   ├── services/           # API client code
│   ├── styles/             # CSS and Tailwind
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point

backend/
├── src/
│   ├── models/
│   │   ├── User.js         # User schema & methods
│   │   ├── Service.js      # Service schema
│   │   └── Booking.js      # Booking schema
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT & role auth
│   ├── routes/
│   │   ├── auth.js         # Auth endpoints
│   │   ├── services.js     # Service endpoints
│   │   └── bookings.js     # Booking endpoints
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   └── index.js            # Server entry point
```

## Version

1.0.0 - February 9, 2026
