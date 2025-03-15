import bcrypt from "bcryptjs";
import { pool } from "../database/db.js";

// Log all students
export const logAllStudents = async (req, res) => {
  try {
    const students = await pool.query("SELECT * FROM student");
    console.log(students.rows);
    res.json(students.rows);
  } catch (error) {
    console.error(error);
    return res.json({ error: "An error occurred while fetching students." });
  }
};

// Register Controller
export const signupCtrl = async (req, res, next) => {
  const { Id, fullname, email, password, role, specialization } = req.body;

  if (!Id || !fullname || !email || !password || !role || (role === "doctor" && !specialization)) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if Id or email already exists
    const userFound = await pool.query(
      "SELECT * FROM student WHERE email = $1 OR studentid = $2",
      [email, Id]
    );

    const doctorFound = await pool.query(
      "SELECT * FROM doctor WHERE email = $1 OR doctorid = $2",
      [email, Id]
    );

    if (userFound.rows.length > 0 || doctorFound.rows.length > 0) {
      return res.status(400).json({ error: "Email or ID is already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Insert user into the appropriate table
    if (role === "student") {
      await pool.query(
        "INSERT INTO student (studentid, fullname, email, password) VALUES ($1, $2, $3, $4)",
        [Id, fullname, email, passwordHashed]
      );
    } else if (role === "doctor") {
      await pool.query(
        "INSERT INTO doctor (doctorid, fullname, email, password, status, specialization) VALUES ($1, $2, $3, $4, $5, $6)",
        [Id, fullname, email, passwordHashed, 1, specialization]
      );
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    res.render("login", { error: "" });
    console.log("User registered successfully");
  } catch (error) {
    console.error("Database error:", error.message);
    next(error); // Pass error to Express error handler
  }
};

// Login Controller
export const loginCtrl = async (req, res) => {
  const { email, password } = req.body;

  // Check if fields are empty
  if (!email || !password) {
    return res.render("../views/login", { error: "All fields are required" });
  }

  try {
    // Check if email exists in student table
    const studentFound = await pool.query(
      "SELECT * FROM student WHERE email = $1",
      [email]
    );

    // Check if email exists in doctor table
    const doctorFound = await pool.query(
      "SELECT * FROM doctor WHERE email = $1",
      [email]
    );

    let user = null;
    let role = "";

    if (studentFound.rows.length > 0) {
      user = studentFound.rows[0];
      role = "student";
    } else if (doctorFound.rows.length > 0) {
      user = doctorFound.rows[0];
      role = "doctor";
    } else {
      return res.render("../views/login", { error: "Invalid login credentials" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("../views/login", { error: "Invalid login credentials" });
    }

    // Save the user ID and role in the session
    req.session.userId = user.studentid || user.doctorid; // Ensure correct ID is set
    req.session.role = role;

    // Redirect to appropriate dashboard
    if (role === "student") {
      console.log("student");
      res.redirect('/student/dashboard');
    } else if (role === "doctor") {
      res.redirect('/doctor/dashboard');
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "An error occurred while logging in the user." });
  }
};

// Admin Dashboard Controller
export const adminDashboardCtrl = async (req, res) => {
  res.render("adminDashboard", { error: "" });
  console.log("admin dashboard");
};