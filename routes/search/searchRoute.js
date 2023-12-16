import express from 'express';
import Pool from 'pg-pool';



const pgPool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "climbing",
    password: "5813",
    port: 5432,
  })
  
  const searchRouter = express.Router();

  searchRouter.get('/', async (req, res) => {
    const searchTerm = req.query.term;
    const query = `
    SELECT name, 'Country' as type FROM countries WHERE name ILIKE $1
    UNION ALL
    SELECT name, 'Region' as type FROM regions WHERE name ILIKE $1
    UNION ALL
    SELECT name, 'Area' as type FROM areas WHERE name ILIKE $1
    UNION ALL
    SELECT name, 'Route' as type FROM routes WHERE name ILIKE $1
  `;
    const values = [`%${searchTerm}%`];
    try {
      const result = await pgPool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while searching.' });
    }
  });
  
export default searchRouter;