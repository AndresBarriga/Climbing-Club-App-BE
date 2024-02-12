import express from 'express';
import Pool from 'pg-pool';
import dotenv from 'dotenv';
import authenticateToken from '../profileRoutes/authenticateToken.js';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Create a new router for login
const postNotificationRead = express.Router();

postNotificationRead.put('/:notification_id', authenticateToken ,(req, res) => {

    const notificationId = req.params.notification_id; // Get notification_id from request params+

    const sql = `
    UPDATE notifications
    SET read = true
    WHERE notification_id = $1`

    const values = [notificationId];

    pgPool.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error updating notifications");
        }
        return res.json(data.rows);
    });
});


export default postNotificationRead;