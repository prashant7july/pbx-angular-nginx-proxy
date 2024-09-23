Sure! Below is a complete implementation of an **Express.js (Node.js) API** that addresses **Privilege Escalation Vulnerability** by implementing **Role-Based Access Control (RBAC)** with **JWT authentication**.

### Steps Covered:
1. **JWT Authentication**: Token-based authentication to verify users.
2. **Role-Based Access Control (RBAC)**: Middleware to check user roles (e.g., `Admin`, `Tenant`).
3. **Securing Routes**: Apply these middlewares to protect sensitive routes.

### Setup:
1. Install the required dependencies using npm:

```bash
npm install express jsonwebtoken dotenv
```

2. Create a `.env` file to store your secret key (used for signing JWT tokens):

```
JWT_SECRET=mysecretkey
```

### Complete `app.js` File (Express.js API)

```javascript
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
app.post('/login', (req, res) => {
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
app.get('/admin/internal-users', authenticateJWT, checkRole(['Admin']), (req, res) => {
    res.json({ message: 'This is Admin-only content: Internal User List.' });
});

// Route accessible by both Admin and Tenant
app.get('/tenant/data', authenticateJWT, checkRole(['Admin', 'Tenant']), (req, res) => {
    res.json({ message: 'This is content accessible by Admin and Tenant roles.' });
});

// Route accessible by Tenant only
app.get('/tenant/only', authenticateJWT, checkRole(['Tenant']), (req, res) => {
    res.json({ message: 'This is Tenant-only content.' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

### Explanation of Key Components:

1. **JWT Token Generation**:
   - The `/login` route accepts a `username` and generates a JWT token if the user exists. This token contains the user's `id`, `username`, and `role`, and it expires after 1 hour.

2. **JWT Authentication Middleware (`authenticateJWT`)**:
   - This middleware verifies the token provided in the `Authorization` header. If the token is valid, the user information is attached to the request object (`req.user`).

3. **Role-Based Access Control (RBAC) Middleware (`checkRole`)**:
   - This middleware checks if the authenticated user has the required role(s) to access the route. If the user’s role doesn't match, the request is denied with a `403 Forbidden` status.

4. **Protected Routes**:
   - `/admin/internal-users`: Only accessible by users with the `Admin` role.
   - `/tenant/data`: Accessible by both `Admin` and `Tenant` roles.
   - `/tenant/only`: Accessible by users with the `Tenant` role only.

### Example Usage:

1. **Login to Obtain a Token**:

```bash
curl -X POST http://localhost:3000/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin"}'
```

Response:
```json
{
    "token": "your_generated_jwt_token"
}
```

2. **Access Admin-Only Content** (Using the Token):
   
```bash
curl -X GET http://localhost:3000/admin/internal-users \
    -H "Authorization: Bearer your_generated_jwt_token"
```

If the token is valid and belongs to an admin, you’ll get the response:
```json
{
    "message": "This is Admin-only content: Internal User List."
}
```

3. **Access Tenant-Specific Content** (Using the Token):
   
```bash
curl -X GET http://localhost:3000/tenant/data \
    -H "Authorization: Bearer your_generated_jwt_token"
```

Response (if the user has `Tenant` or `Admin` role):
```json
{
    "message": "This is content accessible by Admin and Tenant roles."
}
```

### Testing Different Roles:
1. For `admin`, try accessing both the `/admin/internal-users` and `/tenant/data` routes.
2. For `tenant`, login with `username: tenant` and try accessing `/tenant/data` and `/tenant/only`.

### Security Recommendations:
- **Token Expiration**: JWT tokens expire in 1 hour. You can adjust this based on your security requirements.
- **Secure JWT Secret**: Keep the `JWT_SECRET` secure by storing it in environment variables.
- **HTTPS**: Always use HTTPS in production to prevent token interception.

### Conclusion:
This Express.js app demonstrates how you can implement **JWT-based authentication** and **Role-Based Access Control (RBAC)** to prevent privilege escalation vulnerabilities. Users must have the correct roles to access sensitive data, which is securely managed by JWT and middleware for both authentication and role validation.

Let me know if you need more details or further enhancements to the system!


