# FinTech Wallet - Quick Start Guide

## 📦 Project Structure

```
elga-fin-tech-wallet/
├── app/                          # Frontend (React Native/Expo)
│   ├── lib/
│   │   ├── api.ts               # NEW: API client
│   │   ├── AuthContext.tsx      # UPDATED: Uses API instead of Supabase
│   │   └── userData.ts
│   ├── (tabs)/
│   │   ├── index.tsx            # UPDATED: Fetches from API
│   │   ├── wallet.tsx           # UPDATED: Fetches from API
│   │   └── ...
│   └── notifications.tsx        # UPDATED: Fetches from API
├── server/                       # NEW: Backend (Express.js)
│   ├── src/
│   │   ├── controllers/         # API logic
│   │   ├── routes/              # API endpoints
│   │   ├── models/              # Database queries
│   │   ├── middleware/          # Authentication
│   │   ├── db/                  # Database setup
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Helper functions
│   │   └── index.ts             # Express app
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── DATABASE_SETUP.md            # NEW: Database setup guide
├── QUICK_START.md              # NEW: This file
└── README.md
```

## 🚀 Quick Start

### 1. Install Global Dependencies

```bash
# Node.js 18+ (https://nodejs.org)
node --version  # Should be v18+

# PostgreSQL (https://www.postgresql.org/download/)
psql --version
```

### 2. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fintech_wallet;
\q
```

### 3. Start Backend Server

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL password and JWT secret
# Use: nano .env (or your favorite editor)

# Run migrations (create tables)
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

Server now running on: **http://localhost:3000**

### 4. Start Frontend App

In a new terminal:

```bash
# From root directory
npx expo start

# Then press:
# - i (for iOS simulator)
# - a (for Android emulator)
# - w (for web browser)
```

## 📱 Testing the App

### User Credentials for Demo

After running `npm run seed`, use:
- **Phone**: 27689053667
- **OTP**: Check server console logs (demo mode) or SMS (production)

### Test Flow

1. **Open App** → Login screen
2. **Enter Phone** → Click "Get Code"
3. **Enter OTP** → Check server console for demo OTP
4. **Complete Profile** → Add First and Last Name
5. **Dashboard** → View balances from database
6. **Wallet** → See wallet balance from PostgreSQL
7. **Notifications** → Real notifications from database

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `sessions` | Authentication tokens |
| `otps` | OTP verification |
| `wallets` | User wallet balance |
| `balances` | Airtime, data, minutes, SMS |
| `cards` | Payment cards |
| `transactions` | Transaction history |
| `notifications` | Push notifications |
| `topup_packages` | Available top-ups |

### View Current Data

```bash
# Connect to database
psql -U postgres -d fintech_wallet

# View users
SELECT * FROM users;

# View wallets
SELECT * FROM wallets;

# View transactions
SELECT * FROM transactions ORDER BY created_at DESC;

# View notifications
SELECT * FROM notifications ORDER BY created_at DESC;

# Exit
\q
```

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/send-otp       → Send OTP
POST /api/auth/verify-otp     → Verify and login
POST /api/auth/logout         → Logout
```

### Wallet (Protected)

```
GET  /api/wallet/balance      → Get balance
GET  /api/wallet/balances     → Get all balances
POST /api/wallet/deposit      → Add funds
POST /api/wallet/withdraw     → Remove funds
POST /api/wallet/transfer     → Send to user
```

### Top-Up (Protected)

```
GET  /api/topup/packages      → Available packages
POST /api/topup/purchase      → Buy package
POST /api/topup/redeem-voucher → Redeem voucher
```

### Cards (Protected)

```
GET  /api/cards/list          → Your cards
POST /api/cards/add           → Add card
DELETE /api/cards/:id         → Remove card
```

### Notifications (Protected)

```
GET /api/notifications/list   → Your notifications
POST /api/notifications/:id/read → Mark as read
```

### Health Check

```
GET /health                   → Server status
```

## 🧪 Testing API with cURL

### Send OTP

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789"}'
```

Response:
```json
{
  "success": true,
  "demoOtp": "123456"
}
```

### Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "27123456789", "code": "123456"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {...},
    "expiresAt": "2024-01-10T..."
  }
}
```

### Get Wallet (with token)

```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛠️ Development Commands

### Backend

```bash
cd server

npm run dev              # Start dev server (auto-reload)
npm run build           # Compile TypeScript
npm start               # Run compiled code
npm run migrate         # Create database tables
npm run seed            # Add sample data
```

### Frontend

```bash
npx expo start          # Start Expo server
npx expo prebuild       # Prepare for native build
npm run build           # Build web version
```

## ⚙️ Configuration Files

### Server Environment (`.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fintech_wallet
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h

# OTP
OTP_EXPIRY=10
```

### Frontend Environment (`.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database password
- [ ] Enable HTTPS in production
- [ ] Never commit .env files
- [ ] Implement card encryption for production
- [ ] Add SMS service for OTP
- [ ] Enable database backups
- [ ] Set up API rate limiting

## 📚 Key Files Modified/Created

### New Files
- `server/` - Complete Express.js backend
- `app/lib/api.ts` - API client
- `DATABASE_SETUP.md` - Database documentation
- `server/README.md` - Backend documentation

### Modified Files
- `app/lib/AuthContext.tsx` - Now uses API instead of Supabase
- `app/(tabs)/index.tsx` - Fetches balances from API
- `app/(tabs)/wallet.tsx` - Fetches wallet from API
- `app/notifications.tsx` - Fetches notifications from API

## 🐛 Troubleshooting

### "Connection refused" on port 5432

```bash
# PostgreSQL might not be running
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Windows:
# Start PostgreSQL from Services
```

### "API not found" error

```bash
# Check backend is running (Terminal 1)
# Should see: "Server is running on port 3000"

# Check frontend .env has correct URL
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### "Invalid token" error

```bash
# Token expired or invalid
# Simply logout and login again
# Tokens last 24 hours
```

### Database already exists

```bash
# To reset database
psql -U postgres
DROP DATABASE fintech_wallet;
CREATE DATABASE fintech_wallet;
\q

# Then run migrations again
cd server
npm run migrate
npm run seed
```

## 📖 Documentation Links

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database setup
- [server/README.md](./server/README.md) - Backend API documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Expo Documentation](https://docs.expo.dev/)

## 📝 Next Steps

1. ✅ Backend server running
2. ✅ Database configured
3. ✅ Frontend connected to API
4. 🔄 Add more features
   - Payment gateway integration
   - SMS provider setup
   - Push notifications
   - More test cases

## 💡 Tips

- Use `npm run dev` for hot-reload in backend
- Check server logs for errors
- Use database client (pgAdmin, DBeaver) for easier data viewing
- Test API with Postman for complex requests
- Keep frontend and backend servers running simultaneously

## 🆘 Getting Help

1. Check server logs: Look for red errors in terminal
2. Check database: `psql -U postgres -d fintech_wallet`
3. Check API response: Use curl or Postman
4. Review DATABASE_SETUP.md: Comprehensive guide
5. Check server/README.md: API documentation

## 🎉 Success Indicators

- ✅ Backend server starts without errors
- ✅ Database tables created
- ✅ Frontend app opens
- ✅ Can login with phone
- ✅ OTP code appears in console
- ✅ Wallet balance displays
- ✅ Notifications load from database
- ✅ All API calls succeed

Happy coding! 🚀
