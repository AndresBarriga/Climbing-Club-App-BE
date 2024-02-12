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

// Create a new router for login
const notificationSettingsRouter = express.Router();

notificationSettingsRouter.get('/', authenticateToken, (req, res) => {
    const user_id = req.user_id;

    const sqlFetchSettings = `SELECT preference_value FROM notification_preferences WHERE user_id = $1`;
    const valuesFetchSettings = [user_id];

    pgPool.query(sqlFetchSettings, valuesFetchSettings, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error fetching settings");
        }

        if (result.rows.length > 0) {
            let settings;
            if (typeof result.rows[0].preference_value === 'string') {
                settings = JSON.parse(result.rows[0].preference_value);
            } else {
                settings = result.rows[0].preference_value;
            }
            res.status(200).json(settings);
        } else {
            // No settings found, send default settings
            res.status(200).json({
                favouritePlaces: true,
                friendsRequest: true,
                newLocation: true,
            });
        }
    });
});

notificationSettingsRouter.put('/', authenticateToken, (req, res) => {
    const { favouritePlaces, friendsRequest, newLocation } = req.body;
    const user_id = req.user_id;

    const preference_values = {
        favouritePlaces,
        friendsRequest,
        newLocation
    };

    const sqlCheckExistence = `SELECT * FROM notification_preferences WHERE user_id = $1`;
    const valuesCheckExistence = [user_id];

    pgPool.query(sqlCheckExistence, valuesCheckExistence, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error checking existence");
        }

        if (result.rows.length > 0) {
            // Row exists, update it
            const sqlUpdate = `UPDATE notification_preferences SET preference_value = $1 WHERE user_id = $2`;
            const valuesUpdate = [JSON.stringify(preference_values), user_id];

            pgPool.query(sqlUpdate, valuesUpdate, (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json("Error updating settings");
                }

                // The update was successful
                res.status(200).json("Preferences updated successfully");
            });
        } else {
            // Row doesn't exist, insert a new one
            const sqlInsert = `INSERT INTO notification_preferences (user_id, preference_type, preference_value, is_subscribed) VALUES ($1, $2, $3, $4)`;
            const valuesInsert = [user_id, 'profile', JSON.stringify(preference_values), true];

            pgPool.query(sqlInsert, valuesInsert, (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json("Error inserting settings");
                }

                // The insert was successful
                res.status(200).json("Preferences inserted successfully");
            });
        }
    });
});



export default notificationSettingsRouter;