import { pool } from "../database/db.js";

// Test function to check appointments table and data format
const testAppointments = async () => {
  try {
    // Check if the appointments table exists and get its structure
    console.log("Checking appointments table structure...");
    const tableCheck = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'appointments'
    `);
    
    console.log("Appointments table structure:");
    console.table(tableCheck.rows);
    
    // Get a sample of appointments
    console.log("\nSample appointments from database:");
    const appointments = await pool.query(
      "SELECT * FROM appointments LIMIT 10"
    );
    
    if (appointments.rows.length > 0) {
      console.log("Sample appointment data:");
      appointments.rows.forEach((row, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`- appointmentid: ${row.appointmentid}`);
        console.log(`- studentid: ${row.studentid}`);
        console.log(`- doctorid: ${row.doctorid}`);
        console.log(`- appointmentdate: ${row.appointmentdate}`);
        console.log(`- appointmenttime: "${row.appointmenttime}" (${typeof row.appointmenttime})`);
      });
    } else {
      console.log("No appointment data found. Creating a test appointment...");
      
      // Create a test appointment with a specific time format
      const testDoctorId = "doctor123"; // Replace with an actual doctor ID from your database
      const testDate = new Date().toISOString().split("T")[0];
      const testTime = "15:00";
      
      await pool.query(
        `INSERT INTO appointments 
         (studentid, doctorid, appointmentdate, appointmenttime, reason, createdat, updatedat) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ["student123", testDoctorId, testDate, testTime, "Test appointment", new Date(), new Date()]
      );
      
      console.log(`Test appointment created for doctor ${testDoctorId} on ${testDate} at ${testTime}`);
    }
    
    console.log("\nTest completed successfully");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    pool.end();
  }
};

testAppointments();
