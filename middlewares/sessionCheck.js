/**
 * Middleware to check if user is authenticated through session
 */
export const isAuthenticated = (req, res, next) => {
    console.log("Session check middleware running");
    console.log("Current session:", req.session);
    
    // Check if user is authenticated
    if (req.session && (req.session.userId || req.session.user)) {
        console.log("User is authenticated, proceeding");
        next();
    } else {
        console.log("Authentication failed, redirecting to login");
        if (req.xhr) {
            // For AJAX requests
            return res.status(401).json({ error: "Session expired. Please log in again." });
        } else {
            // For regular requests
            return res.redirect('/login');
        }
    }
};
