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

// Create a new router
const deleteConversationRouter = express.Router();

deleteConversationRouter.delete('/', authenticateToken, (req, res) => {
    const { conversation_id } = req.body;
    const user_id = req.user_id;

    const sql = `
        UPDATE conversations
        SET 
            deleted_user1 = CASE WHEN user1_id = $1 THEN true ELSE deleted_user1 END,
            deleted_user2 = CASE WHEN user2_id = $1 THEN true ELSE deleted_user2 END
        WHERE conversation_id = $2
          AND (user1_id = $1 OR user2_id = $1);
    `;
    
    const values = [user_id, conversation_id];

    pgPool.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error deleting conversation");
        }

        if (result.rowCount === 0) {
            return res.status(404).json("Conversation not found or user not part of the conversation");
        }

        // The deletion was successful
        res.status(200).json("Conversation deleted successfully");
    });
});

export default deleteConversationRouter;