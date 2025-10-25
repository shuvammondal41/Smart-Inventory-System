# Smart Inventory & Billing Management System

A full-stack ERP solution for managing inventory, sales, and customer data with real-time stock tracking and billing functionality.

## Overview

This system helps small to medium businesses automate their inventory management and billing processes. It includes features for product management, customer tracking, invoice generation, stock alerts, and sales analytics.

**Live Demo**: [Coming Soon]
**Video Demo**: [Coming Soon]

### Key Metrics
- **15+ RESTful API Endpoints**
- **8 Core Database Entities**
- **6 Major Modules** (Auth, Products, Billing, Inventory, Analytics, Customers)
- **2-Tier Alert System** (Low Stock/Out of Stock)
- **5+ KPI Visualizations**

## Tech Stack

### Backend
- **.NET 9.0** - Web API
- **MySQL 8.0** - Database
- **Entity Framework Core** - ORM
- **JWT** - Authentication
- **BCrypt** - Password hashing

### Frontend
- **Angular 17** - Framework (Standalone Components)
- **TypeScript** - Language
- **RxJS** - Reactive programming
- **Template-driven Forms** - Form handling

## Project Structure

```
Smart Inventory & Billing Management System/
├── Backend/
│   └── SmartInventory.API/
│       ├── Controllers/          # API endpoints
│       ├── Models/               # Database models
│       ├── DTOs/                 # Data transfer objects
│       ├── Services/             # Business logic
│       ├── Data/                 # Database context
│       └── appsettings.json      # Configuration
├── Frontend/
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   ├── services/     # API services
│       │   │   ├── models/       # TypeScript interfaces
│       │   │   └── guards/       # Route guards
│       │   └── features/         # Feature modules
│       │       ├── auth/         # Login/Register
│       │       ├── dashboard/    # Main dashboard
│       │       ├── products/     # Product management
│       │       ├── inventory/    # Stock management
│       │       ├── billing/      # POS/Billing
│       │       ├── invoices/     # Invoice history
│       │       ├── customers/    # Customer management
│       │       └── analytics/    # Reports & analytics
│       └── styles.css            # Global styles
└── database-schema.sql           # Database setup
```

## Features

### 1. Product Management
- Add, edit, delete products
- Categorize products
- Track stock levels
- Set minimum stock thresholds
- Search and filter products
- Low stock alerts

### 2. Billing / Point of Sale
- Create invoices
- Add multiple items to cart
- Real-time total calculation
- Tax and discount management
- Customer selection
- Stock validation
- Auto stock deduction

### 3. Inventory Management
- Real-time stock tracking
- Stock alerts
- Inventory history
- Category-based organization

### 4. Customer Management
- Add/edit customers
- Track customer purchase history
- Customer contact information
- Search functionality

### 5. Analytics & Reports
- Dashboard with key metrics
- Sales trends (monthly/daily)
- Top selling products
- Stock alerts
- Revenue analytics

### 6. Authentication & Security
- User registration/login
- JWT token-based auth
- Password encryption with BCrypt
- Route protection
- Auto logout on token expiry

## Database Schema

### Tables
- **Users** - User accounts
- **Products** - Product information
- **Categories** - Product categories
- **Customers** - Customer details
- **Invoices** - Sales invoices
- **InvoiceItems** - Invoice line items
- **StockAlerts** - Low stock notifications

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- .NET SDK 9.0
- MySQL Server 8.0
- Angular CLI

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE smart_inventory;
```

2. Import schema:
```bash
mysql -u root -p smart_inventory < database-schema.sql
```

3. Update connection string in `Backend/SmartInventory.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=smart_inventory;user=root;password=YOUR_PASSWORD"
  }
}
```

### Backend Setup

1. Navigate to backend folder:
```bash
cd Backend/SmartInventory.API
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Run the API:
```bash
dotnet run
```

Backend will start at: `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will start at: `http://localhost:4200`

## Default Login

After running the database schema, use these credentials:

- **Email**: admin@test.com
- **Password**: Admin123!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get invoice details
- `POST /api/invoices` - Create invoice
- `DELETE /api/invoices/{id}` - Delete invoice

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/analytics/top-products` - Top selling products
- `GET /api/analytics/monthly-sales` - Monthly sales report
- `GET /api/analytics/stock-alerts` - Stock alerts
- `PUT /api/analytics/stock-alerts/{id}/resolve` - Resolve alert

## How It Works

### Authentication Flow
1. User registers/logs in via `/auth` page
2. Backend validates credentials and generates JWT token
3. Token stored in browser and sent with every API request
4. Auth guard protects routes - redirects to login if no token

### Billing Workflow
1. Select customer (optional)
2. Search and add products to cart
3. Adjust quantities
4. System validates stock availability
5. Apply tax and discount
6. Create invoice
7. Stock automatically deducted
8. Invoice saved to database

### Stock Alert System
1. Products have `minStockLevel` property
2. When stock falls below minimum, alert created automatically
3. Dashboard shows active alerts
4. Alerts can be resolved manually

### Real-time Updates
- Cart totals update on input change
- Stock quantities refresh after invoice creation
- Alerts appear immediately on dashboard
- Search filters products in real-time

## Key Components

### Frontend Services
- **AuthService** - Authentication logic
- **ProductService** - Product CRUD operations
- **InvoiceService** - Invoice management
- **CustomerService** - Customer operations
- **CategoryService** - Category management
- **AnalyticsService** - Reports and analytics

### Backend Services
- **ProductService** - Product business logic
- **InvoiceService** - Invoice processing with transactions
- **AnalyticsService** - Data aggregation and reports

### Guards
- **AuthGuard** - Protects authenticated routes
- Auto-redirects to login if not authenticated

## Development Notes

### Code Style
- Casual variable names for readability
- Console.log statements for debugging
- Inline comments explaining logic
- TODO markers for future improvements

### Error Handling
- Try-catch blocks in services
- User-friendly alert messages
- Console logging for debugging
- Validation on both frontend and backend

### State Management
- Services use RxJS BehaviorSubject for shared state
- `currentUser$` observable tracks logged-in user
- Component state for UI-specific data

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify connection string in appsettings.json
- Ensure database exists and schema is imported
- Check port 5000 is not in use

### Frontend won't start
- Run `npm install` to ensure dependencies
- Check Angular CLI is installed globally
- Verify port 4200 is available
- Clear node_modules and reinstall if needed

### Login fails
- Check database has user records
- Verify password hashing in registration
- Check JWT secret in appsettings.json
- Clear browser localStorage

### CORS errors
- Ensure backend CORS policy allows http://localhost:4200
- Check `Program.cs` has correct CORS configuration

### Stock not updating
- Check transaction handling in InvoiceService
- Verify product IDs match in database
- Look for errors in console

## Future Enhancements

- Excel export for reports
- Email notifications for low stock
- Barcode scanning
- Multi-user roles (Admin, Cashier, Manager)
- Print invoice functionality
- Payment method tracking
- Supplier management
- Purchase order system

## License

This project is for educational/portfolio purposes.

## Contact

For questions or issues, check the code comments or console logs for debugging hints.
