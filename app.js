if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Validate environment variables
const validateEnv = require('./utils/validateEnv');
validateEnv();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Security middleware
const { 
  securityHeaders, 
  limiter, 
  corsOptions, 
  mongoSanitization, 
  xssProtection 
} = require('./config/security');

// Logger
const logger = require('./utils/logger');

// Models
const User = require("./models/user.js");

// Routes
const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");

// Utilities
const ExpressError=require("./utils/ExpressError.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

// Database connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGO_URL);
      logger.info('Connected to MongoDB successfully');
      return;
    } catch (err) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed: ${err.message}`);
      
      if (retries === maxRetries) {
        logger.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 10000)));
    }
  }
};

connectDB();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// View engine setup
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs",ejsMate);

// Security Middleware (apply early)
app.use(securityHeaders);
app.use(corsOptions);
app.use(mongoSanitization);
app.use(xssProtection);

// Rate limiting
app.use('/api/', limiter); // Apply to API routes if you have them
app.use(limiter); // Global rate limit

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({extended:true, limit: '10mb'}));
app.use(methodOverride("_method"));

// Static files
app.use(express.static(path.join(__dirname,"/public")));

// Session configuration
const store= MongoStore.create({
    mongoUrl:MONGO_URL,
    crypto:{
       secret: process.env.SECRET,
    },
    touchAfter:24*3600, // Fixed: was 3200, should be 3600 for 24 hours
});

store.on("error",(err)=>{
    logger.error(`Session store error: ${err.message}`);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie: {
        expires:Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF protection
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware for flash messages and current user
app.use((req, res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser=req.user;
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// 404 handler
app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"Page not found"));
});

// Error handling middleware
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}= err;
    
    // Log error
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    if(process.env.NODE_ENV === 'development') {
      // In development, log full error
      console.error(err.stack);
    }
    
    // Don't expose internal errors in production
    if(process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = "Something went wrong";
    }
    
    res.status(statusCode).render("error.ejs",{message});
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT,()=>{
    logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});