# Razorpay Payment Integration Demo

A full-stack demo application showcasing Razorpay payment integration with Vite.js frontend and Node.js Express backend.

## Project Structure

\`\`\`
razorpay-demo/
├── frontend/          # Vite.js React frontend
├── backend/           # Node.js Express backend
└── README.md
\`\`\`

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
# Install dependencies for both frontend and backend
npm run install:all

# Or install manually:
cd frontend && npm install
cd ../backend && npm install
\`\`\`

### 2. Configure Razorpay

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from the dashboard
3. Update the keys in:
   - `backend/.env` file
   - `frontend/src/App.jsx` (replace the test key)

### 3. Run the Application

\`\`\`bash
# Start backend server (runs on port 5000)
cd backend && npm run dev

# Start frontend server (runs on port 3000)
cd frontend && npm run dev
\`\`\`

## Features

- ✅ Responsive payment form with Tailwind CSS
- ✅ Razorpay payment gateway integration
- ✅ Order creation and payment verification
- ✅ Error handling and user feedback
- ✅ Clean and modern UI design

## Test Card Details

For testing payments, use these test card details:

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

## API Endpoints

- `POST /api/create-order` - Create a new payment order
- `POST /api/verify-payment` - Verify payment signature
- `GET /api/payment/:paymentId` - Get payment details

## Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
PORT=5000
\`\`\`

## Security Notes

- Never expose your Razorpay secret key in frontend code
- Always verify payments on the server side
- Use HTTPS in production
- Validate all user inputs

## Production Deployment

1. Replace test API keys with live keys
2. Update CORS settings for your domain
3. Set up proper environment variables
4. Enable HTTPS
5. Add proper error logging
