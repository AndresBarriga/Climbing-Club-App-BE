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

const getAllRequestRouter = express.Router();

getAllRequestRouter.get('/otherUsers', authenticateToken, (req, res) => {
    
    const userId = req.user_id;
  
    const sqlQuery = `
      SELECT * FROM requests_info
      WHERE user_id != $1 AND expiration_date > NOW()
    `;
  
    pgPool.query(sqlQuery, [userId], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching open requests");
      }
      res.json(data.rows);
    });
  });

  export default getAllRequestRouter;