import bodyParser from "body-parser";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import connectToPostgres from "./database/db.js";
import globalErrhandler from "./middlewares/globalHandler.js";
import doctorRoutes from "./routes/doctor.js";
import studentRoutes from "./routes/student.js"; // Import student routes
import userRoutes from "./routes/users.js";
const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure the session middleware with extended duration
app.use(session({
  secret: 'sdklf8943jlkj',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // Set session duration to 24 hours (in milliseconds)
    httpOnly: true
  }
}));

// Session check middleware
app.use((req, res, next) => {
  // Skip session check for public routes
  if (req.path === '/' || req.path === '/login' || req.path === '/signup' || req.path.startsWith('/css') || req.path.startsWith('/js')) {
    return next();
  }
  
  // Check if user session exists where required
  if (req.path.startsWith('/doctor') || req.path.startsWith('/student')) {
    if (!req.session.userId) {
      // Redirect to homepage if session expired
      console.log('Session expired, redirecting to homepage');
      return res.redirect('/');
    }
  }
  next();
});

// Set up the view engine (example: EJS)
app.set("view engine", "ejs"); 
config();

app.use(express.static(__dirname + "/public")); // Ensure static files are served correctly
//
// // Middleware
app.use(bodyParser.urlencoded({ extended: true }));
connectToPostgres();
// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db.connect();
//users route
// commment
//new cmnt
app.use("/", userRoutes);

app.use('/doctor', doctorRoutes);
app.use('/student', studentRoutes); // Use student routes

//gehandle
app.use(globalErrhandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
