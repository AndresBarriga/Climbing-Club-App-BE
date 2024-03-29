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

getAllRequestRouter.get('/forMultiplePlaces', authenticateToken, (req, res) => {
 const routeNames = req.query.routeNames.split(',').map(name => `'${name}'`).join(", ");
 const userId = req.user_id;
 
 const sqlQuery = `
   SELECT elem->>'name' as route_name, COUNT(*) > 0 as has_requests
   FROM requests_info
   WHERE NOT user_id = $1 
     AND EXISTS (
       SELECT 1
       FROM unnest(selected_routes::jsonb[]) elem
       WHERE elem->>'name' = ANY(ARRAY[$2])
     )
     AND expiration_date > now()
   GROUP BY route_name;
 `;
 
 pgPool.query(sqlQuery, [userId, routeNames], (err, data) => {
   if (err) {
     console.error(err);
     return res.status(500).json("Error fetching requests");
   }
   const routeRequests = data.rows.reduce((acc, row) => {
     acc[row.route_name] = row.has_requests;
     return acc;
   }, {});
   res.json(routeRequests);
 });
});

  
  

  export default getAllRequestRouter;