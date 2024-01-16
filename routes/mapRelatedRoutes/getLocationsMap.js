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

const locationsMapRouter = express.Router();

locationsMapRouter.get('/', (req, res) => {
    const sqlQuery = `SELECT name, style, number_routes, route_style, x_axis, y_axis FROM routes`;
    
    pgPool.query(sqlQuery, (err, dataRoutes) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching routes");
      }  
      res.json(dataRoutes.rows);
    
    });
   });

   locationsMapRouter.get('/:name', (req, res) => {
    
    const routeName = req.params.name;
    console.log("Route was hit, routename is", routeName)
    const sqlQueryRoutes = `SELECT area FROM routes WHERE name = $1`;
    const sqlQueryAreas = `SELECT regions, country FROM areas WHERE name = $1`;
   
    pgPool.query(sqlQueryRoutes, [routeName], (err, dataRoutes) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching routes");
      }
   
      const area = dataRoutes.rows[0].area;
   
      pgPool.query(sqlQueryAreas, [area], (err, dataAreas) => {
        if (err) {
          console.error(err);
          return res.status(500).json("Error fetching areas");
        }
   
        const result = {
          area: area,
          regions: dataAreas.rows[0].regions,
          country: dataAreas.rows[0].country
        };
   
        res.json(result);
      });
    });
   });


   locationsMapRouter.get('/coordinates/:region', (req, res) => {
    const regionName = req.params.region;
    const sqlQueryCoordinates = `SELECT x_axis, y_axis FROM regions WHERE name = $1`;
   
    pgPool.query(sqlQueryCoordinates, [regionName], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching coordinates");
      }
   
        // Check if any rows were returned
        if (data.rows.length === 0) {
            return res.status(404).json("Region not found");
        }

        // Extract coordinates from the first row
        const { x_axis, y_axis } = data.rows[0];

        // Send coordinates in the response
        res.json({ x_axis, y_axis });
    });
   });


   locationsMapRouter.get('/coordinates/:area', (req, res) => {
    const areaName = req.params.area;
    const sqlQueryCoordinates = `SELECT x_axis, y_axis FROM areas WHERE name = $1`;
   
    pgPool.query(sqlQueryCoordinates, [areaName], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json("Error fetching coordinates");
      }
   
        // Check if any rows were returned
        if (data.rows.length === 0) {
            return res.status(404).json("Area not found");
        }

        // Extract coordinates from the first row
        const { x_axis, y_axis } = data.rows[0];

        // Send coordinates in the response
        res.json({ x_axis, y_axis });
    });
   });

   export default locationsMapRouter;