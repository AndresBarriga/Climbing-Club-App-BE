import express from 'express';
import Pool from 'pg-pool';
import authenticateToken from './authenticateToken.js';

const pgPool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "climbing",
  password: "5813",
  port: 5432,
});

const initialUserPreferencesRouter = express.Router();

initialUserPreferencesRouter.post('/', authenticateToken, (req, res) => {
    console.log('Initial preferences route hit');
    const user_id = req.user_id;
    console.log(user_id)
    const { gender, birthday, location, climbingStyle, belayerDevice, climberType, material, climbingGradesBoulder, climbingGradesClimbing, favoriteClimbingDestinations, routePreferences, climbingPhilosophy, routeWishList } = req.body;

    const sql = `INSERT INTO user_preferences (user_id, gender, birthday, location, climbing_style, preferred_belayer_device, type_of_climber, climbing_equipment, climbing_grades_boulder, climbing_grades_climbing, favorite_climbing_destinations, route_preferences, climbing_philosophy, route_wish_list) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
    const values = [user_id, gender, birthday, location, climbingStyle, belayerDevice, climberType, material, climbingGradesBoulder, climbingGradesClimbing, favoriteClimbingDestinations, routePreferences, climbingPhilosophy, routeWishList];

    pgPool.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error saving user preferences");
        }
        const sqlUpdate = `UPDATE users SET initial_preferences = true WHERE user_id = $1`;
        const valuesUpdate = [user_id];
        
        pgPool.query(sqlUpdate, valuesUpdate, (errUpdate, dataUpdate) => {
            console.log('errUpdate:', errUpdate);
    console.log('dataUpdate:', dataUpdate);
            if (errUpdate) {
                console.error(errUpdate);
                return res.status(500).json("Error updating user preferences");
            }
      
        return res.json("User preferences saved successfully");
    });
    });
});

export default initialUserPreferencesRouter;