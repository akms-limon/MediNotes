import express from 'express';
import { prescriptionCreateCtrl, prescriptionReadCtrl } from '../controllers/doctor.js';

const doctorRoutes = express.Router();

doctorRoutes.get('/prescription', prescriptionReadCtrl);

doctorRoutes.post('/prescription', prescriptionCreateCtrl);

export default doctorRoutes;