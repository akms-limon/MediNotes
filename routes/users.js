import express from "express";
import {
    adminDashboardCtrl,
    approveDoctorCtrl,
    getPendingDoctorsCtrl,
    loginCtrl,
    rejectDoctorCtrl,
    signupCtrl
} from "../controllers/users.js";
import { pool } from "../database/db.js"; // Add this import to fix the missing pool reference

const userRoutes = express.Router();

userRoutes.get("/", (req, res) => {
  res.render("homepage", {
    error: "",
  });
});

userRoutes.get("/login", (req, res) => {
  const error = "";
  res.render("login", {
    error,
  });
});

//register form
userRoutes.get("/signup", (req, res) => {
  res.render("signup", {
    error: "",
    formData: {}
  });
});

//POST/register
userRoutes.post('/signup', signupCtrl);

//POST/login
userRoutes.post('/login', loginCtrl);

//GET/admin-dashboard  (isAuth needed)
userRoutes.get('/admin-dashboard', adminDashboardCtrl);

// Doctor verification and rejection endpoints
userRoutes.put('/approve-doctor/:id', approveDoctorCtrl);
userRoutes.put('/reject-doctor/:id', rejectDoctorCtrl);
userRoutes.get('/pending-doctors', getPendingDoctorsCtrl);

// Update existing doctor verification endpoint to use the new controller
userRoutes.put('/verify-doctor/:id', approveDoctorCtrl); // Point to the new controller

userRoutes.get('/search-doctors', async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    const query = req.query.query.toLowerCase();
    
    // Search for accepted doctors (status = 2)
    const result = await pool.query(
      "SELECT * FROM doctor WHERE status = 2 AND (LOWER(fullname) LIKE $1 OR LOWER(doctorid::text) LIKE $1)",
      [`%${query}%`]
    );
    
    return res.json({ success: true, doctors: result.rows });
  } catch (error) {
    console.error('Error searching doctors:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default userRoutes;
