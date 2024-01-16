import express from 'express';
import Pool from 'pg-pool';
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
 connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
 ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const createPasswordRoute = express.Router();

createPasswordRoute.get('/check-token', (req, res) => {
    const token = req.headers['authorization'].replace('Bearer ', '');
   
    // SQL query to find the user based on the token
    const sql = "SELECT * FROM users WHERE token = $1";
    const values = [token];
   
    // Execute the SQL query
    pgPool.query(sql, values, (err, result) => {
        // Handle any errors during the query
        if (err) {
          return res.status(500).json({ error: 'Failed to find user' });
        }
     
        // If the query is successful, check if the user exists
        const user = result.rows[0];
     
        if (!user) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
     
        // If the user exists, return a success response
        return res.status(200).json({ message: 'Token is valid' });
      });
   });

   createPasswordRoute.get('/check-recoverpassword-token', (req, res) => {
    const token = req.headers['authorization'].replace('Bearer ', '');
   
    // SQL query to find the user based on the token
    const sql = "SELECT * FROM recover_password WHERE token = $1";
    const values = [token];
   
    // Execute the SQL query
    pgPool.query(sql, values, (err, result) => {
        // Handle any errors during the query
        if (err) {
          return res.status(500).json({ error: 'Failed to find user' });
        }
     
        // If the query is successful, check if the user exists
        const user = result.rows[0];
     
        if (!user) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
 
        // Check if the token is less than 30 minutes old
        const tokenAgeInMinutes = (Date.now() - new Date(user.created_at).getTime()) / 60000;
        if (tokenAgeInMinutes > 30) {
          return res.status(401).json({ error: 'Token has expired' });
        }
     
        // If the user exists and the token is valid, return a success response
        return res.status(200).json({ message: 'Token is valid' });
      });
   });
   

createPasswordRoute.post('/reset-password', (req, res) => {
   const { password } = req.body;
   var token = req.headers['authorization'].replace('Bearer ', '');

   // SQL query to find the user based on the token
   const sql = "SELECT * FROM recover_password WHERE token = $1";
   const values = [token];

   // Execute the SQL query
   pgPool.query(sql, values, async (err, result) => {
       // Handle any errors during the query
       if (err) {
           return res.status(500).json({ error: 'Failed to find user' });
       }

       // If the query is successful, check if the user exists
       const user = result.rows[0];

       if (!user) {
           return res.status(401).json({ error: 'Invalid or expired token' });
       }

       // Check if the token is less than 30 minutes old
       const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
       const currentTimeInMilliseconds = new Date().getTime();
       const tokenCreatedAtInMilliseconds = new Date(user.created_at).getTime();

       if (currentTimeInMilliseconds - tokenCreatedAtInMilliseconds > thirtyMinutesInMilliseconds) {
           return res.status(401).json({ error: 'Token has expired' });
       }

       // Hash the password and update the user's record
       const hashedPassword = await bcrypt.hash(password, 10);
       console.log('Hashed password:', hashedPassword);

       const updateSql = "UPDATE users SET password = $1 WHERE user_id = $2"
       console.log('Executing SQL query:', updateSql);
       const updateValues = [hashedPassword, user.user_id];

       pgPool.query(updateSql, updateValues, (err, result) => {
           if (err) {
               console.error('Update password error:', err);
               return res.status(500).json({ error: 'Failed to update password' });
           }

           console.log('Password updated successfully. Result:', result);
           return res.status(200).json({ message: 'Password updated successfully' });
       });
   });
});



// Define the POST route for creating a password
createPasswordRoute.post('/', (req, res) => {
    const { password } = req.body;
    var token = req.headers['authorization'].replace('Bearer ', '');
    // SQL query to find the user based on the token
    const sql = "SELECT * FROM users WHERE token = $1";
    const values = [token];
   
    // Execute the SQL query
    pgPool.query(sql, values, async (err, result) => {
      // Handle any errors during the query
      if (err) {
        return res.status(500).json({ error: 'Failed to find user' });
      }
   
      // If the query is successful, validate the token
      const user = result.rows[0];


      if (!user || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(user.token))) {
        return res.status(401).json({ error: 'Invalid token' });
      }
   
      // Hash the password and update the user's record
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hashed password:', hashedPassword);


      const updateSql =  "UPDATE users SET password = $1, token = NULL WHERE user_id = $2"
      console.log('Executing SQL query:', updateSql);
      const updateValues = [hashedPassword, user.user_id];
   
      pgPool.query(updateSql, updateValues, (err, result) => {
        if (err) {
            console.error('Update password error:', err);
          return res.status(500).json({ error: 'Failed to update password' });
        }

        console.log('Password updated successfully. Result:', result);

   
        // Update the user's status to "active"
        const updateStatusSql = "UPDATE users SET active = $1 WHERE user_id = $2";
        console.log('Executing SQL query:', updateStatusSql);
        const updateStatusValues = [true, user.user_id];
   
        pgPool.query(updateStatusSql, updateStatusValues, (err, result) => {
          if (err) {
            console.error('Update status error:', err);
            return res.status(500).json({ error: 'Failed to update status' });
          }
   
          console.log('Status updated successfully. Result:', result)
          return res.status(200).json({ message: 'Password and status updated successfully' });
        });
      });
    });
   });


   createPasswordRoute.post('/new-password', (req, res) => {
    const { password } = req.body;
    var token = req.headers['authorization'].replace('Bearer ', '');
 
    // SQL query to find the user based on the token
    const sql = "SELECT * FROM recover_password WHERE token = $1";
    const values = [token];
 
    // Execute the SQL query
    pgPool.query(sql, values, async (err, result) => {
        // Handle any errors during the query
        if (err) {
            return res.status(500).json({ error: 'Failed to find user' });
        }
 
        // If the query is successful, check if the user exists
        const user = result.rows[0];
 
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
 
        // Check if the token is less than 30 minutes old
      const tokenAgeInMinutes = (Date.now() - new Date(user.created_at).getTime()) / 60000;
      if (tokenAgeInMinutes > 30) {
          return res.status(401).json({ error: 'Token has expired' });
      }
 
        // Hash the password and update the user's record
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
 
        const updateSql = "UPDATE users SET password = $1 WHERE user_id = $2"
        console.log('Executing SQL query:', updateSql);
        const updateValues = [hashedPassword, user.user_id];
 
        pgPool.query(updateSql, updateValues, (err, result) => {
            if (err) {
                console.error('Update password error:', err);
                return res.status(500).json({ error: 'Failed to update password' });
            }
 
            console.log('Password updated successfully. Result:', result);
            return res.status(200).json({ message: 'Password updated successfully' });
        });
    });
 });


export default createPasswordRoute
