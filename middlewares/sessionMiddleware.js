/**
 * Middleware to verify user authentication
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Refresh the session on activity
    req.session.touch();
    return next();
  }
  
  // Determine if request is API or page request
  if (req.xhr || req.path.startsWith('/api/')) {
    // For AJAX/API requests, return JSON response
    return res.status(401).json({ 
      success: false, 
      error: "Session expired, please login again",
      sessionExpired: true
    });
  }
  
  // For regular requests, redirect to homepage
  return res.redirect('/');
};

/**
 * Role-based authentication
 */
export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.session && req.session.role === role) {
      return next();
    }
    
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(403).json({ 
        success: false, 
        error: "You don't have permission to access this resource" 
      });
    }
    
    return res.redirect('/');
  };
};
