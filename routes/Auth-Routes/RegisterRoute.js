import express from 'express';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";



const app = express();

const registrationRoute = express.Router();
const saltRounds = 10


const pgPool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "climbing",
    password: "5813",
    port: 5432,
  })

  registrationRoute.post('/', (req,res) =>{
    console.log("Received data:", req.body);
    const {firstName, lastName, email, password} = req.body.form
  
  
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Password hashing error' });
      }
      const sql = "INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4)";
      const values = [firstName, lastName, email, hash]; // Use the hashed password
      pgPool.query(sql, values, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Registration failed - database error' });
        }
        console.log('User registered successfully');
        return res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
  export default registrationRoute;