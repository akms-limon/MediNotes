import express from 'express';
import { acceptAppointmentCtrl, createPrescriptionCtrl, doctorAppointmentsCtrl, doctorDashboardCtrl, doctorMedicalHistoryCtrl, getAvailableTimes, getDoctorCategories, getDoctorsByCategory, getStudentDataCtrl, prescribeCtrl, prescriptionCreateCtrl, prescriptionReadCtrl, rejectAppointmentCtrl } from '../controllers/doctor.js';

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

export default doctorRoutes;

//hello world comment