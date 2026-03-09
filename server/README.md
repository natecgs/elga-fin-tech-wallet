# FinTech Wallet Backend Server

## Overview

Express.js backend server for the FinTech Wallet mobile application. Handles all database operations, authentication, payments, and notifications through RESTful APIs.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL 12+
- **Driver**: Node.js pg
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
server/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── AuthController.ts
│   │   ├── WalletController.ts
│   │   ├── TopUpController.ts
│   │   ├── CardController.ts
│   │   ├── TransactionController.ts
│   │   └── NotificationController.ts
│   ├── routes/             # API routes
│   │   ├── auth.ts
│   │   ├── wallet.ts
│   │   ├── topup.ts
│   │   ├── cards.ts
│   │   ├── transactions.ts
│   │   └── notifications.ts
│   ├── models/             # Database models
│   │   ├── UserModel.ts
│   │   ├── SessionModel.ts
│   │   ├── OTPModel.ts
│   │   ├── WalletModel.ts
│   │   ├── BalanceModel.ts
│   │   ├── CardModel.ts
│   │   ├── TransactionModel.ts
│   │   ├── NotificationModel.ts
│   │   └── TopUpPackageModel.ts
│   ├── middleware/         # Express middleware
│   │   └── auth.ts
│   ├── db/                 # Database setup
│   │   ├── connection.ts
│   │   ├── migrations.ts
│   │   └── seed.ts
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   └── helpers.ts
│   └── index.ts            # Express app entry point
├── dist/                   # Compiled JavaScript
├── .env                    # Environment variables
├── .env.example            # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_wallet
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=24h
OTP_EXPIRY=10
```

### 3. Create PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE fintech_wallet;
\q
```

## Running the Server

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3000` with auto-reload on file changes.

### Production Build

```bash
npm run build
npm start
```

## Database Operations

### Create Tables

```bash
npm run migrate
```

This creates all necessary tables and indices.

### Seed Sample Data

```bash
npm run seed
```

Populates database with:
- Sample user
- Wallet and balances
- Top-up packages
- Promotions
- Sample notifications

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication

```
POST   /auth/send-otp              - Send OTP to phone
POST   /auth/verify-otp            - Verify OTP and create session
POST   /auth/validate-session      - Validate existing session
POST   /auth/update-profile        - Update user profile (Protected)
POST   /auth/logout                - Logout user (Protected)
```

### Wallet Management

```
GET    /wallet/balance             - Get wallet balance (Protected)
GET    /wallet/balances            - Get all balances (Protected)
POST   /wallet/deposit             - Deposit funds (Protected)
POST   /wallet/withdraw            - Withdraw funds (Protected)
POST   /wallet/transfer            - Transfer to another user (Protected)
```

### Top-Up Services

```
GET    /topup/packages             - Get all packages
GET    /topup/packages/:type       - Get packages by type
POST   /topup/purchase             - Purchase package (Protected)
POST   /topup/redeem-voucher       - Redeem voucher (Protected)
```

### Payment Cards

```
GET    /cards/list                 - Get all cards (Protected)
GET    /cards/:cardId              - Get card details (Protected)
POST   /cards/add                  - Add new card (Protected)
DELETE /cards/:cardId              - Delete card (Protected)
POST   /cards/:cardId/set-default  - Set default card (Protected)
```

### Transactions

```
GET    /transactions/list          - Get transactions (Protected)
GET    /transactions/:id           - Get transaction details (Protected)
GET    /transactions/summary       - Get summary (Protected)
```

### Notifications

```
GET    /notifications/list         - Get notifications (Protected)
GET    /notifications/unread       - Get unread notifications (Protected)
GET    /notifications/count        - Get unread count (Protected)
POST   /notifications/:id/read     - Mark as read (Protected)
POST   /notifications/mark-all-read - Mark all as read (Protected)
DELETE /notifications/:id          - Delete notification (Protected)
```

## Authorization

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token obtained from `/auth/verify-otp` endpoint.

## Request/Response Examples

### Send OTP

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "demoOtp": "123456"
}
```

### Verify OTP

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789", "code": "123456"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "27123456789",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "avatarUrl": ""
    },
    "expiresAt": "2024-01-10T12:00:00Z",
    "isNewUser": true
  }
}
```

### Get Wallet Balance

**Request:**
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "balance": 100.50,
    "currency": "ZAR",
    "updatedAt": "2024-01-09T10:30:00Z"
  }
}
```

## Models

### UserModel
- `findByPhone(phone)` - Find user by phone number
- `findById(id)` - Find user by ID
- `create(phone)` - Create new user
- `update(id, data)` - Update user data
- `toAuthUser(user)` - Convert to AuthUser format

### WalletModel
- `findByUserId(userId)` - Get wallet
- `create(userId)` - Create wallet
- `updateBalance(userId, amount)` - Add/subtract from balance
- `setBalance(userId, amount)` - Set balance to specific amount

### BalanceModel
- `findByUserId(userId)` - Get all balances
- `findByUserAndType(userId, type)` - Get specific balance
- `upsert(...)` - Create or update balance
- `updateBalance(...)` - Update balance value
- `incrementBalance(...)` - Add to balance

### TransactionModel
- `create(...)` - Create transaction record
- `findByUserId(userId)` - Get user transactions
- `findById(id)` - Get transaction details
- `updateStatus(id, status)` - Update transaction status
- `getSummary(userId)` - Get transaction summary

### NotificationModel
- `findByUserId(userId)` - Get notifications
- `findUnread(userId)` - Get unread notifications
- `create(...)` - Create notification
- `markAsRead(id)` - Mark as read
- `markAllAsRead(userId)` - Mark all as read
- `delete(id)` - Delete notification
- `getUnreadCount(userId)` - Get unread count

## Middleware

### authMiddleware

Validates JWT tokens and sets `req.user` if valid:

```typescript
export interface AuthRequest extends Request {
  user?: { id: string; phone: string };
  token?: string;
}
```

## Error Handling

Standard error response format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Testing

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Database Connection Test

The server will fail to start if database connection fails.

## Performance Tips

1. **Database Queries**: Indexed on frequently queried columns
2. **Connection Pooling**: Configured with max 20 connections
3. **Error Handling**: Graceful error responses
4. **CORS**: Configured for frontend domain

## Deployment

### Environment Variables for Production

```env
DB_HOST=production-db-host
DB_PORT=5432
DB_NAME=fintech_wallet_prod
DB_USER=prod_user
DB_PASSWORD=strong_password_here
PORT=3000
NODE_ENV=production
JWT_SECRET=generate_new_secret
JWT_EXPIRY=24h
```

### Database Backups

```bash
# Create backup
pg_dump -U postgres fintech_wallet > backup.sql

# Restore backup
psql -U postgres fintech_wallet < backup.sql
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -l | grep fintech_wallet
```

## Contributing

1. Create feature branch
2. Make changes
3. Run migrations if needed
4. Test with curl or Postman
5. Submit PR

## License

MIT
