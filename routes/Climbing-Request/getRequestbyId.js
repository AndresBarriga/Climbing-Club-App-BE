import express from 'express';
import Pool from 'pg-pool';
import dotenv from 'dotenv';

dotenv.config();

// Set up PostgreSQL connection
const isProduction = process.env.NODE_ENV === 'production';
const pgPool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgres://postgres:5813@localhost:5432/climbing',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const getRequestById = express.Router();

getRequestById.get('/:request_id',  (req, res) => {

    const requestId = req.params.request_id;
    console.log("Request id was touch with id :", requestId)
    const sqlQuery = `
      SELECT * FROM requests_info
      WHERE uid = $1 AND expiration_date > NOW()
    `;

    pgPool.query(sqlQuery, [requestId], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching request");
      }
      res.json(data.rows[0]); // Return the first row of the result
    });
});

export default getRequestById