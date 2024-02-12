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

sendMessageRouter.post('/start', authenticateToken, async (req, res) => {
    const { receiver_id, content, request_id } = req.body;
    const sender_id = req.user_id;

    try {
        // Check for an existing conversation between the two users in either order
        const checkConversationSql = `
            SELECT conversation_id FROM conversations
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
            LIMIT 1;
        `;
        const checkConversationValues = [sender_id, receiver_id];
        const checkResult = await pgPool.query(checkConversationSql, checkConversationValues);

        let conversation_id;
        if (checkResult.rows.length > 0) {
            // An existing conversation was found
            conversation_id = checkResult.rows[0].conversation_id;
        } else {
            // No existing conversation found, insert a new one
            const insertConversationSql = `
                INSERT INTO conversations (user1_id, user2_id, deleted_user1, deleted_user2)
                VALUES ($1, $2, false, false)
                RETURNING conversation_id;
            `;
            const insertResult = await pgPool.query(insertConversationSql, checkConversationValues);
            conversation_id = insertResult.rows[0].conversation_id;
        }

        // Insert the new message using the determined conversation_id
        const messageSql = `
            INSERT INTO messages (conversation_id, sender_id, receiver_id, content, timestamp, status, request_uid, is_system_message, is_deleted)
            VALUES ($1, $2, $3, $4, NOW(), 'unread', $5, false, false);
        `;
        const messageValues = [conversation_id, sender_id, receiver_id, content, request_id];
        await pgPool.query(messageSql, messageValues);

        res.json({ message: "Message sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json("Error processing message");
    }
});

sendMessageRouter.post('/answer', authenticateToken, async (req, res) => {
    const { conversation_id, receiver_id, content, request_uid } = req.body;
    const sender_id = req.user_id;

    console.log("receiver" , receiver_id)

    try {
        // Update the conversation to mark it as active again
        const updateConversationSql = `
            UPDATE conversations
            SET deleted_user1 = false, deleted_user2 = false
            WHERE conversation_id = $1;
        `;
        await pgPool.query(updateConversationSql, [conversation_id]);

        // Insert the new message
        const messageSql = `
            INSERT INTO messages (conversation_id, sender_id, receiver_id, content, timestamp, status, request_uid, is_system_message, is_deleted)
            VALUES ($1, $2, $3, $4, NOW(), 'unread', $5, false, false);
        `;
        const messageValues = [conversation_id, sender_id, receiver_id, content, request_uid];
        console.log("SQL Query:", messageSql); // Log the SQL query
        console.log("Parameters:", messageValues)
        await pgPool.query(messageSql, messageValues);

        res.json({ message: "Message sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json("Message sending failed - error");
    }
});

sendMessageRouter.post('/noRequest', authenticateToken, async (req, res) => {
    const { receiver_id, content } = req.body;
    const sender_id = req.user_id;

    try {
        // Check for an existing conversation between the two users in either order
        const checkConversationSql = `
            SELECT conversation_id FROM conversations
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
            LIMIT 1;
        `;
        const checkConversationValues = [sender_id, receiver_id];
        const checkResult = await pgPool.query(checkConversationSql, checkConversationValues);

        let conversation_id;
        if (checkResult.rows.length > 0) {
            // An existing conversation was found
            conversation_id = checkResult.rows[0].conversation_id;
        } else {
            // No existing conversation found, insert a new one
            const insertConversationSql = `
                INSERT INTO conversations (user1_id, user2_id)
                VALUES ($1, $2)
                RETURNING conversation_id;
            `;
            const insertResult = await pgPool.query(insertConversationSql, checkConversationValues);
            conversation_id = insertResult.rows[0].conversation_id;
        }

        // Insert the new message using the determined conversation_id
        const messageSql = `
            INSERT INTO messages (conversation_id, sender_id, receiver_id, content, timestamp, status, is_system_message, is_deleted)
            VALUES ($1, $2, $3, $4, NOW(), 'unread', false, false);
        `;
        const messageValues = [conversation_id, sender_id, receiver_id, content];

        await pgPool.query(messageSql, messageValues);

        res.json({ message: "Message sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json("Message sending failed - error");
    }
});

export default sendMessageRouter;