import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
    console.log('Aut Token route hit');
    const authHeader = req.headers['authorization'];
    console.log("auth header",authHeader)
    const token = authHeader && authHeader.split(' ')[1];
    console.log("token",token)
    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, 'your-secret-key', (err, payload) => {
        if (err) {
          console.log(err)
          return res.sendStatus(403);
        }
        req.user_id = payload.user_id; 
        console.log(req.user_id) // Extract the user_id from the payload of the token
        next();
      });
}

export default authenticateToken;
