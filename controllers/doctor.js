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

