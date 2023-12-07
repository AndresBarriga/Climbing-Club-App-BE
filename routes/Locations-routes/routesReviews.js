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

const reviewsRouter = express.Router();

reviewsRouter.post('/', authenticateToken, (req, res) => {
  const { route_id, stars, comment } = req.body;
  const user_id = req.user_id;


  console.log("route review was hit", route_id, user_id,stars, comment)
  const addReviewQuery = 'INSERT INTO routes_reviews (route_id, user_id, stars, comment) VALUES ($1, $2, $3, $4)';

  pgPool.query(addReviewQuery, [route_id, user_id, stars, comment], (postErr, postRes) => {
    if (postErr) {
      console.error(postErr);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ message: 'Review added successfully' });
    }
  });
});


reviewsRouter.get('/:route_id', authenticateToken, (req, res) => {
    const route_id = req.params.route_id;
  
    const getReviewsQuery = `
      SELECT routes_reviews.*, users.name, users.last_name, users.profile_picture 
      FROM routes_reviews 
      JOIN users ON routes_reviews.user_id = users.user_id 
      WHERE route_id = $1
    `;
  
    pgPool.query(getReviewsQuery, [route_id], (getErr, getRes) => {
      if (getErr) {
        console.error(getErr);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json(getRes.rows);
      }
    });
  });

export default reviewsRouter;