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
const sendMessageRouter = express.Router();

sendMessageRouter.post('/start', authenticateToken, (req, res) => {
    const { receiver_id, content, request_id } = req.body;
    const sender_id = req.user_id;

    const conversationSql = "INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING conversation_id";
    const conversationValues = [sender_id, receiver_id];
    pgPool.query(conversationSql, conversationValues, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Conversation start failed - error");
        }
        const conversation_id = data.rows[0].conversation_id;
        // Continue to insert the message

        const messageSql = "INSERT INTO messages ( conversation_id, sender_id, receiver_id, content, timestamp, status, request_uid, is_system_message, is_deleted) VALUES ($1, $2, $3, $4,  NOW(), 'unread', $5, false, false)";
        const messageValues = [ conversation_id, sender_id, receiver_id, content, request_id];
        
        pgPool.query(messageSql, messageValues, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json("Message sending failed - error");
            }
            return res.json({ message: "Message sent successfully" });
        });
        
    });

});

sendMessageRouter.post('/answer', authenticateToken, (req, res) => {
    const { conversation_id, receiver_id, content, request_uid } = req.body;
    const sender_id = req.user_id;

    const messageSql = "INSERT INTO messages ( conversation_id, sender_id, receiver_id, content, timestamp, status, request_uid, is_system_message, is_deleted) VALUES ($1, $2, $3, $4,  NOW(), 'unread', $5, false, false)";
    const messageValues = [ conversation_id, sender_id, receiver_id, content, request_uid];
    
    pgPool.query(messageSql, messageValues, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Message sending failed - error");
        }
        return res.json({ message: "Message sent successfully" });
    });
});

export default sendMessageRouter;