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
const getNotificationsRouter = express.Router();

getNotificationsRouter.get('/', authenticateToken ,(req, res) => {
    const userId = req.user_id;
    const sql = `
    SELECT * FROM notifications 
    WHERE user_id = $1 AND read = false
`;

    const values = [userId];

    pgPool.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error fetching notifications");
        }
        return res.json(data.rows);
    });
});

export default getNotificationsRouter;