# Admin Access Setup Guide

## Predefined Admin Credentials

```
Email:    admin@autoserve.com
Password: admin123
Name:     System Administrator
Phone:    +1-800-AUTOSERVE
```

## How to Create Admin User in Database

Once MongoDB Atlas is accessible and working, run the seed command in the backend directory:

```bash
cd backend
npm run seed
```

This will:
1. ✅ Create the admin user with the credentials above
2. ✅ Seed 10 default services (Oil Change, Tire Rotation, Brake Service, etc.)
3. ✅ Clear previous data (if any)

## Admin Credentials Configuration

All admin configuration is stored in `backend/.env`:

```env
ADMIN_EMAIL=admin@autoserve.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
ADMIN_PHONE=+1-800-AUTOSERVE
```

## Admin Features & Permissions

Once logged in as admin, navigate to `/admin` to access:

### 1. **Admin Dashboard** (`/admin`)
   - System analytics overview
   - Total bookings count
   - Pending, confirmed, in-progress, completed booking counts
   - Quick stats and charts

### 2. **Manage Bookings** (`/admin/bookings`)
   - View all system bookings
   - Filter bookings by status
   - Update booking status (Pending → Confirmed → In Progress → Completed)
   - View customer contact information
   - View vehicle details
   - Cancel bookings if needed

### 3. **Manage Services** (`/admin/services`)
   - Create new services
   - Edit existing services
   - Delete services
   - Set pricing and duration
   - Manage service categories (maintenance, repair, inspection, customization)
   - Set service availability

### 4. **Manage Customers** (`/admin/customers`)
   - View all registered customers
   - Customer contact information
   - Account status
   - Booking history per customer

### 5. **Manage Inventory** (`/admin/inventory`)
   - Track inventory items
   - Update stock levels
   - Manage parts and supplies

### 6. **View Notifications** (`/admin/notifications`)
   - System notifications
   - Alerts and updates
   - Booking notifications

### 7. **View Reviews** (`/admin/reviews`)
   - Customer reviews and ratings
   - Service ratings
   - Customer feedback

### 8. **Billing & Payments** (`/admin/billing`)
   - View payment transactions
   - Invoice management
   - Payment records

## Frontend Login Flow

### For Admin Users:
1. Go to http://localhost:5173/signin
2. Enter credentials:
   - Email: `admin@autoserve.com`
   - Password: `admin123`
3. Click "Sign In"
4. ✅ Automatically redirected to `/admin` dashboard

### For Regular Customers:
1. Go to http://localhost:5173/signin
2. Enter customer credentials
3. ✅ Automatically redirected to `/dashboard`

## Role-Based Access Control

The application has built-in role-based protection:

- **Admin Route Guard**: Only users with `role: 'admin'` can access `/admin/*` pages
- **Customer Route Guard**: Only users with `role: 'customer'` can access `/booking`, `/dashboard`, `/payments`
- **Guest Route Guard**: Unauthenticated users can only access public pages (/, /signin, /signup)

## Database Setup Status

⚠️ **Current Issue**: MongoDB connection is not accessible in the current environment

### To resolve:
1. Verify MongoDB Atlas URI is correct
2. Check network/firewall allows outbound connections to MongoDB Atlas
3. Ensure IP whitelist includes your connection IP
4. Test connection manually:
   ```bash
   npm run seed
   ```

### Once database connection is established:
```bash
# Backend directory
cd backend
npm run seed

# Output should show:
# ✓ MongoDB connected successfully
# Admin user created: admin@autoserve.com
# Successfully created 10 services:
#   - Oil Change ($45)
#   - Tire Rotation ($60)
#   ... and more
```

## Admin API Endpoints

The backend provides these admin-specific endpoints:

```
GET    /api/admin/stats           # Get dashboard statistics
GET    /api/bookings              # Get all bookings (admin only)
PUT    /api/bookings/:id          # Update booking status (admin only)
POST   /api/services              # Create service (admin only)
PUT    /api/services/:id          # Update service (admin only)
DELETE /api/services/:id          # Delete service (admin only)
GET    /api/notifications         # Get notifications (admin)
```

All admin endpoints require:
- Valid JWT token with admin role
- Proper CORS headers
- Content-Type application/json

## Testing Admin Access (Once DB is Connected)

1. **Seed the database:**
   ```bash
   cd backend && npm run seed
   ```

2. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

3. **Login with admin credentials:**
   - Navigate to http://localhost:5173/signin
   - Use admin@autoserve.com / admin123

4. **Verify admin dashboard:**
   - Should land on http://localhost:5173/admin
   - See analytics and management options

## Troubleshooting

### "MongoDB connection error"
- Check internet connection
- Verify MONGODB_URI in .env is correct
- Check MongoDB Atlas IP whitelist settings

### "Admin user already exists"
- Normal message when running seed multiple times
- Admin user will only be created once per email

### "Cannot access /admin page"
- Ensure you're logged in with admin account
- Check browser console for auth errors
- Verify token is stored in localStorage

