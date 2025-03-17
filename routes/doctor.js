import express from 'express';
import { acceptAppointmentCtrl, createPrescriptionCtrl, doctorAppointmentsCtrl, doctorDashboardCtrl, doctorMedicalHistoryCtrl, getAvailableTimes, getDoctorCategories, getDoctorsByCategory, getMedicineDosagesCtrl, getStudentDataCtrl, prescribeCtrl, prescriptionCreateCtrl, prescriptionReadCtrl, rejectAppointmentCtrl, searchMedicinesCtrl, viewStudentMedicalHistoryCtrl } from '../controllers/doctor.js';
import { pool } from "../database/db.js"; // Add this import for the pool

const doctorRoutes = express.Router();

doctorRoutes.get('/prescription', prescriptionReadCtrl);

doctorRoutes.post('/prescription', prescriptionCreateCtrl);

//GET/doctor-dashboard  (isAuth needed)
doctorRoutes.get('/dashboard', doctorDashboardCtrl);

//GET/doctor-medical-history' (isAuth needed)
doctorRoutes.get('/medical-history', doctorMedicalHistoryCtrl );

//GET/doctor-appoinments' (isAuth needed)
doctorRoutes.get('/appointments', doctorAppointmentsCtrl);

// POST /appointments/:appointmentId/accept
doctorRoutes.post('/appointments/:appointmentId/accept', acceptAppointmentCtrl);

// POST /appointments/:appointmentId/reject
doctorRoutes.post('/appointments/:appointmentId/reject', rejectAppointmentCtrl);

//GET/create-prescription  (isAuth needed)
doctorRoutes.get('/create-prescription', createPrescriptionCtrl);

//GET/prescribe (isAuth needed)
doctorRoutes.get('/prescribe', prescribeCtrl);

// New route for fetching student data
doctorRoutes.get('/student/:studentId', getStudentDataCtrl);

// GET /doctor-categories
doctorRoutes.get('/doctor-categories', getDoctorCategories);

// GET /doctors
doctorRoutes.get('/doctors', getDoctorsByCategory);

// GET /available-times
doctorRoutes.get('/available-times', getAvailableTimes);

// New route for searching medicines
doctorRoutes.get('/medicines/search', searchMedicinesCtrl);

// New route for getting medicine dosages
doctorRoutes.get('/medicines/:medicineId/dosages', getMedicineDosagesCtrl);

// Add new route to check doctor session
doctorRoutes.get('/session-check', (req, res) => {
    const doctorId = req.session.userId;
    if (doctorId) {
        res.json({ authenticated: true, doctorId });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Add the new route for viewing student medical history
doctorRoutes.get('/student-medical-history', viewStudentMedicalHistoryCtrl);

// New routes for viewing prescriptions and attachments
doctorRoutes.get('/view-prescription/:prescriptionId', async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const doctorId = req.session.userId;
        
        // Check if prescription exists and belongs to this doctor
        const prescriptionResult = await pool.query(
            `SELECT p.*, s.fullname as patientname, d.fullname as doctorname, d.specialization
             FROM prescription p 
             JOIN student s ON p.studentid = s.studentid 
             JOIN doctor d ON p.doctorid = d.doctorid
             WHERE p.prescriptionid = $1 AND p.doctorid = $2`,
            [prescriptionId, doctorId]
        );
        
        if (prescriptionResult.rows.length === 0) {
            return res.status(404).send("Prescription not found");
        }
        
        // Fetch medications prescribed
        const medicationsResult = await pool.query(
            `SELECT pm.*, d.drugname 
             FROM prescriptionmedications pm 
             JOIN drug d ON pm.drugid = d.drugid 
             WHERE pm.prescriptionid = $1`,
            [prescriptionId]
        );
        
        res.render("viewPrescription", {
            prescription: prescriptionResult.rows[0],
            medications: medicationsResult.rows,
            error: ""
        });
    } catch (error) {
        console.error("Error viewing prescription:", error);
        res.status(500).send("Error loading prescription details");
    }
});

doctorRoutes.get('/view-attachments/:prescriptionId', async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        // Add logic to fetch attachments if you have them in your database
        // For now, we'll just redirect with a message
        req.session.message = "No attachments found for this prescription";
        res.redirect("/doctor/medical-history");
    } catch (error) {
        console.error("Error viewing attachments:", error);
        res.status(500).send("Error loading attachments");
    }
});

export default doctorRoutes;

//hello world comment