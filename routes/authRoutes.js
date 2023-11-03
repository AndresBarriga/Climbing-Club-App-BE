import express from 'express';
import bcrypt from 'bcrypt';
import Pool from 'pg-pool';

const app = express();


const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})
const router = express.Router();

app.post('/auth', (req, res) => {
  const { email, password } = req.body.form;

  const sql = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  pgPool.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Login Failed - error");
    }

    if (data.rows.length === 0) {
      return res.json("Invalid email or password");
    }

    const user = data.rows[0];

    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.error(err);
        return res.status(500).json("Login Failed - error");
      }

      if (result) {
        // Passwords match, the user is authorized
        req.session.user_id = user.user_id // Set the user's ID in the session
        return res.json("Authorized");
        
      } else {
        return res.json("Invalid email or password");
      }
    });
  });
});





export default router;