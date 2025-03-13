import appErr from "../utils/appErr.js";
const isAuth = (req, res, next) => {
    //check if user is log in 
    if (req.session.userAuth) {
        next()
    }
    else {
        res.send("error");
        //res.render('users/notAuthorize');
    }
};
export default isAuth;