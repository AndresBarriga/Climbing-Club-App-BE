import express from 'express';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registrationPlusRoute = express.Router();

// Define the POST route for registration
registrationPlusRoute.post('/', (req,res) =>{
    // Log the received data from registration formulary on FE.
    console.log("Received data:", req.body);
    const { email, firstName, lastName } = req.body.form;

     // SQL query to check if the email already exists
  const checkEmailSql = "SELECT 1 FROM users WHERE email = $1";
  const checkEmailValues = [email.toLowerCase()]; // Convert email to lowercase to ensure case-insensitive comparison

  // Execute the check email query
  pgPool.query(checkEmailSql, checkEmailValues, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error during email check' });
    }

    if (result.rows.length > 0) {
      // Email already exists in the database
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // SQL query to insert the new user into the database
    const sql = "INSERT INTO users (email, token, name, last_name) VALUES ($1, $2, $3, $4)";
const values = [email, token, firstName, lastName];


    // Execute the SQL query
    pgPool.query(sql, values, async (err, result) => {
        // Handle any errors during the query
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Registration failed - database error' });
        }

        // If the query is successful, send an email to the user
        const msg = {
          to: email,
          from: 'andresbarrigaru@gmail.com', // Use the email address associated with your SendGrid account
          templateId: 'd-0a000b9e3c824bf2846e6763fcf106dd',
          subject: 'Complete your registration',
          dynamicTemplateData: {
            token: `${token}`,
          }
               };

        try {
          await sgMail.send(msg);
          console.log('User registered successfully');
          return res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Failed to send email' });
        }
    });
  });
});

export default registrationPlusRoute;