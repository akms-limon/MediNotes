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
  console.log("login");
  console.log(email);
  console.log(password);

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
    
    // Save the user ID in the session
    // req.session.userAuth = user.id;

    // Redirect to appropriate dashboard
    if (role === "student") {
      console.log("student");
      studentDashboardCtrl(req, res);
    } else if (role === "doctor") {
      console.log("doctor");
      doctorDashboardCtrl(req, res);
    }
  } catch (error) {
    console.error(error);
    return res.json({ error: "An error occurred while logging in the user." });
  }
};

// Student Dashboard Controller
export const studentDashboardCtrl = async (req, res) => {
  res.render("studentDashboard", { error: "" });
  console.log("student dashboard");
};

// Doctor Dashboard Controller
export const doctorDashboardCtrl = async (req, res) => {
  res.render("doctorDashboard", { error: "" });
  console.log("doctor dashboard");
};

// Admin Dashboard Controller
export const adminDashboardCtrl = async (req, res) => {
  res.render("adminDashboard", { error: "" });
  console.log("admin dashboard");
};

// Medical History Controller
export const medicalHistoryCtrl = async (req, res) => {
  res.render("medical_history", { error: "" });
  console.log("medical_history");
};

// View Prescriptions Controller
export const viewPrescriptionsCtrl = async (req, res) => {
  res.render("prescription", { error: "" });
  console.log("prescription");
};

// View Attachments Controller
export const viewAttachmentsCtrl = async (req, res) => {
  res.render("attachments", { error: "" });
  console.log("attachments");
};

// Request Appointment Controller
export const requestAppoinmentCtrl = async (req, res, next) => {
  res.render("appointment_submit_page", { error: "" });
  console.log("appointment_submit_page");
};

// Create Prescription Controller
export const createPrescriptionCtrl = async (req, res) => {
  res.render("createPrescription", { error: "" });
  console.log("createPrescription");
};
