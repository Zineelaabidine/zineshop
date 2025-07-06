# ZineShop - Full-Stack E-Commerce Application

A modern e-commerce platform built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- PostgreSQL database (Supabase)

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd e-com-website
   ```

2. **Install dependencies for both client and server**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `server/.env.example` to `server/.env`
   - Update the database credentials and JWT secret

4. **Start the full application**
   ```bash
   npm run dev
   ```

   This command will:
   - Build the React frontend for production
   - Start the Express.js TypeScript server on `http://localhost:5000`
   - Serve the entire application (frontend + backend) from port 5000
   - **Access your app at: `http://localhost:5000`**

## 📁 Project Structure

```
e-com-website/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express.js + TypeScript backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── dist/             # Compiled JavaScript (generated)
│   ├── package.json
│   └── server.ts
├── package.json          # Root package.json for scripts
├── dev.bat              # Windows batch script for development
└── README.md
```

## 🛠 Available Scripts

### Available Commands

- `npm run dev` - **Start the full application on port 5000** (builds React + starts server)
- `npm run start` - Start the full application in production mode
- `npm run build` - Build both client and server for production
- `npm run install:all` - Install dependencies for both client and server

### Individual Component Commands

- `npm run client:dev` - Start only the React development server (port 5173)
- `npm run client:build` - Build the React app for production
- `npm run server:dev` - Start only the Express.js development server (port 5000)
- `npm run server:build` - Compile TypeScript to JavaScript

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (via Supabase)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database Configuration
DATABASE_URL="your-postgresql-connection-string"
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/signout` - Sign out user
- `PUT /api/auth/profile` - Update user profile

### Health Check
- `GET /health` - Server health status

## 🌐 Application URLs

- **Full Application**: http://localhost:5000 (frontend + backend unified)
- **API Health Check**: http://localhost:5000/health
- **API Endpoints**: http://localhost:5000/api/*

## 🏗 Building for Production

1. **Build both client and server**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

## 📝 Features

- ✅ User authentication (signup/signin)
- ✅ JWT-based session management
- ✅ Product catalog with categories
- ✅ **Admin Panel** for product management
- ✅ Responsive design (mobile-first)
- ✅ TypeScript for type safety
- ✅ Database integration (PostgreSQL/Supabase)
- ✅ Modern development workflow

### 🛠 Admin Panel Features

- **Dashboard Overview**: Real-time statistics and metrics
- **Product Management**: Add, edit, and delete products
- **Inventory Tracking**: Stock levels and low stock alerts
- **Search & Filtering**: Advanced product search and category filters
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modal Forms**: Clean, user-friendly product forms
- **Status Management**: Active, inactive, and out-of-stock status tracking

**Access the Admin Panel**: Navigate to `/admin`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🚀**
