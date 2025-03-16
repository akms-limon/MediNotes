import { pool } from "./db.js";

const createAppointmentsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                appointmentid SERIAL PRIMARY KEY,
                studentid VARCHAR(255) NOT NULL,
                doctorid VARCHAR(255) NOT NULL,
                appointmentdate DATE NOT NULL,
                appointmenttime VARCHAR(10) NOT NULL,
                reason TEXT,
                createdat TIMESTAMP NOT NULL,
                updatedat TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'pending'
            );
        `);
        console.log("Appointments table created or already exists");
    } catch (error) {
        console.error("Error creating appointments table:", error);
    }
};

createAppointmentsTable();

export default createAppointmentsTable;
