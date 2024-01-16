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

  getAllRequestRouter.get('/forSpecificPlace', authenticateToken, (req, res) => {
    const routeName = req.query.routeName;
    const userId = req.user_id;

    const sqlQuery = `
        SELECT *
        FROM requests_info
        WHERE NOT user_id = $1 
          AND EXISTS (
            SELECT 1
            FROM unnest(selected_routes::jsonb[]) elem
            WHERE elem->>'name' ILIKE $2
          )
          AND expiration_date > now();
    `;

    pgPool.query(sqlQuery, [userId,`%${routeName}%`], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error fetching requests");
        }
        res.json(data.rows);
    });
});
  
  

  export default getAllRequestRouter;