import pkg from 'uuid';
import { pool } from "../database/db.js";
const { v4: uuidv4 } = pkg;

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

