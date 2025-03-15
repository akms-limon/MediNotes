import express from 'express';
import { createPrescriptionCtrl, doctorAppointmentsCtrl, doctorDashboardCtrl, doctorMedicalHistoryCtrl, prescribeCtrl, prescriptionCreateCtrl, prescriptionReadCtrl } from '../controllers/doctor.js';

const doctorRoutes = express.Router();

doctorRoutes.get('/prescription', prescriptionReadCtrl);

doctorRoutes.post('/prescription', prescriptionCreateCtrl);

//GET/doctor-dashboard  (isAuth needed)
doctorRoutes.get('/dashboard', doctorDashboardCtrl);

//GET/doctor-medical-history' (isAuth needed)
doctorRoutes.get('/medical-history', doctorMedicalHistoryCtrl );

//GET/doctor-appoinments' (isAuth needed)
doctorRoutes.get('/appointments', doctorAppointmentsCtrl);

//GET/create-prescription  (isAuth needed)
doctorRoutes.get('/create-prescription', createPrescriptionCtrl);

//GET/prescribe (isAuth needed)
doctorRoutes.get('/prescribe', prescribeCtrl);

export default doctorRoutes;

//hello world comment