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

const deleteRequestRouter = express.Router();

deleteRequestRouter.delete('/:request_id', authenticateToken, (req, res) => {
  // Extract the request_id from the request parameters
  const request_id = req.params.request_id;

  // SQL query to delete the request
  const deleteRequestQuery = 'DELETE FROM requests_info WHERE uid = $1';

  pgPool.query(deleteRequestQuery, [request_id], (deleteErr, deleteRes) => {
    if (deleteErr) {
      console.error(deleteErr);
      res.status(500).json({ error: 'Database error' });
    } else {
      // Send a success message in the response
      res.json({ message: 'Request deleted successfully' });
    }
  });
});

export default deleteRequestRouter;

