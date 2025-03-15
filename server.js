import bodyParser from "body-parser";
import { config } from "dotenv";
import express from "express";
import connectToPostgres from "./database/db.js";
import globalErrhandler from "./middlewares/globalHandler.js";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import doctorRoutes from "./routes/doctor.js";
import userRoutes from "./routes/users.js";
const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure the session middleware
app.use(session({
  secret: 'sdklf8943jlkj',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Set up the view engine (example: EJS)
app.set("view engine", "ejs"); 
config();

app.use(express.static(__dirname, +"/public"));
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

//gehandle
app.use(globalErrhandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
