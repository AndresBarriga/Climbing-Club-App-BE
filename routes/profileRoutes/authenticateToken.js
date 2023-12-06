import jwt from 'jsonwebtoken'

// Middleware function to authenticate the JWT
function authenticateToken(req, res, next) {
  
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401); // if there isn't any token send 401

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, payload) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403);
    }
    req.user_id = payload.user_id; 
     // Extract the user_id from the payload of the token
    next();
  });
}

export default authenticateToken;