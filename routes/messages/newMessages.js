import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from '../profileRoutes/authenticateToken.js';

// Set up PostgreSQL connection
const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
})

// Create a new router for login
const newMessagesRouter = express.Router();

newMessagesRouter.get('/', authenticateToken, (req, res) => {
   
    const userId = req.user_id;

    const getNewMessagesQuery = 'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND status = $2';

    pgPool.query(getNewMessagesQuery, [userId, 'unread'], (err, response) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } else {
            // Send the count of new messages in the response
            res.json({ newMessagesCount: parseInt(response.rows[0].count) });
        }
    });
});



export default newMessagesRouter;