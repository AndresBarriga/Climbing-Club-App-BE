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
const getMessageRouter = express.Router();

getMessageRouter.get('/conversations', authenticateToken, (req, res) => {
    const userId = req.user_id;

    const sql = `
    SELECT c.*, m.*, u.name, u.last_name, u.profile_picture
    FROM conversations c
    LEFT JOIN messages m ON c.conversation_id = m.conversation_id
    LEFT JOIN users u ON u.user_id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END
    WHERE c.user1_id = $1 OR c.user2_id = $1
    GROUP BY c.conversation_id, m.message_id, u.user_id
    ORDER BY m.timestamp DESC
`;
  const values = [userId];

  pgPool.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Error fetching conversations");
    }

    res.json({ userId, conversations: data.rows });
  });
});


getMessageRouter.get('/:conversationId/messages', (req, res) => {
    const conversationId = req.params.conversationId;
  
    const sql = 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC';
    const values = [conversationId];
  
    pgPool.query(sql, values, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching messages");
      }
  
      res.json(data.rows);
    });
  });



export default getMessageRouter;