import express from "express";
import { appointmentCreateCtrl, medicalHistoryCtrl, requestAppoinmentCtrl, studentAppointmentsCtrl, studentDashboardCtrl, viewAttachmentsCtrl, viewPrescriptionsCtrl } from "../controllers/student.js";
const studentRoutes = express.Router();

//GET/student-dashboard (isAuth needed)
studentRoutes.get('/dashboard', studentDashboardCtrl);

//GET/medical-history' (isAuth needed)
studentRoutes.get('/medical-history', medicalHistoryCtrl );

//GET/view-prescriptions' (isAuth needed)
studentRoutes.get('/view-prescriptions', viewPrescriptionsCtrl );

//GET/view-attachments' (isAuth needed)
studentRoutes.get('/view-attachments', viewAttachmentsCtrl );

//GET/request-appointment' (isAuth needed)
studentRoutes.get('/request-appointment', requestAppoinmentCtrl );

//GET/student-appointments' (isAuth needed)
studentRoutes.get('/appointments', studentAppointmentsCtrl);

// POST /api/appointments (isAuth needed)
studentRoutes.post('/appointment-create', appointmentCreateCtrl);

export default studentRoutes;
