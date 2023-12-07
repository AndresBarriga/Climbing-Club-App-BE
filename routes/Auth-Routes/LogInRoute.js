
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import Pool from 'pg-pool';

// Set up PostgreSQL connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})

// Create a new router for login
const loginRouter = express.Router();

// Define the POST route for login
loginRouter.post('/', (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body.form;

  // SQL query to find the user with the provided email
  const sql = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  // Execute the SQL query
  pgPool.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Login Failed - error");
    }
    // If no user is found, return an error
    if (data.rows.length === 0) {
      return res.json("Invalid email or password");
    }
    // If a user is found, compare the provided password with the stored password
    const user = data.rows[0];
    bcrypt.compare(password, user.password, function(err, result) {
      // Handle any errors during password comparison
      if (err) {
        console.error(err);
        return res.status(500).json("Login Failed - error");
      }
      // If the password is correct, sign a JWT and return it
      if (result) {
        const token = jwt.sign({ user_id: user.user_id }, 'your-secret-key', { expiresIn: '1h' });
        return res.json({ message: "Authorized", token , initial_preferences: user.initial_preferences });
      } else {
        return res.json("Invalid email or password");
      }
    });
  });
});

export default loginRouter;