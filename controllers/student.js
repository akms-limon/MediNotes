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
  res.render("studentAppointments", { error: "" });
  console.log("Student appointments");
};

// Handle Appointment Submission
export const appointmentCreateCtrl = async (req, res) => {
    const { selectDoctor, appointmentDate, appointmentTime, reason } = req.body;
    const studentId = req.session.userId;
    const currentTimestamp = new Date();

    if (!studentId) {
        return res.status(400).json({ error: "Student ID is missing from session" });
    }

    try {
        await pool.query(
            "INSERT INTO appointments (studentid, doctorid, appointmentdate, appointmenttime, reason, createdat, updatedat) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [studentId, selectDoctor, appointmentDate, appointmentTime, reason, currentTimestamp, currentTimestamp]
        );
        res.status(201).json({ message: "Appointment request submitted successfully" });
    } catch (error) {
        console.error("Database error:", error.message);
        res.status(500).json({ error: "An error occurred while submitting the appointment request" });
    }
};
