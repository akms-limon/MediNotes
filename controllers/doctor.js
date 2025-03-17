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
  const doctorId = req.session.userId;
  
  try {
    // Fetch prescriptions created by this doctor
    const prescriptionsResult = await pool.query(
      `SELECT p.prescriptionid, p.date, s.fullname as patientname, 
              p.diagnosis, p.instruction 
       FROM prescription p 
       JOIN student s ON p.studentid = s.studentid 
       WHERE p.doctorid = $1 
       ORDER BY p.date DESC`,
      [doctorId]
    );
    
    res.render("doctorMedicalHistory", { 
      prescriptions: prescriptionsResult.rows,
      error: "" 
    });
    console.log("doctor medical history loaded successfully");
  } catch (error) {
    console.error("Error fetching prescription history:", error);
    res.render("doctorMedicalHistory", { 
      prescriptions: [],
      error: "Failed to load prescription history: " + error.message 
    });
  }
};

// Doctor Appointments Controller
export const doctorAppointmentsCtrl = async (req, res) => {
  const doctorId = req.session.userId;
  
  try {
    // Fetch appointments for this doctor without joining to patient table
    const appointmentsResult = await pool.query(
      "SELECT * FROM appointments WHERE doctorid = $1 ORDER BY appointmentdate, appointmenttime",
      [doctorId]
    );
    
    // Fetch corresponding patient names if needed
    // Since we don't know the exact table name, we'll just use the patient ID
    
    res.render("doctorAppointments", { 
      appointments: appointmentsResult.rows,
      error: "" 
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.render("doctorAppointments", { 
      appointments: [],
      error: "Failed to load appointments: " + error.message 
    });
  }
};

// Add these new controller functions
export const acceptAppointmentCtrl = async (req, res) => {
  const { appointmentId } = req.params;
  
  try {
    await pool.query(
      "UPDATE appointments SET status = true WHERE appointmentid = $1",
      [appointmentId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const rejectAppointmentCtrl = async (req, res) => {
  const { appointmentId } = req.params;
  
  try {
    await pool.query(
      "DELETE FROM appointments WHERE appointmentid = $1",
      [appointmentId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create Prescription Controller
export const createPrescriptionCtrl = async (req, res) => {
  const { studentId } = req.query;
  res.render("createPrescription", { studentId, error: "" });
  console.log("createPrescription");
};

// Prescribe Controller
export const prescribeCtrl = async (req, res) => {
  res.render("prescribe", { error: "" });
};

// New function to fetch student data
export const getStudentDataCtrl = async (req, res) => {
  const { studentId } = req.params;
  
  try {
    // Fetch basic student data from student table
    const studentResult = await pool.query(
      "SELECT * FROM student WHERE studentid = $1",
      [studentId]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    
    const student = studentResult.rows[0];
    console.log("Student basic data:", student); // Debug log
    
    // Try to fetch additional info from studentbasicinfo table
    let studentInfo = null;
    try {
      const basicInfoQuery = await pool.query(
        "SELECT * FROM studentbasicinfo WHERE studentid = $1",
        [studentId]
      );
      studentInfo = basicInfoQuery.rows.length > 0 ? basicInfoQuery.rows[0] : null;
      console.log("Student basic info data:", studentInfo); // Debug log
    } catch (infoError) {
      console.error("Error fetching student basic info:", infoError);
      // Continue execution even if this fails
      studentInfo = null;
    }
    
    // Try to get most recent blood pressure from prescription table
    let bloodPressure = "Not recorded";
    try {
      const bpQuery = await pool.query(
        "SELECT bloodpressure FROM prescription WHERE studentid = $1 ORDER BY date DESC LIMIT 1",
        [studentId]
      );
      if (bpQuery.rows.length > 0 && bpQuery.rows[0].bloodpressure) {
        bloodPressure = bpQuery.rows[0].bloodpressure;
      } else if (studentInfo?.bloodpressure) {
        // Fallback to basicinfo if available
        bloodPressure = studentInfo.bloodpressure;
      }
    } catch (bpError) {
      console.error("Error fetching blood pressure:", bpError);
      // Keep default value
    }
    
    // Prepare the response
    res.json({ 
      success: true, 
      student: {
        id: student.studentid,
        name: student.fullname || "Student",
        department: student.department || "Not available",
        email: student.email || "Not available",
        phone: student.phone || student.phonenumber || "Not available", // Check both possible field names
        
        // Only include these fields if studentInfo exists and has the property
        height: studentInfo?.height || "Not recorded",
        weight: studentInfo?.weight || "Not recorded",
        bloodGroup: studentInfo?.bloodgroup || "Not recorded",
        bloodPressure: bloodPressure
      }
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const prescriptionReadCtrl = (req, res) => {
  res.render("doctor/prescription", {
    error: "",
  });
};

export const prescriptionCreateCtrl = async (req, res) => {
  try {
    // Generate a numeric prescription ID instead of UUID
    const prescriptionId = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    const { 
      studentId, 
      diagnosis, 
      bloodPressure, 
      notes,
      medicines 
    } = req.body;
    
    const doctorId = req.session.userId;
    
    // Enhanced session check with more detailed error
    if (!doctorId) {
      console.log("Doctor session expired during prescription creation");
      return res.status(401).json({ 
        success: false, 
        error: "Your session has expired. Please login again to continue.",
        sessionExpired: true  // Flag to indicate session expiration
      });
    }
    
    const currentDate = new Date();
    
    // Validate required data
    if (!studentId || !medicines || !medicines.length) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required data: student ID and at least one medicine are required" 
      });
    }
    
    // Begin a database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log("Inserting prescription with ID:", prescriptionId, "Type:", typeof prescriptionId);
      
      // First query: Insert into prescription table
      await client.query(
        `INSERT INTO prescription (
          prescriptionid, studentid, doctorid, date, diagnosis, bloodpressure, instruction
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [prescriptionId, studentId, doctorId, currentDate, diagnosis, bloodPressure, notes]
      );
      
      // Second query: Insert each medicine into prescriptionmedications table
      // and update drug quantities
      for (const medicine of medicines) {
        // Convert duration string to integer days
        let days = 0;
        if (medicine.duration.includes('days')) {
          days = parseInt(medicine.duration);
        } else if (medicine.duration.includes('month')) {
          const months = parseInt(medicine.duration);
          days = months * 30;
        } else if (medicine.duration === 'Continuous') {
          days = 90; // Default continuous prescription to 90 days
        } else {
          const parsedDays = parseInt(medicine.duration);
          days = isNaN(parsedDays) ? 0 : parsedDays;
        }
        
        // Ensure drugId is an integer
        const drugId = parseInt(medicine.medicineId);
        if (isNaN(drugId)) {
          throw new Error(`Invalid medicine ID: ${medicine.medicineId}`);
        }
        
        // Execute separate INSERT statement for each medicine
        await client.query(
          `INSERT INTO prescriptionmedications (
            prescriptionid, drugid, dosage, days, studentid, doctorid, 
            createdate, timesperday, prepostmeal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            prescriptionId,
            drugId,
            medicine.dosage,
            days,
            studentId,
            doctorId,
            currentDate,
            medicine.timesPerDay, // Store the full formatted text (e.g. "1 + 0 + 0")
            medicine.prepostmeal || 'Not specified'
          ]
        );
        
        // Update drug quantity in the drug table (decrease by 1)
        const drugResult = await client.query(
          'UPDATE drug SET quantity = quantity - 1 WHERE drugid = $1 AND quantity > 0 RETURNING quantity',
          [drugId]
        );
        
        if (drugResult.rows.length === 0) {
          // If no rows were updated, it might mean the drug is out of stock
          // Log this but don't fail the transaction
          console.warn(`Could not update quantity for drug ID ${drugId} - it may be out of stock`);
        } else {
          console.log(`Updated quantity for drug ID ${drugId}, new quantity: ${drugResult.rows[0].quantity}`);
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({ 
        success: true, 
        message: "Prescription created successfully.",
        prescriptionId: prescriptionId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Database error during prescription creation:", error);
      
      // Provide more specific error message based on the error
      let errorMessage = "An error occurred while creating the prescription.";
      if (error.code === '22P02') {
        errorMessage = "Invalid data type detected. Please check all input values.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An error occurred while creating the prescription."
    });
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
    // Define all possible time slots
    const timeSlots = [
      "15:00", "15:30", 
      "16:00", "16:30", 
      "17:00", "17:30", 
      "18:00", "18:30", 
      "19:00", "19:30", 
      "20:00"
    ];
    
    // Fetch booked appointments for the doctor on the specified date
    const bookedResult = await pool.query(
      "SELECT appointmenttime FROM appointments WHERE doctorid = $1 AND appointmentdate = $2",
      [doctorId, date]
    );
    
    console.log(`Checking appointments for doctorId ${doctorId} on date ${date}`);
    
    // Get array of booked times, ensuring consistent format by removing seconds
    const bookedTimes = bookedResult.rows.map(row => {
      // Convert database time format (may include seconds) to HH:MM format
      let time = String(row.appointmenttime).trim();
      
      // If the time includes seconds (HH:MM:SS), remove the seconds part
      if (time.split(":").length > 2) {
        time = time.substring(0, 5); // Take only HH:MM part
      }
      
      console.log(`Raw time from database: "${row.appointmenttime}" → Normalized to: "${time}"`);
      
      return time;
    });
    
    console.log("Normalized booked times:", bookedTimes);
    
    // Filter available times by removing booked ones
    const availableTimes = timeSlots.filter(slot => {
      const isBooked = bookedTimes.includes(slot);
      console.log(`Checking slot ${slot} - Booked: ${isBooked}`);
      return !isBooked;
    });
    
    console.log("Final available times:", availableTimes);
    
    // Send the available time slots to the client
    res.json(availableTimes);
  } catch (error) {
    console.error("Error fetching available times:", error);
    res.status(500).json({ error: "An error occurred while fetching available times." });
  }
};

// Search medicines with stock information
export const searchMedicinesCtrl = async (req, res) => {
  const { query } = req.query;
  
  try {
    // Include dosage information in the query
    let searchQuery = "SELECT drugid, drugname, quantity, dosage FROM drug WHERE drugname ILIKE $1 ORDER BY drugname ASC";
    const result = await pool.query(searchQuery, [`%${query}%`]);
    
    const medicines = result.rows.map(row => ({
      id: row.drugid,
      name: row.drugname,
      quantity: row.quantity,
      isAvailable: row.quantity > 0,
      dosage: row.dosage // Include dosage in the response
    }));
    
    res.json({ success: true, medicines });
  } catch (error) {
    console.error("Error searching medicines:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available dosages for a specific medicine
export const getMedicineDosagesCtrl = async (req, res) => {
  const { medicineId } = req.params;
  
  try {
    // Adjust column name to match your database structure
    // If dosage column name is different, replace it here
    const result = await pool.query(
      "SELECT dosage FROM drug WHERE drugid = $1",
      [medicineId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Medicine not found" });
    }
    
    // Parse dosages if stored as array/JSON, or split by comma if stored as string
    let dosages = result.rows[0].dosage;
    
    // If dosage is stored as a string with comma separators
    if (typeof dosages === 'string') {
      dosages = dosages.split(',').map(d => d.trim());
    } 
    // If dosage is null or not in expected format, return a default dosage array
    else if (!dosages || !Array.isArray(dosages)) {
      dosages = ["250mg", "500mg", "750mg", "1000mg"];
    }
    
    res.json({ success: true, dosages });
  } catch (error) {
    console.error("Error fetching medicine dosages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// View a specific student's medical history
export const viewStudentMedicalHistoryCtrl = async (req, res) => {
  const { studentId } = req.query;
  const doctorId = req.session.userId;
  
  try {
    // First get student details
    const studentResult = await pool.query(
      "SELECT fullname, email, department FROM student WHERE studentid = $1",
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).render("doctorViewStudentHistory", { 
        student: null,
        prescriptions: [],
        error: "Student not found" 
      });
    }

    const student = studentResult.rows[0];
    
    // Fetch prescriptions for this student with doctor information
    const prescriptionsResult = await pool.query(
      `SELECT p.prescriptionid, p.date, d.fullname as doctorname, 
              d.specialization, p.diagnosis, p.instruction 
       FROM prescription p 
       JOIN doctor d ON p.doctorid = d.doctorid 
       WHERE p.studentid = $1 
       ORDER BY p.date DESC`,
      [studentId]
    );
    
    res.render("doctorViewStudentHistory", { 
      student: student,
      prescriptions: prescriptionsResult.rows,
      error: "" 
    });
    console.log("doctor viewing student medical history successfully");
  } catch (error) {
    console.error("Error fetching student prescription history:", error);
    res.render("doctorViewStudentHistory", { 
      student: null,
      prescriptions: [],
      error: "Failed to load prescription history: " + error.message 
    });
  }
};

