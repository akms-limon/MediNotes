import { pool } from "../database/db.js";

// Student Dashboard Controller
export const studentDashboardCtrl = async (req, res) => {
  const studentId = req.session.userId;
  console.log("Student ID from session:", studentId);

  try {
    const student = await pool.query(
      "SELECT fullname, email FROM student WHERE studentid = $1",
      [studentId]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { fullname, email } = student.rows[0];
    res.render("studentDashboard", { studentId, fullname, email });
    console.log("student dashboard");
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "An error occurred while fetching student details" });
  }
};

// Medical History Controller for student
export const medicalHistoryCtrl = async (req, res) => {
  res.render("medical_history", { error: "" });
  console.log("medical_history");
};

// View Prescriptions Controller for student
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
  res.render("appointmentSubmit", { error: "" });
  console.log("appointment_submit_page");
};

// Student Appointments Controller
export const studentAppointmentsCtrl = async (req, res) => {
  const studentId = req.session.userId;
  
  try {
    // Join with doctor table to get doctor names
    const appointments = await pool.query(
      `SELECT a.*, d.fullname AS doctorname 
       FROM appointments a
       JOIN doctor d ON a.doctorid = d.doctorid
       WHERE a.studentid = $1
       ORDER BY a.appointmentdate, a.appointmenttime`,
      [studentId]
    );
    
    res.render("studentAppointments", { 
      appointments: appointments.rows,
      error: ""
    });
    console.log("Student appointments fetched:", appointments.rows.length);
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
    res.render("studentAppointments", { 
      appointments: [],
      error: "Failed to load appointments" 
    });
  }
};

// Handle Appointment Submission
export const appointmentCreateCtrl = async (req, res) => {
    console.log("Appointment request received:", req.body);
    console.log("Session data:", req.session); // Log entire session to debug
    
    const { selectDoctor, appointmentDate, appointmentTime, reason } = req.body;
    const studentId = req.session.userId || req.session.user?.id || req.session.studentId;
    
    console.log("Extracted student ID:", studentId);
    const currentTimestamp = new Date();

    // Validate required fields
    if (!selectDoctor || !appointmentDate || !appointmentTime || !reason) {
        console.error("Missing required fields in appointment request");
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if we have a student ID from any possible source in the session
    if (!studentId) {
        console.error("Student ID missing from session:", req.session);
        // For debugging: temporarily allow appointment creation with a default ID
        const tempId = "temporary_student_id"; // Remove this in production
        console.log("Using temporary student ID for debugging:", tempId);
        
        return res.status(401).json({ 
            error: "You must be logged in to book an appointment",
            session: JSON.stringify(req.session) // Include session info in error for debugging
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO appointments (studentid, doctorid, appointmentdate, appointmenttime, reason, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING appointmentid",
            [studentId, selectDoctor, appointmentDate, appointmentTime, reason, currentTimestamp, currentTimestamp]
        );
        
        console.log("Appointment created successfully:", result.rows[0]);
        res.status(201).json({ 
            message: "Appointment request submitted successfully",
            appointmentId: result.rows[0].appointmentid
        });
    } catch (error) {
        console.error("Database error creating appointment:", error.message);
        res.status(500).json({ error: "An error occurred while submitting the appointment request" });
    }
};
