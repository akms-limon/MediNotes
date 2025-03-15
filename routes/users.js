import express from "express";
import { adminDashboardCtrl, loginCtrl, signupCtrl } from "../controllers/users.js";
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

//GET/admin-dashboard  (isAuth needed)
userRoutes.get('/admin-dashboard', adminDashboardCtrl);

export default userRoutes;
