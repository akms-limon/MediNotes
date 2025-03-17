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
    return res.render("signup", { 
      error: "All fields are required",
      formData: req.body
    });
  }

  try {
    // Check if email exists in either table (but use separate queries)
    const studentEmailCheck = await pool.query(
      "SELECT * FROM student WHERE email = $1",
      [email]
    );

    const doctorEmailCheck = await pool.query(
      "SELECT * FROM doctor WHERE email = $1",
      [email]
    );

    if (studentEmailCheck.rows.length > 0 || doctorEmailCheck.rows.length > 0) {
      return res.render("signup", { 
        error: "Email is already taken",
        formData: req.body
      });
    }

    // Check ID only in the relevant table based on role
    if (role === "student") {
      const studentIdCheck = await pool.query(
        "SELECT * FROM student WHERE studentid = $1",
        [Id]
      );

      if (studentIdCheck.rows.length > 0) {
        return res.render("signup", { 
          error: "Student ID is already taken",
          formData: req.body
        });
      }
    } else if (role === "doctor") {
      const doctorIdCheck = await pool.query(
        "SELECT * FROM doctor WHERE doctorid = $1",
        [Id]
      );

      if (doctorIdCheck.rows.length > 0) {
        return res.render("signup", { 
          error: "Doctor ID is already taken",
          formData: req.body
        });
      }
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
        [Id, fullname, email, passwordHashed, 0, specialization] // Changed status from 1 to 0 (pending approval)
      );
    } else {
      return res.render("signup", { 
        error: "Invalid role specified",
        formData: req.body
      });
    }

    res.render("login", { error: "", formData: {} });
    console.log("User registered successfully");
  } catch (error) {
    console.error("Database error:", error.message);
    res.render("signup", { 
      error: "An error occurred during registration. Please try again.",
      formData: req.body
    });
  }
};

// Login Controller
export const loginCtrl = async (req, res) => {
  const { email, password } = req.body;

  // Check if fields are empty
  if (!email || !password) {
    return res.render("login", { error: "All fields are required" });
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

    // Check if email exists in admin table
    const adminFound = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
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
    } else if (adminFound.rows.length > 0) {
      user = adminFound.rows[0];
      role = "admin";
    } else {
      return res.render("login", { error: "Invalid login credentials" });
    }

    // Additional check for doctor authorization status
    if (role === "doctor" && user.status === 0) {
      return res.render("login", { 
        error: "Your account is pending authorization. Please contact the administrator.",
        waitingForApproval: true
      });
    }

    // Validate password (different handling for admin as password is not hashed)
    let isPasswordValid = false;
    if (role === "admin") {
      isPasswordValid = (password === user.password); // Direct comparison for admin
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.render("login", { error: "Invalid login credentials" });
    }

    // Save the user ID and role in the session
    req.session.userId = user.studentid || user.doctorid || user.adminid;
    req.session.role = role;

    // Redirect to appropriate dashboard
    if (role === "student") {
      console.log("student");
      res.redirect('/student/dashboard');
    } else if (role === "doctor") {
      res.redirect('/doctor/dashboard');
    } else if (role === "admin") {
      res.redirect('/admin-dashboard');
    }
  } catch (error) {
    console.error(error);
    return res.render("login", { error: "An error occurred while logging in. Please try again." });
  }
};

// Admin Dashboard Controller
export const adminDashboardCtrl = async (req, res) => {
  try {
    // Check if user is authenticated as admin
    if (req.session.role !== 'admin') {
      return res.redirect('/login');
    }

    // Fetch admin details
    const adminResult = await pool.query(
      "SELECT * FROM admin WHERE adminid = $1",
      [req.session.userId]
    );

    if (adminResult.rows.length === 0) {
      return res.redirect('/login');
    }

    const admin = adminResult.rows[0];

    // Fetch pending doctor information for admin dashboard
    const pendingDoctors = await pool.query(
      "SELECT * FROM doctor WHERE status = 0" // Changed from status 1 to status 0 for pending
    );

    // Render admin dashboard with admin and pending doctors information
    res.render("adminDashboard", { 
      admin: admin,
      pendingDoctors: pendingDoctors.rows
    });

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.render("adminDashboard", { 
      error: "Failed to load dashboard data",
      admin: null,
      pendingDoctors: []
    });
  }
};

// New admin controllers for doctor authorization
export const approveDoctorCtrl = async (req, res) => {
  try {
    // Check if user is authenticated as admin
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const doctorId = req.params.id;
    
    await pool.query(
      "UPDATE doctor SET status = 1 WHERE doctorid = $1",
      [doctorId]
    );
    
    return res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (error) {
    console.error('Error approving doctor:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectDoctorCtrl = async (req, res) => {
  try {
    // Check if user is authenticated as admin
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const doctorId = req.params.id;
    
    await pool.query(
      "UPDATE doctor SET status = -1 WHERE doctorid = $1", // Use -1 for rejected status
      [doctorId]
    );
    
    return res.json({ success: true, message: 'Doctor rejected successfully' });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPendingDoctorsCtrl = async (req, res) => {
  try {
    // Check if user is authenticated as admin
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }
    
    const result = await pool.query("SELECT * FROM doctor WHERE status = 0");
    return res.json({ success: true, pendingDoctors: result.rows });
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};