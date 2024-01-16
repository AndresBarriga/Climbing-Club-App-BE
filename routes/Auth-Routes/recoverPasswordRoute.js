import express from 'express';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';


dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
 connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
 ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const recoverPasswordRoute = express.Router();

recoverPasswordRoute.post('/', (req, res) => {
 const { email } = req.body.form;

 // SQL query to check if the email already exists
 const checkEmailSql = "SELECT * FROM users WHERE email = $1";
 const checkEmailValues = [email.toLowerCase()]; // Convert email to lowercase to ensure case-insensitive comparison

 // Execute the check email query
 pgPool.query(checkEmailSql, checkEmailValues, (err, result) => {
   if (err) {
     console.error(err);
     return res.status(500).json({ error: 'Database error during email check' });
   }

   if (result.rows.length > 0) {
    console.log(result.rows[0]);
     // Email already exists in the database
    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // SQL query to insert the new user into the database
    const sql = `
 INSERT INTO recover_password (user_id, token, created_at) 
 VALUES ($1, $2, NOW())
 ON CONFLICT (user_id) DO UPDATE 
 SET token = EXCLUDED.token, created_at = EXCLUDED.created_at
`;
const values = [result.rows[0].user_id, token];

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
          templateId: 'd-3833bd4fdf7f4ec3b4ffb183ba6a5038',
          subject: 'Password Recovery',
          dynamicTemplateData: {
            token: `${token}`,
          }
        };

        try {
          await sgMail.send(msg);
          console.log('Password recovery email sent successfully');
          return res.status(201).json({ message: 'Password recovery email sent successfully' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Failed to send email' });
        }
    });
  } else {
    return res.status(409).json({ error: 'Email not found' });
  }
});
});

export default recoverPasswordRoute;

