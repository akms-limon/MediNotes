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
        bloodPressure: studentInfo?.bloodpressure || "Not recorded",
        allergies: studentInfo?.allergies || "None",
        medicalConditions: studentInfo?.medicalconditions || "None"
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

