import { pool } from '../database/db.js'; // Changed from default to named import

// Get admin dashboard with pending doctors
export const getDashboard = async (req, res) => {
    try {
        // Check if user is admin (you might have different logic for this)
        if (!req.session.userId || req.session.role !== 'admin') {
            return res.redirect('/login');
        }

        // Get admin info
        const adminQuery = await pool.query(
            'SELECT * FROM users WHERE userid = $1 AND role = $2',
            [req.session.userId, 'admin']
        );
        
        if (adminQuery.rows.length === 0) {
            return res.redirect('/login');
        }

        const admin = adminQuery.rows[0];
        
        // Get pending doctors
        const pendingDoctorsQuery = await pool.query(
            'SELECT * FROM doctors WHERE status = $1',
            ['pending']
        );
        
        const pendingDoctors = pendingDoctorsQuery.rows;
        
        // Render admin dashboard
        res.render('adminDashboard', {
            admin,
            pendingDoctors
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.render('adminDashboard', {
            error: 'Error loading admin dashboard',
            admin: req.session.user,
            pendingDoctors: []
        });
    }
};

// Approve doctor
export const approveDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        
        // Update doctor status to approved
        const updateResult = await pool.query(
            'UPDATE doctor SET status = $1 WHERE doctorid = $2 RETURNING *',
            [1, doctorId]  // Changed from 'approved' to 1 to match schema
        );
        
        if (updateResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        
        res.json({ success: true, message: 'Doctor approved successfully' });
    } catch (error) {
        console.error('Error approving doctor:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        
        // Update doctor status to rejected
        const updateResult = await pool.query(
            'UPDATE doctor SET status = $1 WHERE doctorid = $2 RETURNING *',
            [-1, doctorId]  // Changed from 'rejected' to -1 to match schema
        );
        
        if (updateResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        
        res.json({ success: true, message: 'Doctor rejected successfully' });
    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};