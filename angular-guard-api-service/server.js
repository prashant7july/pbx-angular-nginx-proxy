const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Mock User Database
const users = [
    { id: 1, username: 'admin', role: 'Admin' },
    { id: 2, username: 'tenant', role: 'Tenant' },
];

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Function to generate JWT tokens
function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

// Middleware to authenticate JWT token and attach user to request
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user; // Attach the decoded user to the request
        next();
    });
}

// Middleware to check for specific roles
function checkRole(roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
        }
        next();
    };
}

// Route for user login (mock login for simplicity)
app.post('/api/login', (req, res) => {
    const { username } = req.body;

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);
    res.json({ token });
});

// Admin-only route (must have the "Admin" role)
app.get('/api/admin/internal-users', authenticateJWT, checkRole(['Admin']), (req, res) => {
    res.json({ message: 'This is Admin-only content: Internal User List.' });
});

// Route accessible by both Admin and Tenant
app.get('/api/tenant/data', authenticateJWT, checkRole(['Admin', 'Tenant']), (req, res) => {
    res.json({ message: 'This is content accessible by Admin and Tenant roles.' });
});

// Route accessible by Tenant only
app.get('/api/tenant/only', authenticateJWT, checkRole(['Tenant']), (req, res) => {
    res.json({ message: 'This is Tenant-only content.' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
