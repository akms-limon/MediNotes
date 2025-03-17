import express from "express";
import { appointmentCreateCtrl, medicalHistoryCtrl, requestAppoinmentCtrl, studentAppointmentsCtrl, studentDashboardCtrl, viewAttachmentsCtrl, viewPrescriptionCtrl, viewPrescriptionsCtrl, viewStudentAttachmentsCtrl } from "../controllers/student.js";
import { isAuthenticated } from "../middlewares/sessionCheck.js";

const studentRoutes = express.Router();

// Apply authentication middleware to all student routes
studentRoutes.use(isAuthenticated);

//GET/student-dashboard
studentRoutes.get('/dashboard', studentDashboardCtrl);

//GET/medical-history
studentRoutes.get('/medical-history', medicalHistoryCtrl);

//GET/view-prescriptions
studentRoutes.get('/view-prescriptions', viewPrescriptionsCtrl);

//GET/view-attachments
studentRoutes.get('/view-attachments', viewAttachmentsCtrl);

// New routes for viewing specific prescriptions and attachments
studentRoutes.get('/view-prescription/:prescriptionId', viewPrescriptionCtrl);
studentRoutes.get('/view-attachments/:prescriptionId', viewStudentAttachmentsCtrl);

//GET/request-appointment
studentRoutes.get('/request-appointment', requestAppoinmentCtrl);

//GET/student-appointments
studentRoutes.get('/appointments', studentAppointmentsCtrl);

// POST /api/appointments
studentRoutes.post('/appointment-create', appointmentCreateCtrl);

export default studentRoutes;
