import express from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import Pool from 'pg-pool';

const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})


const loginRouter = express.Router();

loginRouter.post('/', (req, res) => {
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
        const token = jwt.sign({ user_id: user.id }, 'your-secret-key');
        return res.json({ message: "Authorized", token });
      } else {
        return res.json("Invalid email or password");
      }
    });
  });
});

export default loginRouter;
