# FinTech Wallet - Mobile Financial App

Complete fintech wallet application with React Native frontend and PostgreSQL backend. Features phone-based authentication, wallet management, top-up services, card management, and transaction tracking.

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, PostgreSQL 12+

```bash
# 1. Create database
createdb fintech_wallet

# 2. Setup & run backend
cd server
npm install
npm run migrate
npm run seed
npm run dev

# 3. Setup & run frontend (new terminal)
npm install
npx expo start
```

See [QUICK_START.md](./QUICK_START.md) for detailed instructions.

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Get started in 5 minutes
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Complete database guide
- [DATABASE_MIGRATION_SUMMARY.md](./DATABASE_MIGRATION_SUMMARY.md) - Migration overview
- [server/README.md](./server/README.md) - Backend API documentation

## 🏗️ Architecture

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Axios** for API communication
- **AsyncStorage** for local persistence

### Backend
- **Express.js** REST API
- **Node.js pg** driver for PostgreSQL
- **JWT** for authentication
- **TypeScript** for type safety

### Database
- **PostgreSQL 12+** with 10 tables
- **Connection pooling** for performance
- **Indexed queries** for speed
- **Cascading deletes** for data integrity

## ✨ Features

- ✅ Phone-based OTP authentication
- ✅ Wallet balance management
- ✅ Multiple balance types (airtime, data, SMS, minutes)
- ✅ Payment card management & validation
- ✅ Top-up services (data, voice, SMS, airtime)
- ✅ Wallet deposits & withdrawals
- ✅ User-to-user transfers
- ✅ Transaction history
- ✅ Real-time notifications
- ✅ Promotion browsing
- ✅ Voucher redemption

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts with phone-based login |
| `sessions` | JWT token management |
| `otps` | OTP verification for phone login |
| `wallets` | User wallet balances |
| `balances` | Service-specific balances |
| `cards` | Payment card storage |
| `transactions` | Transaction history |
| `notifications` | User notifications |
| `topup_packages` | Available packages |
| `promotions` | Active promotions |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout

### Wallet (Protected)
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/balances` - Get all balances
- `POST /api/wallet/deposit` - Add funds
- `POST /api/wallet/withdraw` - Remove funds
- `POST /api/wallet/transfer` - Send to user

### Top-Up (Protected)
- `GET /api/topup/packages` - Get packages
- `POST /api/topup/purchase` - Buy package
- `POST /api/topup/redeem-voucher` - Redeem voucher

### More endpoints for cards, transactions, notifications...

See [server/README.md](./server/README.md) for complete API reference.

## 🔐 Authentication

1. User enters phone number
2. App sends OTP request
3. User receives code (SMS or console in dev)
4. User verifies code
5. Server creates JWT token
6. Token stored locally and used for all API calls
7. Tokens expire after 24 hours

## 📁 Project Structure

```
.
├── app/                              # React Native Frontend
│   ├── lib/
│   │   ├── api.ts                   # API Client
│   │   ├── AuthContext.tsx          # Authentication Context
│   │   └── ...
│   ├── (tabs)/                      # Tab Navigation Screens
│   ├── auth/                        # Auth Screens
│   └── components/                  # Reusable Components
│
├── server/                           # Express.js Backend
│   ├── src/
│   │   ├── controllers/             # Request Handlers
│   │   ├── routes/                  # API Routes
│   │   ├── models/                  # Database Models
│   │   ├── middleware/              # Authentication
│   │   ├── db/                      # Database Setup
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── DATABASE_SETUP.md                # Database Guide
├── QUICK_START.md                   # Quick Setup
└── README.md                        # This file
```

## 🛠️ Development

### Run Backend
```bash
cd server
npm install
npm run migrate      # Create tables
npm run seed         # Add sample data
npm run dev          # Start server
```

### Run Frontend
```bash
npm install
npx expo start       # Start dev server
# Press: i (iOS), a (Android), w (Web)
```

### Test API
```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -d '{"phone":"27123456789"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -d '{"phone":"27123456789","code":"123456"}'

# Get wallet (with token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/wallet/balance
```

## 🔒 Security

- JWT tokens with 24-hour expiry
- OTP validation (10-minute expiry)
- Parameterized queries (SQL injection protection)
- CORS configuration
- Session-based logout
- Protected API endpoints
- Encrypted card storage ready

## 📊 Database Performance

- Connection pooling (20 max)
- Indexed on frequently queried columns
- Prepared statements for queries
- Query optimization
- Cascading deletes

## 🚢 Deployment

Backend is ready for deployment to:
- AWS (RDS + EC2)
- Heroku
- DigitalOcean
- Google Cloud
- Azure
- Any VPS with Node.js & PostgreSQL

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for production checklist.

## 🐛 Troubleshooting

### Server won't start
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check port not in use
lsof -ti:3000 | xargs kill -9
```

### Database connection error
```bash
# Create database if missing
createdb fintech_wallet

# Run migrations
cd server && npm run migrate
```

### API not found
```bash
# Ensure backend is running
# Check frontend .env has correct API URL
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

See [QUICK_START.md](./QUICK_START.md) for more troubleshooting.

## 📝 Demo Credentials

After running `npm run seed`:
- **Phone**: 27689053667
- **OTP**: Check server console (demo mode)

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/)
- [Expo Documentation](https://docs.expo.dev/)

## 📝 License

MIT

## 🆘 Support

For detailed setup and troubleshooting, see:
1. [QUICK_START.md](./QUICK_START.md) - Fast setup
2. [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database guide
3. [server/README.md](./server/README.md) - API reference
