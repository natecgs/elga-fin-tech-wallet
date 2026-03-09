# FinTech Wallet Application - Database Setup Guide

## Overview

This application uses **PostgreSQL 12+** as its database with a **Node.js pg driver** for connections and **Express.js** for the backend API.

## Database Architecture

### System Components

1. **Database**: PostgreSQL 12+
2. **Backend**: Express.js with TypeScript
3. **Database Driver**: Node.js `pg` package
4. **Frontend**: React Native (Expo) with Axios for API calls
5. **Authentication**: JWT tokens with session management

### Key Features

- ✅ Phone-based authentication with OTP
- ✅ Wallet management (balance tracking)
- ✅ Multiple balance types (airtime, data, minutes, SMS)
- ✅ Payment card management
- ✅ Transaction history
- ✅ Push notifications
- ✅ Top-up packages
- ✅ Promotions

## Installation & Setup

### 1. Prerequisites

```bash
# Required
- Node.js 18+
- npm or yarn
- PostgreSQL 12+
```

### 2. Backend Setup

#### Clone and Install Dependencies

```bash
cd server
npm install
```

#### Environment Configuration

Create a `.env` file in the `server` directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_wallet
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=24h

# App Configuration
APP_NAME=FinTech Wallet
OTP_EXPIRY=10
```

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fintech_wallet;

# Exit
\q
```

#### Run Migrations

```bash
# Create all tables
npm run migrate

# Seed sample data
npm run seed
```

#### Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies

```bash
npm install
```

#### Configure API Endpoint

Create or update `app/lib/api.ts` with your backend URL:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
```

For development, you can also set it in `.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

#### Start Frontend

```bash
npx expo start
```

## Database Schema

### Table: `users`
Stores user account information
```sql
- id: UUID (Primary Key)
- phone: VARCHAR(15) UNIQUE
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `sessions`
User authentication sessions
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- token: TEXT UNIQUE
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

### Table: `otps`
One-time passwords for phone verification
```sql
- id: UUID (Primary Key)
- phone: VARCHAR(15)
- code: VARCHAR(6)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

### Table: `wallets`
User wallet balances
```sql
- id: UUID (Primary Key)
- user_id: UUID UNIQUE (Foreign Key)
- balance: DECIMAL(15,2)
- currency: VARCHAR(3)
- updated_at: TIMESTAMP
```

### Table: `balances`
Service-specific balances (airtime, data, minutes, SMS)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- type: VARCHAR(20)
- value: DECIMAL(15,4)
- unit: VARCHAR(20)
- expires_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(user_id, type)
```

### Table: `cards`
Stored payment cards
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- cardholder_name: VARCHAR(100)
- card_number_last_4: VARCHAR(4)
- card_number_encrypted: VARCHAR(255)
- expiry_month: INTEGER
- expiry_year: INTEGER
- cvv_encrypted: VARCHAR(255)
- billing_phone: VARCHAR(15)
- is_default: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `transactions`
Transaction history
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- type: VARCHAR(50)
- amount: DECIMAL(15,2)
- currency: VARCHAR(3)
- status: VARCHAR(20)
- description: TEXT
- reference_id: VARCHAR(100)
- recipient_phone: VARCHAR(15)
- metadata: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `notifications`
User notifications
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- title: VARCHAR(200)
- message: TEXT
- type: VARCHAR(50)
- read: BOOLEAN
- action_url: TEXT
- created_at: TIMESTAMP
```

### Table: `topup_packages`
Available top-up packages
```sql
- id: UUID (Primary Key)
- type: VARCHAR(50)
- name: VARCHAR(100)
- description: TEXT
- price: DECIMAL(10,2)
- amount: DECIMAL(15,4)
- unit: VARCHAR(20)
- validity_days: INTEGER
- active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `promotions`
Active promotions
```sql
- id: UUID (Primary Key)
- title: VARCHAR(200)
- description: TEXT
- image_url: TEXT
- discount_percent: DECIMAL(5,2)
- valid_from: TIMESTAMP
- valid_until: TIMESTAMP
- active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP and create session |
| POST | `/api/auth/validate-session` | Validate existing session |
| POST | `/api/auth/update-profile` | Update user profile |
| POST | `/api/auth/logout` | Logout user |

### Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get wallet balance |
| GET | `/api/wallet/balances` | Get all balances |
| POST | `/api/wallet/deposit` | Deposit funds |
| POST | `/api/wallet/withdraw` | Withdraw funds |
| POST | `/api/wallet/transfer` | Transfer to another user |

### Top-Up

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topup/packages` | Get all packages |
| GET | `/api/topup/packages/:type` | Get packages by type |
| POST | `/api/topup/purchase` | Purchase top-up |
| POST | `/api/topup/redeem-voucher` | Redeem voucher |

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards/list` | Get all cards |
| GET | `/api/cards/:cardId` | Get card details |
| POST | `/api/cards/add` | Add new card |
| DELETE | `/api/cards/:cardId` | Delete card |
| POST | `/api/cards/:cardId/set-default` | Set default card |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/list` | Get transactions |
| GET | `/api/transactions/:transactionId` | Get transaction details |
| GET | `/api/transactions/summary/overview` | Get summary |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/list` | Get notifications |
| GET | `/api/notifications/unread` | Get unread notifications |
| GET | `/api/notifications/count` | Get unread count |
| POST | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

## Authentication Flow

### OTP Login Process

1. User enters phone number
2. App calls `POST /api/auth/send-otp` with phone
3. Server generates OTP and stores it (valid for 10 minutes)
4. User receives OTP (via SMS in production, console in dev)
5. User enters OTP
6. App calls `POST /api/auth/verify-otp` with phone and code
7. Server validates OTP and creates session
8. Returns JWT token and user data
9. Token stored in local storage
10. API client sets Authorization header for all future requests

### JWT Token Management

- Tokens expire after 24 hours (configurable via JWT_EXPIRY)
- Session stored in database and validated on every request
- Frontend stores token in AsyncStorage
- Auto-logout when session expires

## Data Flow Examples

### Example 1: Get Wallet Balance

```
Frontend (Expo)
  ↓
POST /api/wallet/balance (with JWT token)
  ↓
AuthMiddleware (validates JWT)
  ↓
WalletController.getWallet()
  ↓
WalletModel.findByUserId()
  ↓
PostgreSQL Query
  ↓
Response with balance
```

### Example 2: Purchase Top-Up

```
Frontend (Expo)
  ↓
POST /api/topup/purchase (packageId, paymentMethod)
  ↓
AuthMiddleware
  ↓
TopUpController.purchaseTopUp()
  ↓
1. Get package details
2. Check wallet balance
3. Create transaction
4. Update wallet balance
5. Update user balance (airtime/data/etc)
6. Create notification
  ↓
Response with success/error
```

## Development Workflow

### 1. Running the Full Stack

Terminal 1 - Backend:
```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

Terminal 2 - Frontend:
```bash
npm install
npx expo start
```

### 2. Database Debugging

Access PostgreSQL directly:
```bash
psql -U postgres -d fintech_wallet
```

Common queries:
```sql
-- View all users
SELECT * FROM users;

-- View transactions for a user
SELECT * FROM transactions WHERE user_id = 'USER_ID';

-- Check session validity
SELECT * FROM sessions WHERE expires_at > CURRENT_TIMESTAMP;

-- View unread notifications
SELECT * FROM notifications WHERE read = FALSE ORDER BY created_at DESC;
```

### 3. API Testing

Using curl:
```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789", "code": "123456"}'

# Get wallet balance (with token)
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Production Considerations

### Security

1. **JWT Secret**: Generate a secure random string
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Database Password**: Use strong password
   ```bash
   # Generate password
   openssl rand -base64 32
   ```

3. **Card Encryption**: Implement proper card encryption before storing
   - Use industry-standard encryption (AES-256)
   - Store only last 4 digits in plain text
   - Never store CVV

4. **CORS**: Configure for your domain
   ```typescript
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true
   }));
   ```

### Database Backups

```bash
# Daily backup
pg_dump -U postgres fintech_wallet > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres fintech_wallet < backup_20240101.sql
```

### Monitoring

- Set up logs for all API requests
- Monitor database query performance
- Track transaction success rates
- Alert on OTP failure rates

### Scaling

- Add read replicas for high traffic
- Implement caching (Redis) for frequently accessed data
- Use connection pooling (PgBouncer)
- Archive old transactions

## Troubleshooting

### Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Ensure PostgreSQL is running
- macOS: brew services start postgresql
- Linux: sudo systemctl start postgresql
- Windows: Start PostgreSQL service
```

### OTP Not Sending

- Dev mode: Check console logs for OTP
- Production: Verify SMS provider integration
- Check OTP_EXPIRY environment variable

### Token Expired Error

- Frontend: Clear AsyncStorage and re-login
- Backend: Check JWT_SECRET and JWT_EXPIRY settings

### Database Locked

```sql
-- Kill active connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'fintech_wallet' AND pid <> pg_backend_pid();
```

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Driver](https://node-postgres.com/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/)
