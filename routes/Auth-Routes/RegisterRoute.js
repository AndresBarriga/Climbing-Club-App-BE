import express from 'express';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";

import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});


const registrationRoute = express.Router();
const saltRounds = 10

// Define the POST route for registration
registrationRoute.post('/', (req,res) =>{
    // Log the received data from registration formulary on FE.
    console.log("Received data:", req.body);
    const {firstName, lastName, email, password} = req.body.form

    // Hash the password before storing it
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // Handle any errors during password hashing
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Password hashing error' });
      }

      // SQL query to insert the new user into the database
      const sql = "INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4)";
      const values = [firstName, lastName, email, hash]; // Use the hashed password to store in DB

      // Execute the SQL query
      pgPool.query(sql, values, (err, result) => {
        // Handle any errors during the query
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Registration failed - database error' });
        }

        // If the query is successful, log a success message and return a success response
        console.log('User registered successfully');
        return res.status(201).json({ message: 'User registered successfully' });
      });
    });
});

export default registrationRoute;