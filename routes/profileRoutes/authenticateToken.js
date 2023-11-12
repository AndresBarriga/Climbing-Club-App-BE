import jwt from "jsonwebtoken";

// Middleware function to authenticate the JWT
function authenticateToken(req, res, next) {
  // Extract the auth header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is found, return a 401 status
  if (token == null) return res.sendStatus(401);

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, user) => {
    // If the token is invalid, return a 403 status
    if (err) return res.sendStatus(403);

    // If the token is valid, set the user object in the request and call the next middleware
    req.user = user;
    next();
  });
}

export default authenticateToken;