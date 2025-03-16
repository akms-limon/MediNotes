import pkg from 'uuid';
import { pool } from "../database/db.js";
const { v4: uuidv4 } = pkg;

// Doctor Dashboard Controller
export const doctorDashboardCtrl = async (req, res) => {
  const doctorId = req.session.userId;

  try {
    const doctor = await pool.query(
      "SELECT specialization FROM doctor WHERE doctorid = $1",
      [doctorId]
    );

    if (doctor.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const specialization = doctor.rows[0].specialization;
    res.render("doctorDashboard", { doctorId, specialization });
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ error: "An error occurred while fetching doctor details" });
  }
};

// Doctor Medical History Controller
export const doctorMedicalHistoryCtrl = async (req, res) => {
  res.render("doctorMedicalHistory", { error: "" });
  console.log("doctor medical history");
};

// Doctor Appointments Controller
export const doctorAppointmentsCtrl = async (req, res) => {
  res.render("doctorAppointments", { error: "" });
  console.log("doctor appointments");
};

// Create Prescription Controller
export const createPrescriptionCtrl = async (req, res) => {
  res.render("createPrescription", { error: "" });
  console.log("createPrescription");
};

// Prescribe Controller
export const prescribeCtrl = async (req, res) => {
  res.render("prescribe", { error: "" });
  console.log("prescribe");
};

export const prescriptionReadCtrl = (req, res) => {
  res.render("doctor/prescription", {
    error: "",
  });
};

export const prescriptionCreateCtrl = async (req, res) => {
  const prescriptionid = 1000 + Math.floor(Math.random() * 9000);
  // const prescriptionid = 2;
  const { studentid, doctorid, drugid } = req.body;

  const current_date = new Date();

  try {
    for (const drug of drugid) {
      const { id, doasage, instruction, days } = drug;
      await pool.query(
        "INSERT INTO prescriptions (prescriptionid, studentid, doctorid, createdate) VALUES ($1, $2, $3, $4)",
        [prescriptionid, studentid, doctorid, current_date],
        "INSERT INTO prescriptionmedications (prescriptionid, drugid, dosage, instruction, days, studentid, doctorid, createdate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [prescriptionid, id, doasage, instruction, days, studentid, doctorid, current_date]
      );
    }
    res.json({ message: "Prescription created successfully." });
  } catch (error) {
    console.error(error);
    return res.json({ error: "An error occurred while creating the prescription." });
  }
};

// Fetch Doctor Categories
export const getDoctorCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT specialization FROM doctor");
    res.json(result.rows.map(row => row.specialization));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching doctor categories." });
  }
};

// Fetch Doctors by Category
export const getDoctorsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const result = await pool.query("SELECT doctorid, fullname FROM doctor WHERE specialization = $1", [category]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching doctors." });
  }
};

// Fetch Available Times for a Doctor on a Specific Date
export const getAvailableTimes = async (req, res) => {
  const { doctorId, date } = req.query;
  try {
    const result = await pool.query(
      "SELECT appointmenttime FROM appointments WHERE doctorid = $1 AND appointmentdate = $2",
      [doctorId, date]
    );
    const bookedTimes = result.rows.map(row => row.appointmenttime);
    const allTimes = [
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
      "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", 
      "21:00"
    ];
    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));
    res.json(availableTimes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching available times." });
  }
};

