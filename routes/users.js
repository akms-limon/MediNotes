import express from "express";
import { doctorDashboardCtrl, loginCtrl, signupCtrl, studentDashboardCtrl,adminDashboardCtrl,
  medicalHistoryCtrl,viewAttachmentsCtrl,viewPrescriptionsCtrl,requestAppoinmentCtrl ,
  createPrescriptionCtrl} from "../controllers/users.js";
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
userRoutes.get('/medical-history',medicalHistoryCtrl );

//GET/viewPrescriptions' (isAuth needed)
userRoutes.get('/view-prescriptions',viewPrescriptionsCtrl );

//GET/viewAttachments' (isAuth needed)
userRoutes.get('/view-attachments',viewAttachmentsCtrl );

//GET/request-appointment' (isAuth needed)
userRoutes.get('/request-appoinment',requestAppoinmentCtrl );

//GET/doctor-dashboard  (isAuth needed)
userRoutes.get('/doctor-dashboard', doctorDashboardCtrl);

//GET/create-prescription  (isAuth needed)
userRoutes.get('/create-prescription', createPrescriptionCtrl);

//GET/admin-dashboard  (isAuth needed)
userRoutes.get('/admin-dashboard', adminDashboardCtrl);

//medical history


export default userRoutes;
