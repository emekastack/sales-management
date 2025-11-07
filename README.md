# Sales Management System

A comprehensive RESTful API for managing products, sales, and user authentication built with NestJS, MongoDB, and JWT authentication.

## Features

- 🔐 **User Authentication**: JWT-based authentication with registration and login
- 📦 **Product Management**: CRUD operations for products with stock tracking
- 💰 **Sales Management**: Create sales, track revenue, and generate sales reports
- 📊 **Pagination**: Paginated endpoints for products and sales listings
- 🛡️ **Input Validation**: Request validation using class-validator
- 🧪 **Comprehensive Testing**: Unit tests with Jest for all modules
- 📝 **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: NestJS 11
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/emekastack/sales-management.git
cd sales-management
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/sales-management
JWT_SECRET=your-secret-key-here
PORT=3000
```

4. Build the application:
```bash
npm run build
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The application will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Products

#### Get All Products (Paginated)
```http
GET /products?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Product by ID
```http
GET /products/:id
```

#### Create Product (Protected)
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 10
}
```

#### Update Product (Protected)
```http
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 149.99
}
```

#### Delete Product (Protected)
```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Sales

#### Get All Sales (Paginated, Protected)
```http
GET /sales?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Sale by ID (Protected)
```http
GET /sales/:id
Authorization: Bearer <token>
```

#### Create Sale (Protected)
```http
POST /sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 2
}
```

#### Get Sales Report (Protected)
```http
GET /sales/report
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalSales": 100,
  "totalRevenue": 10000,
  "averageSaleValue": 100
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the login endpoint and expires after 7 days.

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- auth
npm test -- products
npm test -- sales
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── schemas/         # User schema
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
├── products/            # Products module
│   ├── dto/             # Data transfer objects
│   ├── schemas/         # Product schema
│   ├── products.controller.ts
│   └── products.service.ts
├── sales/               # Sales module
│   ├── dto/             # Data transfer objects
│   ├── schemas/         # Sale schema
│   ├── sales.controller.ts
│   └── sales.service.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `PORT` | Server port | No | 3000 |

## Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

## Features in Detail

### Product Management
- Create, read, update, and delete products
- Track product stock levels
- Automatic stock updates when sales are made
- Paginated product listings

### Sales Management
- Create sales with automatic stock validation
- Track sales by user
- Calculate total revenue and average sale value
- Paginated sales listings
- Sales reports with aggregated statistics

### Security
- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with guards
- Input validation and sanitization



## License

This project is private and unlicensed.

## Author

Built as part of the Konnadex Assessment.

