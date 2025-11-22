# Wanderlust - Travel Listing Platform

A full-stack web application for listing and reviewing travel destinations, built with Node.js, Express, MongoDB, and EJS.

## Features

- 🔐 **Secure Authentication** - User registration and login with Passport.js
- 🏠 **Listing Management** - Create, read, update, and delete travel listings
- ⭐ **Reviews & Ratings** - Leave reviews and ratings for listings
- 🖼️ **Image Uploads** - Upload images to Cloudinary
- 🗺️ **Interactive Maps** - View listing locations on Google Maps
- 🛡️ **Security** - Helmet, rate limiting, XSS protection, and input sanitization
- 📊 **Logging** - Structured logging with Winston
- 🚀 **Production Ready** - Optimized for deployment with PM2

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Local Strategy)
- **View Engine**: EJS
- **File Upload**: Multer + Cloudinary
- **Session Store**: MongoDB (connect-mongo)
- **Security**: Helmet, express-rate-limit, xss-clean, express-mongo-sanitize
- **Logging**: Winston

## Prerequisites

- Node.js (v20.18.0 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Mapbox account (for maps)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tripa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `MONGO_URL` - MongoDB connection string
   - `SECRET` - Session secret key
   - `CLOUD_NAME` - Cloudinary cloud name
   - `CLOUD_API_KEY` - Cloudinary API key
   - `CLOUD_API_SECRET` - Cloudinary API secret
   - `MAP_TOKEN` - Mapbox access token (optional)

4. **Initialize the database** (optional)
   ```bash
   node init/index.js
   ```
   This will create a default admin user (username: `admin`, password: `admin123`) and seed sample listings.

## Running the Application

### Development Mode
```bash
npm start
```

The application will be available at `http://localhost:8080`

### Production Mode

1. **Set NODE_ENV to production**
   ```bash
   set NODE_ENV=production  # Windows
   export NODE_ENV=production  # Linux/Mac
   ```

2. **Install PM2 globally** (recommended for production)
   ```bash
   npm install -g pm2
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Monitor the application**
   ```bash
   pm2 status
   pm2 logs
   pm2 monit
   ```

## Project Structure

```
tripa/
├── config/           # Configuration files
│   └── security.js   # Security middleware configuration
├── controllers/      # Route controllers
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── init/            # Database initialization
│   ├── data.js
│   └── index.js
├── models/          # Mongoose models
│   ├── listing.js
│   ├── reviews.js
│   └── user.js
├── public/          # Static files
├── routes/          # Express routes
│   ├── listing.js
│   ├── review.js
│   └── user.js
├── utils/           # Utility functions
│   ├── ExpressError.js
│   ├── logger.js
│   ├── validateEnv.js
│   └── wrapAsync.js
├── views/           # EJS templates
├── app.js           # Main application file
├── .env.example     # Environment variables template
└── package.json
```

## API Endpoints

### Authentication
- `GET /signup` - Signup page
- `POST /signup` - Create new user
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Listings
- `GET /listings` - View all listings
- `GET /listings/new` - New listing form (auth required)
- `POST /listings` - Create listing (auth required)
- `GET /listings/:id` - View listing details
- `GET /listings/:id/edit` - Edit listing form (owner only)
- `PUT /listings/:id` - Update listing (owner only)
- `DELETE /listings/:id` - Delete listing (owner only)

### Reviews
- `POST /listings/:id/reviews` - Add review (auth required)
- `DELETE /listings/:id/reviews/:reviewId` - Delete review (author only)

### Health Check
- `GET /health` - Application health status

## Security Features

- **Helmet** - Sets secure HTTP headers
- **Rate Limiting** - Prevents brute force attacks
  - Global: 100 requests per 15 minutes
  - Auth routes: 5 requests per 15 minutes
- **Input Sanitization** - Prevents XSS and NoSQL injection
- **CORS** - Configurable cross-origin resource sharing
- **Secure Sessions** - HTTPOnly, SameSite cookies
- **Environment Validation** - Validates required env vars on startup

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log levels: error, warn, info, http, debug

## Error Handling

- Development: Full error stack traces
- Production: User-friendly error messages
- All errors logged with Winston
- Custom error pages

## Deployment

### Using PM2 (Recommended)

PM2 is a production process manager for Node.js applications.

```bash
# Start application
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Restart application
pm2 restart wanderlust

# Stop application
pm2 stop wanderlust

# Auto-restart on system reboot
pm2 startup
pm2 save
```

### Environment Variables for Production

Ensure these are set in production:
- `NODE_ENV=production`
- `MONGO_URL` - Production MongoDB URL
- `SECRET` - Strong session secret
- `PORT` - Server port (default: 8080)

## Monitoring

- Health check endpoint: `/health`
- PM2 monitoring: `pm2 monit`
- Logs: Check `logs/` directory

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### MongoDB Connection Issues
- Verify `MONGO_URL` in `.env`
- Ensure MongoDB is running
- Check network connectivity

### Missing Environment Variables
- Copy `.env.example` to `.env`
- Fill in all required values
- Restart the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on GitHub.
