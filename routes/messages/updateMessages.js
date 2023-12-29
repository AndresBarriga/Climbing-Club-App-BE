import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from '../profileRoutes/authenticateToken.js';
import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Create a new router for login
const updateMessagesRouter = express.Router();

updateMessagesRouter.put('/', authenticateToken, (req, res) => {
    const { conversation_id, receiver_id } = req.body;
    const sql = `
        UPDATE messages
        SET status = 'read'
        WHERE conversation_id = $1
          AND receiver_id = $2;
    `;
    
    const values = [conversation_id, receiver_id];

    pgPool.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error updating messages");
        }

        // The update was successful
        res.status(200).json("Messages updated successfully");
    });
});





export default updateMessagesRouter;