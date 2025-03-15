import express from "express";
import { doctorDashboardCtrl, loginCtrl, signupCtrl, studentDashboardCtrl,
  adminDashboardCtrl, medicalHistoryCtrl,viewAttachmentsCtrl,
  viewPrescriptionsCtrl,requestAppoinmentCtrl, studentAppointmentsCtrl, 
  doctorAppointmentsCtrl, createPrescriptionCtrl, doctorMedicalHistoryCtrl,
  prescribeCtrl
} from "../controllers/users.js";
const userRoutes = express.Router();


userRoutes.get("/", (req, res) => {
  res.render("homepage", {
    error: "",
  });
});

userRoutes.get("/login", (req, res) => {
  res.render("login", {
    error: "",
  });
});

//register form
userRoutes.get("/signup", (req, res) => {
  res.render("signup", {
    error: "",
  });
});




//POST/register
userRoutes.post('/signup', signupCtrl);

//POST/login
userRoutes.post('/login', loginCtrl);

//GET/student-dashboard (isAuth needed)
userRoutes.get('/student-dashboard', studentDashboardCtrl);


//GET/medical_history' (isAuth needed)
userRoutes.get('/medical-history', medicalHistoryCtrl );

//GET/doctor-medical-history' (isAuth needed)
userRoutes.get('/doctor-medical-history', doctorMedicalHistoryCtrl );

//GET/viewPrescriptions' (isAuth needed)
userRoutes.get('/view-prescriptions',viewPrescriptionsCtrl );

//GET/viewAttachments' (isAuth needed)
userRoutes.get('/view-attachments',viewAttachmentsCtrl );

//GET/request-appointment' (isAuth needed)
userRoutes.get('/request-appoinment',requestAppoinmentCtrl );

//GET/student-appoinments' (isAuth needed)
userRoutes.get('/student-appointments',  studentAppointmentsCtrl);

//GET/doctor-appoinments' (isAuth needed)
userRoutes.get('/doctor-appointments',  doctorAppointmentsCtrl);

//GET/doctor-dashboard  (isAuth needed)
userRoutes.get('/doctor-dashboard', doctorDashboardCtrl);

//GET/create-prescription  (isAuth needed)
userRoutes.get('/create-prescription', createPrescriptionCtrl);

//GET/admin-dashboard  (isAuth needed)
userRoutes.get('/admin-dashboard', adminDashboardCtrl);

//GET/prescribe (isAuth needed)
userRoutes.get('/prescribe', prescribeCtrl);

export default userRoutes;
